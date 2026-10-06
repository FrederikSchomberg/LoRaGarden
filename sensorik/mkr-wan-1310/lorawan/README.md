# LoRaWAN – MKR WAN 1310

## Beschreibung

In diesem Beispiel wird gezeigt, wie der Arduino MKR WAN 1310 Daten über LoRaWAN sendet.

Für die Kommunikation wird die Bibliothek `MKRWAN_v2` verwendet. Das LoRaWAN-Modem wird für das europäische Frequenzband `EU868` initialisiert.

Die Anmeldung am LoRaWAN-Netzwerk erfolgt über **ABP (Activation By Personalization)**.

## Benötigte Bibliothek

```cpp
#include <MKRWAN_v2.h>
```

Verwendete Bibliothek: `MKRWAN_v2`

## LoRaWAN-Konfiguration

Für die ABP-Verbindung werden drei Werte benötigt:

- `DevAddr` – Geräteadresse des LoRaWAN-Geräts
- `NwkSKey` – Network Session Key
- `AppSKey` – Application Session Key

Diese Zugangsdaten sollten nicht öffentlich auf GitHub gespeichert werden.

## Verbindung herstellen

Das Modem wird für das europäische Frequenzband `EU868` gestartet:

```cpp
modem.begin(EU868);
```

Danach wird die ABP-Verbindung hergestellt:

```cpp
modem.joinABP(devAddr, nwkSKey, appSKey);
```

## Daten senden

Die Beispieldaten werden in einem `String` zusammengefasst:

```cpp
String msg =
  sender + ";" +
  String(temperatur, 1) + ";" +
  String(bodenfeuchtigkeit);
```

Eine Nachricht kann beispielsweise so aussehen:

```text
Yamen;24.5;61
```

Die einzelnen Werte werden durch ein Semikolon getrennt.

Anschließend wird die Nachricht als LoRaWAN-Paket gesendet:

```cpp
modem.beginPacket();
modem.print(msg);
modem.endPacket();
```

Im Beispiel wird alle drei Minuten eine Nachricht gesendet:

```cpp
delay(180000);
```

## Ablauf

```text
MKR WAN 1310
     ↓
   LoRaWAN
     ↓
LoRaWAN Gateway
     ↓
Network Server
     ↓
Backend / MQTT
```

Die Datei `send-example.cpp` enthält das vollständige Beispiel zum Senden von Testdaten über LoRaWAN.