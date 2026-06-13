from datetime import datetime, timezone
from copy import deepcopy
import json
import os
import threading

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import paho.mqtt.client as mqtt

# dotenv laden
load_dotenv()

# mqtt daten aus dotenv holen
MQTT_HOST = os.getenv("MQTT_HOST", "")
MQTT_PORT = int(os.getenv("MQTT_PORT") or "1883")
MQTT_USER = os.getenv("MQTT_USER", "")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "")

app = FastAPI()

# cors damit frontend backend abfragen kann
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# lock damit nicht alles gleichzeitig passiert
lock = threading.Lock()

# mqtt status merken
mqtt_status = {
    "connected": False,
}

# daten fürs dashboard
dashboard_data = {
    "s7": {
        "temperatur_ist": None,
        "temperatur_soll": None,
        "temperatur_differenz": None,
        "updated_at": None,
    }
}


# aktuelle zeit holen
def now_iso():
    return datetime.now(timezone.utc).isoformat()


# mqtt payload umwandeln
def parse_payload(payload_text: str):
    # leerzeichen wegmachen
    payload_text = payload_text.strip()

    # leere nachrichten raus
    if payload_text == "":
        return None

    # erstmal json probieren
    try:
        return json.loads(payload_text)
    except Exception:
        pass

    # danach zahl probieren
    try:
        return float(payload_text)
    except Exception:
        pass

    # sonst einfach text nehmen
    return payload_text


# daten je nach topic speichern
def update_dashboard(topic: str, value):
    timestamp = now_iso()

    # temperatur ist speichern
    if topic == "S7_1500/Temperatur/Ist":
        dashboard_data["s7"]["temperatur_ist"] = value
        dashboard_data["s7"]["updated_at"] = timestamp

    # temperatur soll speichern
    elif topic == "S7_1500/Temperatur/Soll":
        dashboard_data["s7"]["temperatur_soll"] = value
        dashboard_data["s7"]["updated_at"] = timestamp

    # temperatur differenz speichern
    elif topic == "S7_1500/Temperatur/Differenz":
        dashboard_data["s7"]["temperatur_differenz"] = value
        dashboard_data["s7"]["updated_at"] = timestamp


# wenn mqtt verbindet
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("MQTT verbunden")

        with lock:
            mqtt_status["connected"] = True
    else:
        print(f"MQTT Fehler: {rc}")

        with lock:
            mqtt_status["connected"] = False

        return

    # s7 temperatur topic erstmal ##########
    topic = "S7_1500/Temperatur/#"
    client.subscribe(topic)
    print(f"Subscribed: {topic}\n")


# wenn mqtt trennt
def on_disconnect(client, userdata, rc):
    print("MQTT getrennt")

    with lock:
        mqtt_status["connected"] = False


# wenn mqtt nachricht kommt
def on_message(client, userdata, msg):
    # topic holen
    topic = msg.topic

    # payload als text lesen
    payload_text = msg.payload.decode("utf-8", errors="replace")

    # payload umwandeln
    value = parse_payload(payload_text)

    # daten speichern
    with lock:
        mqtt_status["last_message_at"] = now_iso()
        update_dashboard(topic, value)

    # im terminal anzeigen
    print(f"{topic}: {value}")


# mqtt client bauen
mqtt_client = mqtt.Client(client_id="smart-gardening-api")

# mqtt callbacks setzen
mqtt_client.on_connect = on_connect
mqtt_client.on_disconnect = on_disconnect
mqtt_client.on_message = on_message

# login setzen
if MQTT_USER:
    mqtt_client.username_pw_set(MQTT_USER, MQTT_PASSWORD)


# startet mit fastapi
@app.on_event("startup")
def startup_event():
    print(f"Starte MQTT-Verbindung zu {MQTT_HOST}:{MQTT_PORT}")

    try:
        mqtt_client.connect_async(MQTT_HOST, MQTT_PORT, 60)
        mqtt_client.loop_start()

        print("MQTT-Verbindung wurde gestartet")

    except Exception as error:
        print(f"MQTT konnte nicht gestartet werden: {error}")


# stoppt wenn fastapi beendet wird
@app.on_event("shutdown")
def shutdown_event():
    mqtt_client.loop_stop()
    mqtt_client.disconnect()


# rootroute
@app.get("/")
def root():
    return {"message": "Smart Gardening API läuft"}


# route fürs dashboard
@app.get("/api/dashboard")
def get_dashboard():
    with lock:
        return {
            "mqtt": deepcopy(mqtt_status),
            "data": deepcopy(dashboard_data),
        }