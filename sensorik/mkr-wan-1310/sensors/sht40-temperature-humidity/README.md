````markdown
# SHT40

## Beschreibung

Der SHT40 ist ein Sensor zur Messung von Temperatur und Luftfeuchtigkeit.

Die Kommunikation mit dem MKR WAN 1310 erfolgt über I2C. Dafür werden die Leitungen SDA und SCL verwendet.

Die feste I2C-Adresse des SHT40 ist `0x44`.


## Verwendete Bibliotheken

```cpp
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_SHT4x.h>
```

- `Arduino.h`: Enthält grundlegende Arduino-Funktionen wie `Serial` und `delay()`.
- `Wire.h`: Wird für die Kommunikation über I2C verwendet.
- `Adafruit_SHT4x.h`: Enthält die Funktionen, um den SHT40 zu initialisieren und Messwerte auszulesen.

Die SHT40-Bibliothek wird in PlatformIO über die `platformio.ini` eingebunden:

```ini
lib_deps =
    adafruit/Adafruit SHT4x Library
```

## Wichtige Methoden

### Sensor initialisieren

```cpp
sht40.begin();
```

Initialisiert den Sensor und prüft, ob er über I2C erreichbar ist.

### Messwerte auslesen

```cpp
sht40.getEvent(&humidity, &temp);
```

Liest Luftfeuchtigkeit und Temperatur aus.

Die Messwerte werden in zwei Variablen vom Typ `sensors_event_t` gespeichert.

Das `&` übergibt die Speicheradresse der Variablen, damit `getEvent()` die Messwerte dort speichern kann.

### Auf die Messwerte zugreifen

Temperatur:

```cpp
temp.temperature
```

Luftfeuchtigkeit:

```cpp
humidity.relative_humidity
```

## Ablauf des Beispielcodes

Beim Start wird zuerst die serielle Verbindung geöffnet.

Danach wird mit `sht40.begin()` geprüft, ob der Sensor gefunden wird.

Im `loop()` werden Temperatur und Luftfeuchtigkeit mit `getEvent()` ausgelesen und anschließend über den Serial Monitor ausgegeben.

Die Messung wird alle zwei Sekunden wiederholt.

Beispielausgabe:

```text
Temperatur: 23.5 °C
Luftfeuchtigkeit: 51.2 %
```

## Beispielcode

```cpp
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
```
````
