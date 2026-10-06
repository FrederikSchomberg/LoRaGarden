# pH-Sensor SEN0161 V1

> **Hinweis:** Der SEN0161 V1 ist hauptsächlich für die Messung von Flüssigkeiten vorgesehen. Für eine dauerhafte direkte Messung im Boden ist dieser Sensor nicht geeignet. Für Bodenmessungen kann stattdessen eine Bodenprobe mit Wasser vorbereitet und anschließend der pH-Wert der Flüssigkeit gemessen werden. Für die spätere dauerhafte Sensorstation sollte ein geeigneter Boden-pH-Sensor verwendet werden.

## Beschreibung

Der SEN0161 V1 von DFRobot ist ein analoger pH-Sensor.

Der Sensor liefert eine analoge Spannung, die vom Mikrocontroller über einen Analog-Pin ausgelesen wird.

## Anschluss

Das pH-Modul wird mit 5 V versorgt.

Typischer Anschluss:

- VCC → 5 V
- GND → GND
- Signal → Analog-Pin, z. B. `A0`

Wichtig: Der MKR WAN 1310 arbeitet mit 3,3-V-Logik. Deshalb muss geprüft werden, ob das Ausgangssignal des pH-Moduls sicher unter 3,3 V bleibt.

## Verwendete Bibliothek

```cpp
#include <Arduino.h>
```

Es wird keine spezielle Bibliothek für den Sensor benötigt.

`Arduino.h` wird für grundlegende Funktionen wie `Serial`, `delay()` und `analogRead()` verwendet.

## Wichtige Funktionen

### Analogwert auslesen

```cpp
analogRead(A0);
```

Liest den analogen Wert am Pin `A0`.

Bei einer Auflösung von 12 Bit liegt der Rohwert zwischen:

```text
0 und 4095
```

### ADC-Auflösung einstellen

```cpp
analogReadResolution(12);
```

Stellt die Auflösung des Analog-Digital-Wandlers auf 12 Bit.

### Rohwert in Spannung umrechnen

```cpp
float voltage = rawValue * (3.3 / 4095.0);
```

Damit wird der ADC-Rohwert in eine Spannung umgerechnet.

## pH-Wert berechnen

Nach einer Kalibrierung kann aus der Spannung der pH-Wert berechnet werden.

Zum Beispiel:

```cpp
float phValue = slope * voltage + offset;
```

`slope` und `offset` werden durch die Kalibrierung bestimmt.

Der Sensor ist aktuell noch nicht kalibriert. Deshalb sind die verwendeten Werte im Beispielcode nur Beispielwerte und liefern noch keinen zuverlässigen pH-Wert.

## Kalibrierung

Für eine genaue Messung muss der Sensor mit bekannten Pufferlösungen kalibriert werden.

Dafür werden unter anderem verwendet:

- pH 7 Pufferlösung
- pH 4 Pufferlösung
- destilliertes bzw. deionisiertes Wasser zum Abspülen

Die eigentliche Kalibrierung wird später durchgeführt, sobald die benötigten Lösungen verfügbar sind.

## Beispielcode

Der Beispielcode liest:

- den ADC-Rohwert
- die gemessene Spannung
- einen beispielhaft berechneten pH-Wert

aus und gibt die Werte über den Serial Monitor aus.

Wichtig: Der ausgegebene pH-Wert ist ohne vorherige Kalibrierung nicht zuverlässig.