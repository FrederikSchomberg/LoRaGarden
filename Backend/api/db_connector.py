import json
import os
from pathlib import Path

from dotenv import load_dotenv
from influxdb_client import InfluxDBClient


# lädt immer die .env aus dem api-ordner, egal von wo das projekt gestartet wird
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_PATH)


class DBConnector:
    def __init__(self):
        # holt die komplette influx-konfiguration aus der .env
        self.url = os.getenv("INFLUX_URL", "").rstrip("/")
        self.token = os.getenv("INFLUX_TOKEN", "")
        self.org = os.getenv("INFLUX_ORG", "")
        self.bucket = os.getenv("INFLUX_BUCKET", "")
        self.measurement = os.getenv("INFLUX_MEASUREMENT", "")
        self.bed_tag = os.getenv("INFLUX_DEVICE_TAG", "")
        self.timeout = int(os.getenv("INFLUX_TIMEOUT_MS", "5000"))

        # links steht der name für die api und rechts das echte feld aus influx
        self.fields = {
            "temperature": os.getenv("INFLUX_FIELD_TEMPERATURE", ""),
            "soil_moisture": os.getenv(
                "INFLUX_FIELD_SOIL_MOISTURE",
                "",
            ),
            "soil_ec": os.getenv("INFLUX_FIELD_SOIL_EC", ""),
            "battery_voltage": os.getenv(
                "INFLUX_FIELD_BATTERY_VOLTAGE",
                "",
            ),
        }

    def check_connection(self):
        # fragt nur einen kleinen zeitraum ab, damit der test schnell fertig ist
        try:
            self._check_settings()
            query = (
                f"from(bucket: {self._text(self.bucket)}) "
                "|> range(start: -1m) |> limit(n: 1)"
            )

            # with macht den client danach automatisch wieder zu
            with self._client() as client:
                client.query_api().query(query=query, org=self.org)

            return True
        except Exception as error:
            # die api darf auch starten, wenn influx gerade nicht erreichbar ist
            print(f"influxdb ist gerade nicht erreichbar: {error}")
            return False

    def get_latest_values(self, bed_name):
        # nutzt dieselbe sammelabfrage auch für ein einzelnes beet
        result = self.get_latest_values_for_beds([bed_name])
        return result[bed_name]

    def get_latest_values_for_beds(self, bed_names):
        # prüft erst die .env, damit fehlende einträge direkt auffallen
        self._check_settings()

        # entfernt doppelte namen, behält aber die reihenfolge für die api bei
        bed_names = list(dict.fromkeys(bed_names))
        if not bed_names:
            return {}

        # baut die listen für die beiden influx-filter zusammen
        bed_values = ", ".join(self._text(name) for name in bed_names)
        field_values = ", ".join(
            self._text(name) for name in self.fields.values()
        )

        # ein leeres measurement bedeutet, dass im ganzen bucket gesucht wird
        measurement_filter = ""
        if self.measurement:
            measurement_filter = (
                "  |> filter(fn: (r) => r._measurement == "
                f"{self._text(self.measurement)})\n"
            )

        # holt pro beet und feld genau den neuesten vorhandenen wert
        query = f'''\
from(bucket: {self._text(self.bucket)})
  |> range(start: -30d)
{measurement_filter}  |> filter(fn: (r) => exists r[{self._text(self.bed_tag)}] and contains(value: r[{self._text(self.bed_tag)}], set: [{bed_values}]))
  |> filter(fn: (r) => contains(value: r._field, set: [{field_values}]))
  |> group(columns: [{self._text(self.bed_tag)}, "_field"])
  |> sort(columns: ["_time"])
  |> last()
'''.strip()

        # schickt eine gemeinsame abfrage für carla, berta und ilse an influx
        with self._client() as client:
            tables = client.query_api().query(
                query=query,
                org=self.org,
            )

        # legt alle felder vorher mit none an, falls mal ein messwert fehlt
        result = {
            bed_name: {
                "name": bed_name,
                "values": {
                    api_name: None for api_name in self.fields
                },
                "updated_at": None,
            }
            for bed_name in bed_names
        }
        field_by_db_name = {
            db_name: api_name
            for api_name, db_name in self.fields.items()
        }
        newest_by_bed = {bed_name: None for bed_name in bed_names}

        # sortiert jeden influx-datensatz beim passenden beet und feld ein
        for table in tables:
            for record in table.records:
                bed_name = record.values.get(self.bed_tag)
                api_name = field_by_db_name.get(record.get_field())

                if bed_name not in result or api_name is None:
                    continue

                result[bed_name]["values"][api_name] = record.get_value()

                # merkt sich pro beet den neuesten zeitpunkt von allen vier feldern
                record_time = record.get_time()
                newest = newest_by_bed[bed_name]
                if record_time and (newest is None or record_time > newest):
                    newest_by_bed[bed_name] = record_time

        # macht aus den zeitpunkten strings, die fastapi direkt als json senden kann
        for bed_name, newest in newest_by_bed.items():
            if newest:
                result[bed_name]["updated_at"] = newest.isoformat()

        return result

    def _check_settings(self):
        # measurement darf leer bleiben, alle anderen werte werden gebraucht
        settings = {
            "INFLUX_URL": self.url,
            "INFLUX_TOKEN": self.token,
            "INFLUX_ORG": self.org,
            "INFLUX_BUCKET": self.bucket,
            "INFLUX_DEVICE_TAG": self.bed_tag,
            "INFLUX_FIELD_TEMPERATURE": self.fields["temperature"],
            "INFLUX_FIELD_SOIL_MOISTURE": self.fields[
                "soil_moisture"
            ],
            "INFLUX_FIELD_SOIL_EC": self.fields["soil_ec"],
            "INFLUX_FIELD_BATTERY_VOLTAGE": self.fields[
                "battery_voltage"
            ],
        }
        missing = [
            name for name, value in settings.items() if not value
        ]

        # zeigt direkt an, welche zeile in der .env noch fehlt
        if missing:
            raise ValueError(
                "fehlt noch in der .env: " + ", ".join(missing)
            )

    def _client(self):
        # baut für jede kurze abfrage einen client mit begrenzter wartezeit
        return InfluxDBClient(
            url=self.url,
            token=self.token,
            org=self.org,
            timeout=self.timeout,
        )

    @staticmethod
    def _text(value):
        # setzt strings sicher in flux ein, auch wenn ein feld ein % enthält
        return json.dumps(value)