from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from db_connector import DBConnector


# die ids bleiben metadaten, die influx-abfrage läuft über tag "name"
SENSORS = {
    "0060294A": {
        "city": "Bochum",
        "area": "RUB",
        "place": "Botanischer Garten",
        "bed": "Ilse",
        "bed_position": "Oben",
    },
    "0060294B": {
        "city": "Bochum",
        "area": "RUB",
        "place": "Botanischer Garten",
        "bed": "Berta",
        "bed_position": "Unten",
    },
    "00612B28": {
        "city": "Bochum",
        "area": "RUB",
        "place": "Botanischer Garten",
        "bed": "Berta",
        "bed_position": "Oben",
    },
    "0060294C": {
        "city": "Bochum",
        "area": "RUB",
        "place": "Botanischer Garten",
        "bed": "Carla",
        "bed_position": "Unten",
    },
    "00612B1F": {
        "city": "Bochum",
        "area": "RUB",
        "place": "Botanischer Garten",
        "bed": "Carla",
        "bed_position": "Oben",
    },
}


# hier stehen nur infos, die nicht als messwert aus influx kommen
BEDS = {
    "Carla": {
        "substrate": "10 % Pflanzenkohle",
        "sensor_ids": ["0060294C", "00612B1F"],
    },
    "Berta": {
        "substrate": "5 % Pflanzenkohle",
        "sensor_ids": ["0060294B", "00612B28"],
    },
    "Ilse": {
        "substrate": "Sand",
        "sensor_ids": ["0060294A"],
    },
}

BED_NAMES = list(BEDS)
BED_NAMES_BY_LOWERCASE = {
    name.lower(): name for name in BED_NAMES
}

db_connector = DBConnector()


@asynccontextmanager
async def lifespan(_app):
    # testet beim start einmal die db, beendet die api bei einem fehler aber nicht
    if db_connector.check_connection():
        print("influxdb ist verbunden")
    else:
        print("api läuft, aber influxdb ist noch nicht erreichbar")

    yield


app = FastAPI(
    title="Smart Gardening API",
    version="2.0.0",
    lifespan=lifespan,
)


# cors erlaubt dem getrennt gestarteten frontend die api-abfragen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def read_beds_from_database(bed_names):
    # fängt db-fehler an einer stelle ab und gibt der api einen sauberen statuscode
    try:
        return db_connector.get_latest_values_for_beds(bed_names)
    except Exception as error:
        print(f"influxdb-abfrage fehlgeschlagen: {error}")
        raise HTTPException(
            status_code=503,
            detail="InfluxDB ist gerade nicht erreichbar.",
        ) from error


def add_bed_metadata(database_bed):
    # ergänzt substrat und sensorpositionen zu den eigentlichen messwerten
    bed_name = database_bed["name"]
    bed_config = BEDS[bed_name]
    sensors = []

    for sensor_id in bed_config["sensor_ids"]:
        sensors.append(
            {
                "sensor_id": sensor_id,
                **SENSORS[sensor_id],
            }
        )

    return {
        "name": bed_name,
        "substrate": bed_config["substrate"],
        "sensors": sensors,
        "values": database_bed["values"],
        "updated_at": database_bed["updated_at"],
    }


def build_beds_payload(bed_names):
    # liest alle gewünschten beete mit einer einzigen influx-abfrage
    database_beds = read_beds_from_database(bed_names)
    return [
        add_bed_metadata(database_beds[bed_name])
        for bed_name in bed_names
    ]


@app.get("/")
def root():
    return {
        "message": "Smart Gardening API läuft",
        "data_source": "InfluxDB",
    }


@app.get("/api/health")
def get_health():
    # dieser endpoint zeigt getrennt, ob api und datenbank erreichbar sind
    return {
        "api": "ok",
        "database": {
            "type": "InfluxDB",
            "connected": db_connector.check_connection(),
        },
    }


@app.get("/api/beds")
def get_beds():
    return {
        "beds": build_beds_payload(BED_NAMES),
    }


@app.get("/api/beds/{bed_name}")
def get_bed(bed_name: str):
    # der url-name darf klein sein, an influx geht aber Carla, Berta oder Ilse
    exact_bed_name = BED_NAMES_BY_LOWERCASE.get(bed_name.lower())
    if exact_bed_name is None:
        raise HTTPException(
            status_code=404,
            detail="Beet nicht gefunden. Erlaubt: Carla, Berta oder Ilse.",
        )

    return build_beds_payload([exact_bed_name])[0]


@app.get("/api/dashboard")
def get_dashboard():
    # behält die alte dashboard-url, liefert jetzt aber influx-daten statt mqtt
    return {
        "database": {
            "type": "InfluxDB",
            "connected": True,
        },
        "beds": build_beds_payload(BED_NAMES),
    }