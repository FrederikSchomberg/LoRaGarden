"""
Bodenfeuchte-Vorhersage - komplettes Modell
Daten kommen ueber Grafana (nicht direkt InfluxDB), dann Random Forest Training.

pip install requests pandas numpy scikit-learn matplotlib
"""

import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

# 1) KONFIGURATION
GRAFANA_URL = "http://sr-labor.ddns.net:3088"    
GRAFANA_TOKEN = ""     # 
DATASOURCE_UID = "cfu5tebp57i0we"

INFLUX_BUCKET = "rooftop"
MEASUREMENT = "mqtt_consumer"
BED_TAG = "bed"

# echte Namen unserer drei Beete + wieviel Kohle drin ist
BEDS = {
    "Carla": "10 % Kohle",
    "Berta": "5 % Kohle",
    "Ilse":  "0 % Kohle",
}

# echte Feldnamen in InfluxDB -> die Namen die im restlichen Skript benutzt werden
FIELD_MOISTURE = "soil_moisture_%"
FIELD_TEMP = "soil_temperature_c"
FIELD_EC = "soil_ec"

HORIZONT_H = 12   # wie viele Stunden voraus vorhergesagt wird
ZEITRAUM_TAGE = 60  # wie viele Tage rueckwaerts geladen werden

HEADERS = {
    "Authorization": f"Bearer {GRAFANA_TOKEN}",
    "Content-Type": "application/json",
}



# 2) DATEN UEBER GRAFANA HOLEN

def hole_daten():
    """Fragt moisture, temperature, ec fuer alle Beete ueber die Grafana
    Query-API ab. Grafana leitet das intern an InfluxDB weiter,
    ich brauche also keine InfluxDB Zugangsdaten selbst.
    """
    flux_query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: -{ZEITRAUM_TAGE}d)
      |> filter(fn: (r) => r._measurement == "{MEASUREMENT}")
      |> filter(fn: (r) => r._field == "{FIELD_MOISTURE}" or r._field == "{FIELD_TEMP}" or r._field == "{FIELD_EC}")
      |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> rename(columns: {{"{FIELD_MOISTURE}": "moisture", "{FIELD_TEMP}": "temperature", "{FIELD_EC}": "ec"}})
    '''
 
    url = f"{GRAFANA_URL}/api/ds/query"
    payload = {
        "queries": [{
            "refId": "A",
            "datasource": {"uid": DATASOURCE_UID},
            "query": flux_query,
        }],
        "from": f"now-{ZEITRAUM_TAGE}d",
        "to": "now",
    }
 
    antwort = requests.post(url, headers=HEADERS, json=payload)
    print("Status:", antwort.status_code)
    print("Antwort von Grafana:", antwort.text)
    print("Query war:", flux_query)
    antwort.raise_for_status()
    return antwort.json()
 
 
# ---------------------------------------------------------------------------
# HAUPTPROGRAMM
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    rohdaten = hole_daten()
    print("\n--- Rohdaten (kompletter Dict) ---")
    print(rohdaten)