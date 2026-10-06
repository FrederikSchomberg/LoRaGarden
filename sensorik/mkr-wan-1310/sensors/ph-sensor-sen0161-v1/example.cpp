#include <Arduino.h>

const int phPin = A0;

// Beispiel-Kalibrierwerte.
// Diese Werte müssen nach der echten Kalibrierung des Sensors angepasst werden.
// Der Sensor ist aktuell noch nicht kalibriert, daher dient die pH-Berechnung nur als Beispiel.
const float slope = 3.5;
const float offset = 0.0;

void setup() {
    Serial.begin(115200);
    while (!Serial);

    analogReadResolution(12); // Messbereich: 0 bis 4095
}

void loop() {
    int rawValue = analogRead(phPin);

    // ADC-Rohwert in Spannung umrechnen
    float voltage = rawValue * (3.3 / 4095.0);

    // Beispielhafte Berechnung des pH-Werts
    float phValue = slope * voltage + offset;

    Serial.print("Rohwert: ");
    Serial.println(rawValue);

    Serial.print("Spannung: ");
    Serial.print(voltage, 3);
    Serial.println(" V");

    Serial.print("pH-Wert: ");
    Serial.println(phValue, 2);

    Serial.println("--------------------");

    delay(1000);
}