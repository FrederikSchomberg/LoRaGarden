# Hauptprogramm – MKR WAN 1310

## Beschreibung

Dieses Programm ist das Hauptprogramm für die Sensorstation mit dem MKR WAN 1310.

Aktuell werden folgende Messwerte erfasst:

- Temperatur
- Luftfeuchtigkeit
- pH-Wert

Temperatur und Luftfeuchtigkeit werden mit dem SHT40 gemessen.  
Der pH-Wert wird über den analogen pH-Sensor SEN0161 V1 ausgelesen.

Die einzelnen Sensoren und ihre Beispielcodes sind zusätzlich in den jeweiligen Sensor-Ordnern dokumentiert.

## Ablauf

Das Programm startet zuerst die Sensoren und stellt anschließend die LoRaWAN-Verbindung über ABP her.

Danach werden die Messwerte ausgelesen und zu einer Nachricht zusammengefügt.

Beispiel:

```text
Yamen;23.5;51.4;6.83
```

Reihenfolge:

```text
Sender;Temperatur;Luftfeuchtigkeit;pH-Wert
```

Die Nachricht wird anschließend über LoRaWAN an das Gateway gesendet.

Die Messung und Übertragung wird aktuell alle drei Minuten wiederholt.

## Verwendete Sensoren

### SHT40

Misst:

- Temperatur in °C
- relative Luftfeuchtigkeit in %

Der Sensor kommuniziert über I2C.

### SEN0161 V1

Der pH-Sensor liefert ein analoges Signal, aus dem der pH-Wert berechnet wird.

Wichtig: Der Sensor ist aktuell noch nicht kalibriert. Die im Programm verwendeten Werte für `slope` und `offset` sind deshalb nur Beispielwerte und müssen nach der Kalibrierung angepasst werden.

Der SEN0161 V1 ist außerdem hauptsächlich für Flüssigkeiten vorgesehen und nicht für eine dauerhafte direkte Messung im Boden.

## LoRaWAN

Für die Übertragung wird die Bibliothek `MKRWAN_v2` verwendet.

Die Verbindung erfolgt aktuell über:

- EU868
- ABP

Für ABP werden folgende Zugangsdaten benötigt:

- `DevAddr`
- `NwkSKey`
- `AppSKey`

Diese Zugangsdaten sollten nicht öffentlich im GitHub-Repository gespeichert werden.

### Datenformat

Aktuell werden die Messwerte zum Testen als einfacher String übertragen.

Beispiel:

```text
Yamen;23.5;51.4;6.83
```

Dieses Format dient zunächst nur zum Testen der Datenübertragung.

Später soll ein einfaches und kompakteres Datenformat festgelegt werden. Voraussichtlich werden die Messwerte dafür byte-basiert übertragen, damit weniger Daten über LoRaWAN gesendet werden müssen.

## Aktueller Stand

Das Hauptprogramm enthält aktuell den SHT40 und den pH-Sensor.

Weitere Sensoren werden später ergänzt, sobald sie verfügbar und getestet sind.

Danach sollen alle benötigten Messwerte gemeinsam über LoRaWAN übertragen werden.