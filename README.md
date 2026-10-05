# LoRaGarden

LoRaGarden ist ein Projekt aus dem Softwarepraktikum **Smart Gardening**.

Ziel des Projekts ist es, Sensordaten aus Versuchsbeeten zu sammeln, zu speichern, auszuwerten und über eine Weboberfläche darzustellen.

Die Messdaten werden in einer InfluxDB gespeichert und über ein FastAPI-Backend an das Frontend weitergegeben.

## Projektaufbau

Das Projekt besteht aktuell aus folgenden Bereichen:

- Frontend mit React und TypeScript
- Backend mit FastAPI und Python
- Speicherung der Sensordaten in InfluxDB
- Visualisierung aktueller Messwerte
- Vergleich der Versuchsbeete Carla, Berta und Ilse
- historische Messdaten
- Machine-Learning-Prototyp
- ESP32- und Sensor-Prototyp

## Architektur

Der grundlegende Datenfluss sieht folgendermaßen aus:

```text
Sensoren / ESP32-Sensor-Prototyp
            ↓
LoRaWAN / Datenübertragung
            ↓
         InfluxDB
            ↓
FastAPI-Backend / DB-Connector
       ↙              ↘
React-Frontend      ML-Modell
```

Frontend und ML sollen ihre Daten über die InfluxDB bzw. über die dafür vorgesehene Backend-API erhalten.

Grafana dient nur als zusätzliches internes Werkzeug für Monitoring und Detailauswertungen und soll nicht als Datenquelle für das normale Frontend oder das ML-Modell verwendet werden.

## Versuchsbeete

Im Botanischen Garten werden drei Beete miteinander verglichen:

| Beet | Substrat |
| --- | --- |
| Carla | 10 % Pflanzenkohle |
| Berta | 5 % Pflanzenkohle |
| Ilse | Sand |

Pro Beet gibt es jeweils eine Messstelle oben und unten.

Erfasst werden unter anderem:

- Bodenfeuchte
- Bodentemperatur
- Leitwert (EC)
- Batteriespannung
- Zeitstempel

## Backend

Das Backend basiert auf FastAPI.

Es liest die Sensordaten über den `DBConnector` aus der InfluxDB und stellt sie dem Frontend über eine REST-API zur Verfügung.

Aktuell vorhandene Endpunkte:

```text
GET /
GET /api/health
GET /api/beds
GET /api/beds/{bed_name}/{bed_position}
GET /api/dashboard
```

Die API-Dokumentation ist lokal unter folgendem Pfad erreichbar:

```text
http://127.0.0.1:8001/docs
```

## Frontend

Das Frontend wurde mit React, TypeScript und Vite umgesetzt.

Aktuell vorhanden sind unter anderem:

- Landingpage
- Dashboard
- Anzeige aktueller Sensordaten
- Vergleich der drei Beete
- Demo-Daten bei nicht erreichbarem Backend
- Bereich für historische Daten

Das Dashboard fragt die aktuellen Daten regelmäßig über das Backend ab.

## Historische Daten

Historische Daten sollen direkt aus der InfluxDB über das Backend bzw. einen entsprechenden API-Endpunkt geladen und im React-Frontend dargestellt werden.

Aktuell ist im Repository noch eine ältere Grafana-Einbindung für historische Daten vorhanden. Diese soll durch den direkten Datenweg über Datenbank und Backend ersetzt werden.

## Machine Learning

Im Ordner `ML` befindet sich aktuell ein erster Prototyp zur Auswertung bzw. Vorhersage von Sensordaten.

Der derzeitige Stand verwendet noch die Grafana Query API zum Abrufen der Daten.

Geplant ist folgender Datenweg:

```text
InfluxDB
   ↓
Backend / API
   ↓
ML-Modell
```

Damit verwenden Frontend und ML dieselbe Datenbasis und greifen nicht über Grafana auf die Daten zu.

## ESP32 / Sensor-Prototyp

Parallel zum bestehenden Sensorsystem wird ein eigener bzw. verbesserter Sensor-Prototyp mit einem ESP32 und verschiedenen Sensoren aufgebaut und getestet.

Dieser Teil dient dazu, eigene Erfahrungen mit Microcontrollern, Sensorik und der Übertragung von Messwerten zu sammeln.

## Projekt lokal starten

Voraussetzungen:

- Python
- Node.js
- npm
- Zugriff auf die InfluxDB

Das gesamte Projekt kann über das Skript `dev.py` gestartet werden:

```bash
python dev.py
```

Dabei werden Backend und Frontend gestartet.

Backend:

```text
http://127.0.0.1:8001
```

API-Dokumentation:

```text
http://127.0.0.1:8001/docs
```

Frontend:

```text
http://localhost:5173
```

## Konfiguration

Die Zugangsdaten für die InfluxDB werden im Backend über eine `.env`-Datei konfiguriert.

Beispiel:

```env
INFLUX_URL=
INFLUX_TOKEN=
INFLUX_ORG=
INFLUX_BUCKET=
INFLUX_MEASUREMENT=
INFLUX_DEVICE_TAG=

INFLUX_FIELD_TEMPERATURE=
INFLUX_FIELD_SOIL_MOISTURE=
INFLUX_FIELD_SOIL_EC=
INFLUX_FIELD_BATTERY_VOLTAGE=
```

## Docker

Das FastAPI-Backend kann über Docker betrieben werden.

Im Backend befindet sich dafür eine eigene `Dockerfile`.

Der Container startet die API intern auf Port `8000`.

## Deployment

Für das Frontend existiert ein GitHub-Actions-Workflow.

Bei Änderungen auf dem Branch `main` wird das Frontend automatisch gebaut und über GitHub Pages veröffentlicht.

## Aktueller Stand

Bereits umgesetzt:

- InfluxDB-Anbindung
- FastAPI-Backend
- API für aktuelle Sensordaten
- Landingpage
- Dashboard
- Darstellung aktueller Messwerte
- Vergleich von Carla, Berta und Ilse
- Demo-Daten bei Backend-Ausfall
- Dockerisierung des Backends
- GitHub-Pages-Workflow für das Frontend

Noch in Arbeit bzw. geplant:

- historische Daten direkt über Backend und InfluxDB
- Entfernung der Grafana-Abhängigkeit aus dem normalen Dashboard
- weitere ML-Auswertung
- ESP32-Sensor-Prototyp
- Login & Benutzerverwaltung 

## Links

**Carbon Sequestration @ NRW:**  
https://www.hochschule-bochum.de/carbon-sequestration/das-projekt/start/
