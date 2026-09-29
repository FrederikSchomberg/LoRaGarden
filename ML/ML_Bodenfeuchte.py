"""
Bodenfeuchte - Daten laden und aufbereiten

Zwei wege, die am ende DIESELBE tabelle liefern:
  A) aus der CSV (nutze ich jetzt, weil /history-endpunkt noch fehlt)
  B) ueber den Backend-Server per requests (sobald der /history endpunkt live ist)


pip install requests pandas
"""

import requests
from pathlib import Path
import pandas as pd

# --- Config API (weg B, spaeter) ---
API_URL = "http://sr-labor.ddns.net:8001"

BEDS_POSITIONEN = {
    "Carla": ["oben", "unten"],
    "Berta": ["oben", "unten"],
    "Ilse":  ["oben", "unten"],
}

ZEITRAUM_TAGE = 60

# --- Config CSV (weg A, jetzt) ---
# der ordner in dem DIESES skript liegt - egal von wo es gestartet wird
SKRIPT_ORDNER = Path(__file__).resolve().parent
CSV_PATH = SKRIPT_ORDNER / "Alle_Beete-data.csv"

# im csv stehen die beete/positionen gross geschrieben
BEDS = {
    "Carla": "10 % Kohle",
    "Berta": "5 % Kohle",
    "Ilse":  "0 % Kohle",
}
POSITIONEN = ["Oben", "Unten"]

# der export hat die daten schon auf 2h runtergerechnet
RESAMPLE = "2h"


# ---------------------------------------------------------------------------
# WEG A: DATEN AUS DER CSV LADEN
# ---------------------------------------------------------------------------
def lade_daten_csv():
    """Der Grafana-Export hat eine spalte pro beet+position+messgroesse
    (wide format). Hier umgebaut ins lange format, damit es zur api-variante passt.

    Spalten mit { } im namen werden ignoriert - das sind doppelte eintraege
    von einem zweiten host, die fast keine werte enthalten.
    """
    df = pd.read_csv(CSV_PATH)
    df["Time"] = pd.to_datetime(df["Time"])

    teile = []
    for bed in BEDS:
        for position in POSITIONEN:
            # achtung: "Tempertaur" ist im csv wirklich so falsch geschrieben
            spalte_ec = f"{bed} {position} Leitwert"
            spalte_feuchte = f"{bed} {position} Bodenfeuchtigkeit"
            spalte_temp = f"{bed} {position} Tempertaur"

            teil = pd.DataFrame({
                "time": df["Time"],
                "bed": bed,
                "position": position.lower(),   # klein, wie bei der api
                "moisture": df[spalte_feuchte],
                "temperature": df[spalte_temp],
                "ec": df[spalte_ec],
            })
            teile.append(teil)

    return pd.concat(teile, ignore_index=True)


# ---------------------------------------------------------------------------
# AUFBEREITEN (gilt fuer beide wege)
# ---------------------------------------------------------------------------
def aufbereiten(df):
    """Bringt die daten pro sensor auf ein festes zeitraster und
    fuellt kurze luecken.

    Warum noetig: die sensoren senden versetzt, dadurch stehen in vielen
    zeilen nur fuer einen sensor werte drin und beim rest NaN.
    resample() fasst alles innerhalb eines zeitfensters zusammen,
    interpolate() fuellt kurze ausfaelle - aber nur kurze, damit bei
    laengeren sensorausfaellen keine werte "erfunden" werden.
    """
    teile = []
    for (bed, position), g in df.groupby(["bed", "position"]):
        g = g.set_index("time").sort_index()
        g = g[["moisture", "temperature", "ec"]].resample(RESAMPLE).mean()
        g = g.interpolate(limit=3)   # max 3 schritte = 6h luecke fuellen
        g["bed"] = bed
        g["position"] = position
        teile.append(g)

    df = pd.concat(teile).reset_index()

    # spalten ordentlich sortieren
    return df[["time", "bed", "position", "moisture", "temperature", "ec"]]


def leeren_anfang_abschneiden(df):
    """Der export faengt frueher an als die sensoren tatsaechlich daten haben.
    Alles vor dem ersten echten messwert fliegt raus.
    """
    erster_wert = df.dropna(subset=["moisture"])["time"].min()
    vorher = len(df)
    df = df[df["time"] >= erster_wert].copy()
    print(f"leeren anfang abgeschnitten: {vorher - len(df)} zeilen raus, "
          f"daten starten jetzt bei {erster_wert}")
    return df


