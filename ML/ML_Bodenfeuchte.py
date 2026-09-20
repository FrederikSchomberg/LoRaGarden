"""
Daten ueber den Backend-Server (FastAPI) holen, per requests -
kein VPN noetig, weil der Server oeffentlich erreichbar ist
und die InfluxDB-Verbindung intern selbst uebernimmt.

pip install requests pandas
"""

import requests
import pandas as pd

API_URL = "http://sr-labor.ddns.net:8001"

# welche beete + positionen es gibt (aus main.py uebernommen)
BEDS_POSITIONEN = {
    "Carla": ["oben", "unten"],
    "Berta": ["oben", "unten"],
    "Ilse":  ["oben", "unten"],
}

ZEITRAUM_TAGE = 60


def hole_daten():
    """Ruft fuer jedes Beet+Position den /history Endpunkt auf und
    baut daraus eine gemeinsame pandas-Tabelle.
    """
    alle_zeilen = []

    for bed, positionen in BEDS_POSITIONEN.items():
        for position in positionen:
            url = f"{API_URL}/api/beds/{bed}/{position}/history"
            antwort = requests.get(url, params={"days": ZEITRAUM_TAGE})

            print(f"{bed}/{position}: Status {antwort.status_code}")
            antwort.raise_for_status()

            daten = antwort.json()

            for eintrag in daten["history"]:
                alle_zeilen.append({
                    "time": eintrag["time"],
                    "bed": bed,
                    "position": position,
                    "moisture": eintrag.get("soil_moisture"),
                    "temperature": eintrag.get("soil_temperature"),
                    "ec": eintrag.get("soil_ec"),
                })

    df = pd.DataFrame(alle_zeilen)
    df["time"] = pd.to_datetime(df["time"])
    return df


# ---------------------------------------------------------------------------
# ZUM TESTEN OHNE DEN NEUEN ENDPUNKT: nur pruefen ob der Server ueberhaupt antwortet
# ---------------------------------------------------------------------------
def teste_server_erreichbarkeit():
    """Nutzt einen bereits VORHANDENEN Endpunkt, um zu pruefen ob der
    Server grundsaetzlich erreichbar ist - unabhaengig vom neuen /history.
    """
    antwort = requests.get(f"{API_URL}/api/health")
    print("Status:", antwort.status_code)
    print("Antwort:", antwort.json())


if __name__ == "__main__":
    # TODO: erst diese Zeile nutzen, solange /history noch nicht live ist
    teste_server_erreichbarkeit()

    # TODO: sobald der Kollege /history eingespielt hat, stattdessen:
    # df = hole_daten()
    # print(df.head())