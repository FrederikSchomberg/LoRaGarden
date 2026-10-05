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



def create_access_token(username: str, name: str) -> str:
    # erstellt den token für den eingeloggten user
    _check_auth_settings()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)

    payload = {
        "sub": username,
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


def get_user_by_username(username: str) -> dict | None:
    # sucht einen user über den benutzernamen
    _check_auth_settings()
    username_lower = username.lower().strip()

    query = f'''\
from(bucket: {json.dumps(USERS_BUCKET)})
  |> range(start: 0)
  |> filter(fn: (r) => r._measurement == "user")
  |> filter(fn: (r) => r.username == {json.dumps(username_lower)})
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> group()
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: 1)'''

    with _influx_client() as client:
        tables = client.query_api().query(query=query, org=INFLUX_ORG)

    for table in tables:
        for record in table.records:
            return {
                "username": record.values.get("username", username_lower),
                "name": record.values.get("name", ""),
                "password_hash": record.values.get("password_hash", ""),
                "created_at": record.get_time().isoformat() if record.get_time() else None,
            }

    return None


def create_user(username: str, name: str, password: str) -> dict:
    # legt einen user an falls er noch nicht existiert
    _check_auth_settings()
    username_lower = username.lower().strip()

    existing = get_user_by_username(username_lower)
    if existing:
        raise ValueError("User existiert bereits.")

    password_hash = hash_password(password)
    now = datetime.now(timezone.utc)

    point = (
        Point("user")
        .tag("username", username_lower)
        .field("name", name)
        .field("password_hash", password_hash)
        .time(now, WritePrecision.S)
    )

    with _influx_client() as client:
        write_api = client.write_api(write_options=SYNCHRONOUS)
        write_api.write(bucket=USERS_BUCKET, org=INFLUX_ORG, record=point)

    return {
        "username": username_lower,
        "name": name,
        "created_at": now.isoformat(),
    }
    
def create_default_users():
    # die beiden accounts werden nur angelegt wenn sie noch nicht existieren
    users = [
        {
            "username": "admin",
            "name": "Admin",
            "password": os.getenv("ADMIN_PASSWORD", ""),
        },
        {
            "username": "nachhaltigkeit",
            "name": "Nachhaltigkeit",
            "password": os.getenv("NACHHALTIGKEIT_PASSWORD", ""),
        },
        {
            "username": "loragarden",
            "name": "Loragarden",
            "password": os.getenv("LORAGARDEN_PASSWORD", ""),
        }
    ]

    for user in users:
        if not user["password"]:
            print(f"passwort für {user['username']} fehlt in der .env")
            continue

        if get_user_by_username(user["username"]):
            continue

        create_user(
            username=user["username"],
            name=user["name"],
            password=user["password"],
        )

        print(f"user {user['username']} wurde angelegt")