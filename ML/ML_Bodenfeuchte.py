"""
Bodenfeuchte-Vorhersage - komplettes Modell
Daten kommen jetzt DIREKT ueber den InfluxDB DB-Connector (influxdb-client),
nicht mehr ueber Grafana.

pip install influxdb-client pandas numpy scikit-learn matplotlib
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from influxdb_client import InfluxDBClient
from config import INFLUX_TOKEN
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

# 1) KONFIGURATION
#Zugangsdaten
INFLUX_URL = "http://192.168.65.15:8086"       
INFLUX_ORG = "BO"                       

INFLUX_BUCKET = "rooftop"
MEASUREMENT = "mqtt_consumer"
BED_TAG = "bed"

# echte Namen unserer drei Beete + wieviel Kohle drin ist
BEDS = {
    "Carla": "10 % Kohle",
    "Berta": "5 % Kohle",
    "Ilse":  "0 % Kohle",
}

# echte Feldnamen in InfluxDB -> die Namen die im restlichen Skript benutzt werden
FIELD_MOISTURE = "soil_moisture_%"
FIELD_TEMP = "soil_temperature_c"
FIELD_EC = "soil_ec"

HORIZONT_H = 12   # wie viele Stunden voraus vorhergesagt wird
ZEITRAUM_TAGE = 60  # wie viele Tage rueckwaerts geladen werden


# 2) DATEN DIREKT UEBER DEN DB-CONNECTOR HOLEN

def hole_daten():
    """Fragt moisture, temperature, ec fuer alle Beete DIREKT aus InfluxDB ab.
    Kein Umweg mehr ueber Grafana - der Connector spricht die Datenbank
    direkt an und gibt das Ergebnis schon fast als pandas-Tabelle zurueck.
    """
    flux_query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: -{ZEITRAUM_TAGE}d)
      |> filter(fn: (r) => r._measurement == "{MEASUREMENT}")
      |> filter(fn: (r) => r._field == "{FIELD_MOISTURE}" or r._field == "{FIELD_TEMP}" or r._field == "{FIELD_EC}")
      |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> rename(columns: {{"{FIELD_MOISTURE}": "moisture", "{FIELD_TEMP}": "temperature", "{FIELD_EC}": "ec"}})
    '''

    # Verbindung zur Datenbank aufbauen und Query direkt ausfuehren
    with InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG) as client:
        df = client.query_api().query_data_frame(flux_query)

    # query_data_frame kann bei mehreren Frames eine LISTE von DataFrames
    # zurueckgeben statt einem einzigen -> dann zusammenfuehren
    if isinstance(df, list):
        df = pd.concat(df, ignore_index=True)

    return df


# ---------------------------------------------------------------------------
# HAUPTPROGRAMM
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    df = hole_daten()
    print("\n--- Spalten, die zurueckkamen ---")
    print(df.columns.tolist())
    print("\n--- Erste Zeilen ---")
    print(df.head())