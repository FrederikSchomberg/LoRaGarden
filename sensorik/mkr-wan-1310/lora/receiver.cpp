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

    Serial.println("Receiver gestartet");
}

void loop() {
    int packetSize = LoRa.parsePacket();

    if (packetSize) {
        String message = "";

        while (LoRa.available()) {
            message += (char)LoRa.read();
        }

        Serial.print("Empfangen: ");
        Serial.println(message);

        Serial.print("RSSI: ");
        Serial.println(LoRa.packetRssi());
    }
}