#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_SHT4x.h>

Adafruit_SHT4x sht40;

void setup() {
    Serial.begin(115200);
    while (!Serial);

    if (!sht40.begin()) {
        Serial.println("SHT40 nicht gefunden!");
        while (1);
    }

    Serial.println("SHT40 gefunden!");
}

void loop() {
    sensors_event_t humidity;
    sensors_event_t temp;

    sht40.getEvent(&humidity, &temp);

    Serial.print("Temperatur: ");
    Serial.print(temp.temperature);
    Serial.println(" °C");

    Serial.print("Luftfeuchtigkeit: ");
    Serial.print(humidity.relative_humidity);
    Serial.println(" %");

    Serial.println("--------------------");

    delay(2000);
}