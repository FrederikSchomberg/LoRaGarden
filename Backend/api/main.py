from contextlib import asynccontextmanager

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
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
        "substrate": "Sand",
    },
    "0060294B": {
        "city": "Bochum",
        "area": "RUB",
        "place": "Botanischer Garten",
        "bed": "Berta",
        "bed_position": "Unten",
        "substrate": "5 % Pflanzenkohle",
    },
    "00612B28": {
        "city": "Bochum",
        "area": "RUB",
        "place": "Botanischer Garten",
        "bed": "Berta",
        "bed_position": "Oben",
        "substrate": "5 % Pflanzenkohle",
    },
    "0060294C": {
        "city": "Bochum",
        "area": "RUB",
        "place": "Botanischer Garten",
        "bed": "Carla",
        "bed_position": "Unten",
        "substrate": "10 % Pflanzenkohle"
    },
    "00612B1F": {
        "city": "Bochum",
        "area": "RUB",
        "place": "Botanischer Garten",
        "bed": "Carla",
        "bed_position": "Oben",
        "substrate": "10 % Pflanzenkohle"
    },
    "0060294E": {
		"city": "Bochum",
		"area": "RUB",
		"place": "Botanischer Garten",
		"bed": "Ilse",
		"bed_position": "Unten",
        "substrate": "Sand"
		}
}


# hier stehen nur infos, die nicht als messwert aus influx kommen
BEDS = {
    "carla": {
        "substrate": "10 % Pflanzenkohle",
        "unten": "0060294C",
        "oben": "00612B1F"
    },
    "berta": {
        "substrate": "5 % Pflanzenkohle",
        "unten": "0060294B",
        "oben" : "00612B28"
    },
    "ilse": {
        "substrate": "Sand",
        "oben": "0060294A",
        "unten": "0060294E" 
    },
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


def query_sensor_from_database(sensor_id):
    # fragt einen einzelnen sensor per id aus influx ab
    try:
        return db_connector.get_latest_values_by_id(sensor_id)
    except Exception as error:
        print(f"influxdb-abfrage fehlgeschlagen: {error}")
        raise HTTPException(
            status_code=503,
            detail="InfluxDB ist gerade nicht erreichbar.",
        ) from error


def query_all_sensors_from_database():
    # fragt alle bekannten sensoren per id aus influx ab
    try:
        all_ids = list(SENSORS.keys())
        return db_connector.get_latest_values_by_ids(all_ids)
    except Exception as error:
        print(f"influxdb-abfrage fehlgeschlagen: {error}")
        raise HTTPException(
            status_code=503,
            detail="InfluxDB ist gerade nicht erreichbar.",
        ) from error


def build_sensor_response(sensor_id, db_data):
    # baut die api-antwort für einen einzelnen sensor zusammen
    metadata = SENSORS[sensor_id]
    return {
        "sensor_id": sensor_id,
        **metadata,
        "values": db_data["values"],
        "updated_at": db_data["updated_at"],
    }


def build_bed_response(bed_name, bed_config, all_db_data):
    # baut die api-antwort für ein beet mit oben/unten zusammen
    sensors = []
    for position in ("oben", "unten"):
        sid = bed_config.get(position)
        if sid and sid in all_db_data:
            sensors.append(build_sensor_response(sid, all_db_data[sid]))
    return {
        "name": bed_name,
        "substrate": bed_config["substrate"],
        "sensors": sensors,
    }


@app.get("/")
async def root():
    return {
        "message": "Smart Gardening API läuft",
        "data_source": "InfluxDB",
    }


@app.get("/api/health")
async def get_health():
    # dieser endpoint zeigt getrennt, ob api und datenbank erreichbar sind
    return {
        "api": "ok",
        "database": {
            "type": "InfluxDB",
            "connected": db_connector.check_connection(),
        },
    }


@app.get("/api/beds")
async def get_beds():
    # liefert alle beete mit allen sensoren
    all_db_data = query_all_sensors_from_database()
    beds = []
    for bed_name, bed_config in BEDS.items():
        beds.append(build_bed_response(bed_name, bed_config, all_db_data))
    return {"beds": beds}


@app.get("/api/beds/{bed_name}/{bed_position}")
async def get_bed(bed_name: str, bed_position: str):
    # liefert die daten eines einzelnen sensors anhand beet-name und position
    # der url-name darf klein sein, in BEDS steht alles klein
    bed_key = bed_name.lower()
    position_key = bed_position.lower()

    if bed_key not in BEDS:
        raise HTTPException(
            status_code=404,
            detail=f"Beet '{bed_name}' nicht gefunden. Vorhandene Beete: {', '.join(BEDS.keys())}.",
        )

    bed_config = BEDS[bed_key]
    sensor_id = bed_config.get(position_key)

    if sensor_id is None:
        raise HTTPException(
            status_code=404,
            detail=f"Position '{bed_position}' nicht gefunden. Vorhandene Positionen: oben, unten.",
        )

    # fragt direkt per sensor-id aus influx ab
    db_data = query_sensor_from_database(sensor_id)

    if db_data is None:
        raise HTTPException(
            status_code=404,
            detail="Keine Daten für diesen Sensor gefunden.",
        )

    return build_sensor_response(sensor_id, db_data)


@app.get("/api/dashboard")
async def get_dashboard():
    # behält die alte dashboard-url, liefert jetzt aber influx-daten statt mqtt
    all_db_data = query_all_sensors_from_database()
    beds = []
    for bed_name, bed_config in BEDS.items():
        beds.append(build_bed_response(bed_name, bed_config, all_db_data))
    return {
        "database": {
            "type": "InfluxDB",
            "connected": True,
        },
        "beds": beds,
    }