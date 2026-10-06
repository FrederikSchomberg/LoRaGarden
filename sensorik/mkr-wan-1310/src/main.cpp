#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_SHT4x.h>
#include <MKRWAN_v2.h>

Adafruit_SHT4x sht40;
LoRaModem modem;

const int phPin = A0;

// Kalibrierwerte für den pH-Sensor
// Nach der echten Kalibrierung anpassen
const float slope = 3.5;
const float offset = 0.0;

// LoRaWAN-Zugangsdaten für ABP
String devAddr = "DEINE_DEV_ADDR";
String nwkSKey = "DEIN_NWK_S_KEY";
String appSKey = "DEIN_APP_S_KEY";

void setup() {
    Serial.begin(115200);
    while (!Serial);

    // SHT40 starten
    if (!sht40.begin()) {
        Serial.println("SHT40 nicht gefunden!");
        while (1);
    }

    // ADC für den pH-Sensor auf 12 Bit stellen
    analogReadResolution(12);

    // LoRaWAN-Modem im EU868-Band starten
    if (!modem.begin(EU868)) {
        Serial.println("LoRa-Modem konnte nicht gestartet werden!");
        while (1);
    }

    // Verbindung über ABP herstellen
    if (!modem.joinABP(devAddr, nwkSKey, appSKey)) {
        Serial.println("ABP Join fehlgeschlagen!");
        while (1);
    }

    Serial.println("System bereit");
}

void loop() {
    // Temperatur und Luftfeuchtigkeit auslesen
    sensors_event_t humidity;
    sensors_event_t temp;

    sht40.getEvent(&humidity, &temp);

    float temperatur = temp.temperature;
    float luftfeuchtigkeit = humidity.relative_humidity;

    // pH-Wert aus dem analogen Signal berechnen
    int rawValue = analogRead(phPin);
    float voltage = rawValue * (3.3 / 4095.0);
    float phValue = slope * voltage + offset;

    // Messwerte im Serial Monitor anzeigen
    Serial.print("Temperatur: ");
    Serial.print(temperatur);
    Serial.println(" °C");

    Serial.print("Luftfeuchtigkeit: ");
    Serial.print(luftfeuchtigkeit);
    Serial.println(" %");

    Serial.print("pH-Wert: ");
    Serial.println(phValue, 2);

    // Nachricht für LoRaWAN erstellen
    String sender = "Yamen";

    String msg =
        sender + ";" +
        String(temperatur, 1) + ";" +
        String(luftfeuchtigkeit, 1) + ";" +
        String(phValue, 2);

    // Messwerte senden
    modem.beginPacket();
    modem.print(msg);

    int result = modem.endPacket();

    if (result > 0) {
        Serial.print("Gesendet: ");
        Serial.println(msg);
    } else {
        Serial.print("Fehler beim Senden: ");
        Serial.println(result);
    }

    // Alle 3 Minuten erneut messen und senden
    delay(180000);
}