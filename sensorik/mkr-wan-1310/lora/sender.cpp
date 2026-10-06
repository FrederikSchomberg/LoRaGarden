#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>

void setup() {
    Serial.begin(9600);

    // LoRa im europäischen 868-MHz-Band starten
    if (!LoRa.begin(868E6)) {
        Serial.println("LoRa konnte nicht gestartet werden!");
        while (1);
    }

    Serial.println("Sender gestartet");
}

void loop() {
    String message = "Hallo Yamen";

    LoRa.beginPacket();
    LoRa.print(message);
    LoRa.endPacket();

    Serial.print("Gesendet: ");
    Serial.println(message);

    delay(5000);
}