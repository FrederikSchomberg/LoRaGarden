# MKR WAN 1310

In diesem Ordner befindet sich die Umsetzung der Sensorstation mit dem Arduino MKR WAN 1310.

Die Entwicklung erfolgt mit C/C++ und PlatformIO.

## Struktur

- `src/`
  Enthält das aktuelle Hauptprogramm der Sensorstation.

- `sensors/`
  Enthält einzelne Beispielcodes und Dokumentationen für die verwendeten Sensoren.

- `lora/`
  Enthält Beispiele für die direkte LoRa-Kommunikation zwischen zwei MKR WAN 1310.

- `lorawan/`
  Enthält Beispiele für die Datenübertragung über LoRaWAN.

- `platformio.ini`
  Enthält die PlatformIO-Konfiguration sowie die verwendeten Bibliotheken.

## Aktueller Stand

Aktuell sind der SHT40 und der pH-Sensor SEN0161 V1 im Hauptprogramm berücksichtigt.

Weitere Sensoren werden ergänzt, sobald sie verfügbar und einzeln getestet wurden.

Die Sensordaten werden aktuell testweise als String über LoRaWAN übertragen. Später soll dafür ein kompakteres, byte-basiertes Datenformat verwendet werden.
