# LoRa – Sender und Empfänger

## Beschreibung

In diesem Beispiel kommunizieren zwei MKR WAN 1310 direkt über LoRa miteinander.

Ein Board arbeitet als Sender und das andere als Empfänger.

Dabei wird kein LoRaWAN-Gateway benötigt.

## Verwendete Bibliotheken

```cpp
#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
```

- `Arduino.h`: Grundlegende Arduino-Funktionen wie `Serial` und `delay()`
- `SPI.h`: Kommunikation mit dem LoRa-Funkchip über SPI
- `LoRa.h`: Funktionen zum Senden und Empfangen von LoRa-Paketen

In PlatformIO wird die LoRa-Bibliothek über `platformio.ini` eingebunden:

```ini
lib_deps =
    sandeepmistry/LoRa
```

## Frequenz

Beide Boards verwenden das europäische 868-MHz-Band:

```cpp
LoRa.begin(868E6);
```

Sender und Empfänger müssen dieselbe Frequenz verwenden.

---

# Sender

Der Sender erstellt eine Nachricht und sendet sie über LoRa.

## Ablauf

```text
LoRa starten
↓
Nachricht erstellen
↓
LoRa-Paket beginnen
↓
Nachricht in das Paket schreiben
↓
Paket senden
↓
5 Sekunden warten
↓
erneut senden
```

### LoRa-Paket senden

```cpp
LoRa.beginPacket();
LoRa.print(message);
LoRa.endPacket();
```

- `beginPacket()` startet ein neues Paket
- `print()` schreibt die Nachricht in das Paket
- `endPacket()` sendet das Paket

---

# Empfänger

Der Empfänger wartet auf eingehende LoRa-Pakete.

## Ablauf

```text
LoRa starten
↓
Auf Paket warten
↓
Paket erkennen
↓
Daten lesen
↓
Nachricht zusammensetzen
↓
Im Serial Monitor ausgeben
↓
Auf nächstes Paket warten
```

### Prüfen, ob ein Paket angekommen ist

```cpp
int packetSize = LoRa.parsePacket();
```

Wenn `packetSize` größer als 0 ist, wurde ein Paket empfangen.

### Nachricht lesen

```cpp
while (LoRa.available()) {
    message += (char)LoRa.read();
}
```

`LoRa.read()` liest die empfangenen Zeichen nacheinander.

Diese werden zu einem `String` zusammengesetzt.

### Signalstärke

```cpp
LoRa.packetRssi();
```

Damit kann die Signalstärke des empfangenen Pakets ausgegeben werden.

---

## Kommunikation

```text
MKR WAN 1310
   Sender
     ↓
LoRa 868 MHz
     ↓
   Funk
     ↓
LoRa 868 MHz
     ↓
MKR WAN 1310
  Empfänger
     ↓
Serial Monitor
```

Die Dateien `sender.cpp` und `receiver.cpp` enthalten die jeweiligen Beispielprogramme.