def bloecke_markieren(df, min_laenge=24):
    """Teilt jeden sensor in zusammenhaengende bloecke auf.

    Warum: durch den sensorausfall im september gibt es grosse luecken.
    Lag-features duerfen NICHT ueber eine luecke hinweg gebildet werden -
    sonst waere "feuchte vor 24h" in wirklichkeit "feuchte vor 3 wochen".
    Deshalb bekommt jeder zusammenhaengende abschnitt eine eigene block-id,
    und spaeter werden features pro block statt pro sensor gebaut.

    min_laenge: bloecke die kuerzer sind fliegen raus (in schritten,
    24 schritte = 48h bei 2h-raster)
    """
    teile = []

    for (bed, position), g in df.groupby(["bed", "position"]):
        g = g.sort_values("time").reset_index(drop=True)

        # jede zeile ohne messwert trennt zwei bloecke
        hat_wert = g["moisture"].notna()
        block_id = (~hat_wert).cumsum()

        g["block"] = f"{bed}_{position}_" + block_id.astype(str)
        g = g[hat_wert]   # leere zeilen brauchen wir nicht mehr

        # zu kurze bloecke rauswerfen
        gross_genug = g.groupby("block").size()
        gross_genug = gross_genug[gross_genug >= min_laenge].index
        g = g[g["block"].isin(gross_genug)]

        teile.append(g)

    return pd.concat(teile, ignore_index=True)


def zeige_bloecke(df):
    """Zeigt welche zusammenhaengenden abschnitte uebrig geblieben sind."""
    print("\n--- Nutzbare bloecke ---")
    for (bed, position), g in df.groupby(["bed", "position"]):
        print(f"{bed} {position}:")
        for block, b in g.groupby("block"):
            dauer = (b["time"].max() - b["time"].min())
            print(f"    {b['time'].min()} bis {b['time'].max()}  "
                  f"({len(b)} punkte, {dauer.days} tage)")


def zeige_ueberblick(df):
    """Kurzer check ob die aufbereitung sinnvoll aussieht."""
    print("\n--- Form der tabelle ---")
    print(df.shape)

    print("\n--- Erste zeilen ---")
    print(df.head())

    print("\n--- Zeitraum ---")
    print(df["time"].min(), "bis", df["time"].max())

    print("\n--- Datenpunkte pro sensor ---")
    print(df.groupby(["bed", "position"]).size())

    print("\n--- Fehlende werte pro spalte ---")
    print(df.isna().sum())

    print("\n--- Wertebereiche ---")
    print(df.groupby(["bed", "position"])["moisture"].agg(["min", "max", "mean"]).round(2))


# ---------------------------------------------------------------------------
# WEG B: DATEN UEBER DEN BACKEND-SERVER (spaeter, wenn /history live ist)
# ---------------------------------------------------------------------------
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


def teste_server_erreichbarkeit():
    """Nutzt einen bereits VORHANDENEN Endpunkt, um zu pruefen ob der
    Server grundsaetzlich erreichbar ist - unabhaengig vom neuen /history.
    """
    antwort = requests.get(f"{API_URL}/api/health")
    print("Status:", antwort.status_code)
    print("Antwort:", antwort.json())


def teste_aktuelle_daten():
    """Holt die AKTUELLEN Werte eines Sensors ueber den schon vorhandenen
    Endpunkt /api/beds/{bed_name}/{bed_position}.
    """
    url = f"{API_URL}/api/beds/Ilse/unten"
    antwort = requests.get(url)
    print("Status:", antwort.status_code)
    print("Antwort:", antwort.json())


# ---------------------------------------------------------------------------
# HAUPTPROGRAMM
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    # aktuell: weg A ueber die csv
    roh = lade_daten_csv()
    print("roh geladen:", roh.shape)

    df = aufbereiten(roh)
    print("nach resample:", df.shape)

    df = leeren_anfang_abschneiden(df)
    df = bloecke_markieren(df)
    print("nach block-aufteilung:", df.shape)

    zeige_ueberblick(df)
    zeige_bloecke(df)

    # TODO: sobald der /history endpunkt live ist, stattdessen weg B:
    # roh = hole_daten()
    # df = aufbereiten(roh)
    # df = leeren_anfang_abschneiden(df)
    # df = bloecke_markieren(df)