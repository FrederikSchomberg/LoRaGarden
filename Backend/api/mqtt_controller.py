import os
from pathlib import Path
from threading import Event
from uuid import uuid4

from dotenv import load_dotenv
import paho.mqtt.client as mqtt


load_dotenv(Path(__file__).resolve().parent / ".env")


class DownlinkFehler(Exception):
    pass


def sende_intervall_downlink(sensor_id: str, minuten: int) -> dict:
    # den echten versand schalten wir erst frei, wenn das sensormodell geprüft ist
    if os.getenv("DOWNLINK_ENABLED", "false").lower() != "true":
        raise DownlinkFehler(
            "Downlink ist noch nicht freigeschaltet (DOWNLINK_ENABLED)."
        )

    host = os.getenv("DOWNLINK_MQTT_HOST", "")
    port = int(os.getenv("DOWNLINK_MQTT_PORT", "1888"))
    benutzer = os.getenv("DOWNLINK_MQTT_USER", "")
    passwort = os.getenv("DOWNLINK_MQTT_PASSWORD", "")
    gateway_id = os.getenv("DOWNLINK_GATEWAY_ID", "")

    if not all((host, benutzer, passwort, gateway_id)):
        raise DownlinkFehler(
            "MQTT-Einstellungen für den Downlink sind unvollständig."
        )

    sekunden = minuten * 60
    payload_hex = f"01{sekunden:06X}"
    topic = f"{gateway_id}/{sensor_id}/control"
    nachricht = f"{sensor_id},time,hex,{payload_hex}"

    # eigener client, damit wir nicht die gateway-verbindung beim broker abmelden
    client = mqtt.Client(
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
        client_id=f"sg-downlink-{uuid4().hex[:12]}",
        protocol=mqtt.MQTTv311,
    )
    client.username_pw_set(benutzer, passwort)

    verbunden = Event()
    verbindung_status = {"ok": False}

    def on_connect(_client, _userdata, _flags, reason_code, _properties):
        verbindung_status["ok"] = reason_code == 0
        verbunden.set()

    client.on_connect = on_connect

    try:
        client.connect(host, port, keepalive=20)
        client.loop_start()

        if not verbunden.wait(timeout=5) or not verbindung_status["ok"]:
            raise DownlinkFehler(
                "MQTT-Broker hat die Verbindung nicht bestätigt."
            )

        # qos 1 bestätigt die übergabe an den broker, nicht den empfang im sensor
        ergebnis = client.publish(
            topic,
            payload=nachricht,
            qos=1,
            retain=False,
        )

        if ergebnis.rc != mqtt.MQTT_ERR_SUCCESS:
            raise DownlinkFehler(
                "MQTT-Publish konnte nicht gestartet werden."
            )

        ergebnis.wait_for_publish(timeout=5)

        if not ergebnis.is_published():
            raise DownlinkFehler(
                "Keine Publish-Bestätigung vom MQTT-Broker erhalten."
            )

    except (OSError, ValueError, RuntimeError) as error:
        if isinstance(error, DownlinkFehler):
            raise
        raise DownlinkFehler(
            f"MQTT-Verbindung oder Versand fehlgeschlagen: {error}"
        ) from error

    finally:
        client.disconnect()
        client.loop_stop()

    return {
        "sensor_id": sensor_id,
        "minuten": minuten,
        "payload_hex": payload_hex,
        "topic": topic,
        "status": "an_broker_uebergeben",
    }