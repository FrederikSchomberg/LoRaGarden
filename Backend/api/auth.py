import os
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import bcrypt
import jwt
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from dotenv import load_dotenv


# .env aus dem api-ordner laden
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_PATH)

# jwt-konfiguration
JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))

INFLUX_URL = (os.getenv("INFLUX_URL_TEST") or os.getenv("INFLUX_URL", "")).rstrip("/")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN_TEST") or os.getenv("INFLUX_TOKEN", "")
INFLUX_ORG = os.getenv("INFLUX_ORG_TEST") or os.getenv("INFLUX_ORG", "")
USERS_BUCKET = (
    os.getenv("INFLUX_BUCKET_USER_TEST")
    or os.getenv("INFLUX_USERS_BUCKET")
    or os.getenv("INFLUX_BUCKET_USER", "users")
)


def _influx_client():
    # baut einen influxdb client für user abfragen
    return InfluxDBClient(
        url=INFLUX_URL,
        token=INFLUX_TOKEN,
        org=INFLUX_ORG,
        timeout=5000,
    )


def _check_auth_settings():
    # prüft ob alle nötigen auth einstellungen in der .env stehen
    settings = {
        "JWT_SECRET": JWT_SECRET,
        "INFLUX_URL": INFLUX_URL,
        "INFLUX_TOKEN": INFLUX_TOKEN,
        "INFLUX_ORG": INFLUX_ORG,
    }
    missing = [name for name, value in settings.items() if not value]
    if missing:
        raise ValueError(
            "auth: fehlt noch in der .env: " + ", ".join(missing)
        )


def hash_password(password: str) -> str:
    # hasht ein passwort mit bcrypt
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8")[:72], salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # vergleicht ein klartext passwort mit dem hash
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False



def create_access_token(email: str, name: str) -> str:
    # erstellt einen jwt token mit email und name als payload
    _check_auth_settings()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    payload = {
        "sub": email,
        "name": name,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    # dekodiert einen jwt token, gibt None zurück wenn ungültig oder abgelaufen
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_user_by_email(email: str) -> dict | None:
    # sucht einen user per email in der db
    _check_auth_settings()
    email_lower = email.lower().strip()

    # holt die email aus der db
    query = f'''\
from(bucket: {json.dumps(USERS_BUCKET)})
  |> range(start: 0)
  |> filter(fn: (r) => r._measurement == "user")
  |> filter(fn: (r) => r.email == {json.dumps(email_lower)})
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> group()
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 1)'''

    with _influx_client() as client:
        tables = client.query_api().query(query=query, org=INFLUX_ORG)

    for table in tables:
        for record in table.records:
            return {
                "email": record.values.get("email", email_lower),
                "name": record.values.get("name", ""),
                "password_hash": record.values.get("password_hash", ""),
                "created_at": record.get_time().isoformat() if record.get_time() else None,
            }

    return None


def create_user(email: str, name: str, password: str) -> dict:
    # legt einen neuen user an und gibt ihn zurück (ohne passwort-hash)
    _check_auth_settings()
    email_lower = email.lower().strip()

    # prüfen ob user schon existiert
    existing = get_user_by_email(email_lower)
    if existing:
        raise ValueError("Ein User mit dieser E-Mail existiert bereits.")

    password_hash = hash_password(password)
    now = datetime.now(timezone.utc)

    # "email" ist ein tag, "name" und "password_hash" sind felder
    point = (
        Point("user")
        .tag("email", email_lower)
        .field("name", name)
        .field("password_hash", password_hash)
        .time(now, WritePrecision.S)
    )

    with _influx_client() as client:
        write_api = client.write_api(write_options=SYNCHRONOUS)
        write_api.write(bucket=USERS_BUCKET, org=INFLUX_ORG, record=point)

    return {
        "email": email_lower,
        "name": name,
        "created_at": now.isoformat(),
    }
