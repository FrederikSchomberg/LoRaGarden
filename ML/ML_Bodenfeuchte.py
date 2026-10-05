"""
Bodenfeuchte-Vorhersage für drei versuchsbeete (Carla 10 %, Berta 5 %, Ilse 0 % pflanzenkohle).

Das skript lädt die sensordaten aus dem grafana-export, hängt das wetter von
open-meteo an und vergleicht pro sensor einen random forest mit einer baseline.

pip install requests pandas numpy scikit-learn
"""

from pathlib import Path
import requests
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor


# ---------------------------------------------------------------------------
# EINSTELLUNGEN
# Alle werte, die man ändern kann, stehen hier. Angaben bei den features
# sind schritte, ein schritt = 2h.
# ---------------------------------------------------------------------------
SKRIPT_ORDNER = Path(__file__).resolve().parent   # dateien liegen neben dem skript
CSV_PATH = SKRIPT_ORDNER / "Alle_Beete-data.csv"

BEDS = {"Carla": "10 % Kohle", "Berta": "5 % Kohle", "Ilse": "0 % Kohle"}
POSITIONEN = ["Oben", "Unten"]   # groß geschrieben wie in der csv
SENSOR = ["bed", "position"]     # ein sensor = beet + position
RESAMPLE = "2h"                  # der export ist schon auf 2h runtergerechnet

WETTER_URL = "https://archive-api.open-meteo.com/v1/archive"
WETTER_LAT, WETTER_LON = 51.445, 7.262   # ungefähr campus RUB / botanischer garten
WETTER_ZEITZONE = "Europe/Berlin"        # die csv-zeiten sind deutsche ortszeit
WETTER_VORLAUF_TAGE = 3                  # vorlauf, damit die 48h-regensumme von anfang an stimmt
WETTER_CACHE = SKRIPT_ORDNER / "wetter_cache.csv"
WETTER_SPALTEN = ["aussentemp", "luftfeuchte", "regen_2h", "regen_6h", "regen_12h", "regen_48h"]

HORIZONT = 6         # 12h voraus vorhersagen
LAG_KURZ = 1         # feuchte vor 2h
LAG_LANG = 12        # feuchte vor 24h
TREND_SCHRITTE = 6   # änderung über die letzten 12h

N_BAEUME = 200       # bäume im random forest
ZUFALLSWERT = 0      # gleicher wert = gleiches ergebnis bei jedem lauf

MERKMALE = ["moisture", "temperature", "ec", "feuchte_lag_kurz", "feuchte_lag_lang",
            "feuchte_trend", "stunde_sin", "stunde_cos"] + WETTER_SPALTEN


# ---------------------------------------------------------------------------
# 1) SENSORDATEN LADEN UND AUFBEREITEN
# Aus dem grafana-export wird eine saubere tabelle im 2h-raster. Lücken werden
# nur kurz gefüllt, längere ausfälle trennen die daten in blöcke.
# ---------------------------------------------------------------------------
def lade_daten_csv():
    """Liest den export und formt ihn um: statt einer spalte pro sensor und
    messgröße gibt es eine zeile pro sensor und zeitpunkt."""
    df = pd.read_csv(CSV_PATH)
    df["Time"] = pd.to_datetime(df["Time"])
    teile = [pd.DataFrame({
        "time": df["Time"],
        "bed": bed,
        "position": position.lower(),
        "moisture": df[f"{bed} {position} Bodenfeuchtigkeit"],
        "temperature": df[f"{bed} {position} Tempertaur"],   # im export wirklich so geschrieben
        "ec": df[f"{bed} {position} Leitwert"],
    }) for bed in BEDS for position in POSITIONEN]
    return pd.concat(teile, ignore_index=True)


def aufbereiten(df):
    """Legt pro sensor ein lückenloses 2h-raster an (mittelwert pro fenster)
    und füllt lücken bis 6h mit einer geraden linie."""
    teile = []
    for (bed, position), g in df.groupby(SENSOR):
        g = g.set_index("time").sort_index()[["moisture", "temperature", "ec"]]
        g = g.resample(RESAMPLE).mean().interpolate(limit=3)
        teile.append(g.assign(bed=bed, position=position))
    df = pd.concat(teile).reset_index()
    return df[["time", "bed", "position", "moisture", "temperature", "ec"]]


def leeren_anfang_abschneiden(df):
    """Entfernt alle zeilen vor der ersten echten messung, weil der export
    früher beginnt als die sensoren daten liefern."""
    erster_wert = df.dropna(subset=["moisture"])["time"].min()
    vorher = len(df)
    df = df[df["time"] >= erster_wert].copy()
    print(f"leeren anfang abgeschnitten: {vorher - len(df)} zeilen raus, "
          f"daten starten jetzt bei {erster_wert}")
    return df


def bloecke_markieren(df, min_laenge=24):
    """Teilt jeden sensor an seinen lücken in zusammenhängende blöcke, damit
    lag-features nie über einen ausfall springen. Blöcke unter 48h fliegen raus."""
    teile = []
    for (bed, position), g in df.groupby(SENSOR):
        g = g.sort_values("time").reset_index(drop=True)
        hat_wert = g["moisture"].notna()
        # jede leere zeile erhöht den zähler, alles zwischen zwei lücken ist ein block
        g["block"] = f"{bed}_{position}_" + (~hat_wert).cumsum().astype(str)
        g = g[hat_wert]
        teile.append(g[g.groupby("block")["block"].transform("size") >= min_laenge])
    return pd.concat(teile, ignore_index=True)


def zeige_ueberblick(df):
    """Kontrollausgabe: form, zeitraum, punkte pro sensor, fehlende werte und
    wertebereiche der feuchte."""
    print("\n--- Form der tabelle ---")
    print(df.shape)
    print("\n--- Erste zeilen ---")
    print(df.head())
    print("\n--- Zeitraum ---")
    print(df["time"].min(), "bis", df["time"].max())
    print("\n--- Datenpunkte pro sensor ---")
    print(df.groupby(SENSOR).size())
    print("\n--- Fehlende werte pro spalte ---")
    print(df.isna().sum())
    print("\n--- Wertebereiche ---")
    print(df.groupby(SENSOR)["moisture"].agg(["min", "max", "mean"]).round(2))


def zeige_bloecke(df):
    """Kontrollausgabe: welche blöcke pro sensor übrig geblieben sind."""
    print("\n--- Nutzbare bloecke ---")
    for (bed, position), g in df.groupby(SENSOR):
        print(f"{bed} {position}:")
        for _, b in g.groupby("block"):
            dauer = b["time"].max() - b["time"].min()
            print(f"    {b['time'].min()} bis {b['time'].max()}  "
                  f"({len(b)} punkte, {dauer.days} tage)")


# ---------------------------------------------------------------------------
# 2) WETTER VON OPEN-METEO
# Stündliches wetter wird geladen, auf das 2h-raster gebracht und über den
# zeitstempel an die sensordaten gehängt.
# ---------------------------------------------------------------------------
def lade_wetter(start, ende):
    """Holt stündlich außentemperatur, luftfeuchte und regen für den zeitraum
    der sensordaten. Ein vollständiger cache wird wiederverwendet."""
    start_tag = (start - pd.Timedelta(days=WETTER_VORLAUF_TAGE)).normalize()
    ende_tag = ende.normalize()

    if WETTER_CACHE.exists():
        w = pd.read_csv(WETTER_CACHE, parse_dates=["time"])
        komplett = w[["aussentemp", "luftfeuchte", "regen"]].notna().all().all()
        if komplett and w["time"].min() <= start_tag and w["time"].max() >= ende_tag:
            print("wetter aus cache geladen:", WETTER_CACHE.name)
            return w

    params = {
        "latitude": WETTER_LAT,
        "longitude": WETTER_LON,
        "start_date": start_tag.strftime("%Y-%m-%d"),
        "end_date": ende_tag.strftime("%Y-%m-%d"),
        "hourly": "temperature_2m,relative_humidity_2m,precipitation",
        "timezone": WETTER_ZEITZONE,
    }
    antwort = requests.get(WETTER_URL, params=params, timeout=30)
    if antwort.status_code != 200:
        print("wetter-api fehler:", antwort.status_code, antwort.text)   # open-meteo nennt den grund
    antwort.raise_for_status()

    daten = antwort.json()["hourly"]
    w = pd.DataFrame({
        "time": pd.to_datetime(daten["time"]),
        "aussentemp": daten["temperature_2m"],
        "luftfeuchte": daten["relative_humidity_2m"],
        "regen": daten["precipitation"],
    })
    w.to_csv(WETTER_CACHE, index=False)
    print(f"wetter geladen: {len(w)} stunden, {w['time'].min()} bis {w['time'].max()}")
    return w


def wetter_aufbereiten(w):
    """Bringt das wetter auf das 2h-raster (temperatur und luftfeuchte gemittelt,
    regen summiert) und bildet regensummen über 6h, 12h und 48h."""
    w = w.set_index("time").sort_index()
    # open-meteo meldet den regen der stunde davor, deshalb eine stunde zurückschieben
    regen_stunde = w["regen"].shift(-1)
    w2 = pd.DataFrame({
        "aussentemp": w["aussentemp"].resample(RESAMPLE).mean(),
        "luftfeuchte": w["luftfeuchte"].resample(RESAMPLE).mean(),
        # min_count=2: fehlt eine stunde, bleibt das fenster leer statt 0 mm
        "regen_2h": regen_stunde.resample(RESAMPLE).sum(min_count=2),
    })
    for name, fenster in {"regen_6h": 3, "regen_12h": 6, "regen_48h": 24}.items():
        w2[name] = w2["regen_2h"].rolling(fenster).sum()
    return w2.reset_index()


def wetter_zuordnen(df, w2):
    """Hängt das wetter über den zeitstempel an die sensordaten."""
    df = df.merge(w2, on="time", how="left")
    fehlt = df[WETTER_SPALTEN].isna().any(axis=1).sum()
    print(f"wetter zugeordnet: bei {fehlt} von {len(df)} zeilen fehlt das wetter")
    return df


def zeige_wetter(df):
    """Kontrollausgabe: wertebereiche und regen, jedes zeitfenster nur einmal gezählt."""
    print("\n--- Wetter: wertebereiche ---")
    print(df[WETTER_SPALTEN].agg(["min", "max", "mean"]).round(2))
    fenster = df.drop_duplicates("time")
    print(f"\nzeitfenster mit regen: {(fenster['regen_2h'] > 0).sum()} von {len(fenster)}")
    print(f"regen gesamt in diesen fenstern: {fenster['regen_2h'].sum():.1f} mm")


def pruefe_zeitversatz(df, w2):
    """Grobe kontrolle der zeitzone: korreliert den feuchte-anstieg der oberen sensoren
    mit dem um k fenster verschobenen regen. Passt sie, liegt der höchstwert bei k = 1 oder später."""
    d = df[df["position"] == "oben"].copy()
    d["aenderung"] = d.groupby("block")["moisture"].diff()
    regen = w2.set_index("time")["regen_2h"]

    print("\n--- Zeitversatz-Check: regen und feuchte-anstieg (obere sensoren) ---")
    print("k = 1: regen im fenster davor | k = 0: regen im selben fenster")
    korrelationen = {}
    for k in range(-2, 4):
        korrelationen[k] = d["aenderung"].corr(d["time"].map(regen.shift(k)))
        print(f"  k = {k:+d}: korrelation {korrelationen[k]:.3f}")

    beste = max(korrelationen, key=korrelationen.get)
    if beste >= 1:
        print(f"hoechste korrelation bei k = {beste:+d}: passt zur annahme, dass die csv in ortszeit ist")
    else:
        print(f"ACHTUNG: hoechste korrelation bei k = {beste:+d}: die csv-zeiten sind "
              "evtl. zu frueh (z.b. UTC statt ortszeit), WETTER_ZEITZONE pruefen")


# ---------------------------------------------------------------------------
# 3) FEATURES UND ZIELGRÖSSE
# Aus verlauf, uhrzeit und wetter werden die eingaben fürs modell. Das modell
# lernt die änderung der feuchte in 12h.
# ---------------------------------------------------------------------------
def features_bauen(df):
    """Baut pro block lags, trend und uhrzeit sowie die zielgröße: die änderung der
    feuchte in 12h statt des absoluten werts, weil baummodelle nicht extrapolieren können."""
    df = df.sort_values(["block", "time"]).copy()
    feuchte = df.groupby("block")["moisture"]   # shift pro block, nie über eine lücke

    df["feuchte_lag_kurz"] = feuchte.shift(LAG_KURZ)
    df["feuchte_lag_lang"] = feuchte.shift(LAG_LANG)
    df["feuchte_trend"] = df["moisture"] - feuchte.shift(TREND_SCHRITTE)
    stunde = df["time"].dt.hour   # uhrzeit als kreis: 23 und 0 uhr liegen nebeneinander
    df["stunde_sin"] = np.sin(2 * np.pi * stunde / 24)
    df["stunde_cos"] = np.cos(2 * np.pi * stunde / 24)
    df["ziel_absolut"] = feuchte.shift(-HORIZONT)
    df["ziel"] = df["ziel_absolut"] - df["moisture"]

    # am blockanfang fehlen die lags, am blockende das ziel
    vorher = len(df)
    df = df.dropna(subset=MERKMALE + ["ziel"]).reset_index(drop=True)
    print(f"features gebaut: {vorher - len(df)} zeilen am blockrand entfernt, "
          f"{len(df)} uebrig")
    return df


def zeige_features(df):
    """Kontrollausgabe: erste zeilen, zeilen pro sensor und spannweite der zielgröße."""
    print("\n--- Features: erste zeilen ---")
    spalten = ["time", "block", "moisture", "feuchte_lag_kurz",
               "feuchte_lag_lang", "feuchte_trend", "ziel_absolut", "ziel"]
    print(df[spalten].head().round({c: 2 for c in spalten[2:]}).to_string())
    print("\n--- Zeilen pro sensor nach den features ---")
    print(df.groupby(SENSOR).size())
    print("\n--- Zielgroesse (aenderung in 12h): spannweite ---")
    print(df.groupby(SENSOR)["ziel"].agg(["min", "max", "std"]).round(2))


# ---------------------------------------------------------------------------
# 4) SPLIT, BASELINE UND MODELL
# Training und test werden zeitlich getrennt. Der random forest muss die baseline
# "feuchte bleibt wie jetzt" schlagen, sonst bringt er nichts.
# ---------------------------------------------------------------------------
def zeitlich_teilen(df):
    """Pro sensor ist der letzte block der test, alle davor das training. Die lücke
    dazwischen verhindert, dass testdaten ins training rutschen."""
    train_teile, test_teile = [], []
    for (bed, position), g in df.groupby(SENSOR):
        bloecke = g.groupby("block")["time"].min().sort_values().index
        if len(bloecke) < 2:
            print(f"{bed} {position}: nur ein block, kein split moeglich, uebersprungen")
            continue
        ist_test = g["block"] == bloecke[-1]
        train_teile.append(g[~ist_test])
        test_teile.append(g[ist_test])
    return pd.concat(train_teile, ignore_index=True), pd.concat(test_teile, ignore_index=True)


def zeige_split(train, test):
    """Kontrollausgabe: zeilen und zeitraum pro sensor, plus prüfung der zeitlichen trennung."""
    print("\n--- Split: training und test pro sensor ---")
    sauber = True
    for (bed, position), t in test.groupby(SENSOR):
        tr = train[(train["bed"] == bed) & (train["position"] == position)]
        sauber = sauber and tr["time"].max() < t["time"].min()
        print(f"{bed} {position}: "
              f"train {len(tr)} ({tr['time'].min():%d.%m.} bis {tr['time'].max():%d.%m.}) | "
              f"test {len(t)} ({t['time'].min():%d.%m.} bis {t['time'].max():%d.%m.})")
    print(f"\ngesamt: train {len(train)}, test {len(test)}")
    print("zeitlich sauber getrennt:", "ja" if sauber else "NEIN, bitte pruefen")


def fehler_mae_rmse(echt, vorhersage):
    """MAE = mittlerer abstand, RMSE = wie MAE, aber große fehler zählen stärker."""
    fehler = echt - vorhersage
    return fehler.abs().mean(), np.sqrt((fehler ** 2).mean())


def baseline_berechnen(test):
    """Baseline "die feuchte in 12h ist so wie jetzt", gemessen auf den testdaten in %-punkten."""
    zeilen = []
    for (bed, position), g in test.groupby(SENSOR):
        mae, rmse = fehler_mae_rmse(g["ziel_absolut"], g["moisture"])
        zeilen.append({"bed": bed, "position": position, "kohle": BEDS[bed],
                       "n_test": len(g), "baseline_mae": mae, "baseline_rmse": rmse})
    return pd.DataFrame(zeilen)


def zeige_baseline(baseline, test):
    """Kontrollausgabe: baseline pro sensor und für alle testzeilen zusammen."""
    print("\n--- Baseline: feuchte in 12h = feuchte jetzt (auf den testdaten) ---")
    print(baseline.round(3).to_string(index=False))
    mae, rmse = fehler_mae_rmse(test["ziel_absolut"], test["moisture"])
    print(f"\nalle sensoren zusammen: MAE {mae:.3f}, RMSE {rmse:.3f}  (in %-punkten)")
    print("das modell muss unter diesen werten liegen, sonst bringt es nichts")


def modelle_trainieren(train):
    """Trainiert pro sensor einen random forest, der aus den MERKMALE die änderung der
    feuchte in 12h lernt. Standardeinstellungen, damit nicht auf den test hin optimiert wird."""
    modelle = {}
    for (bed, position), g in train.groupby(SENSOR):
        modell = RandomForestRegressor(n_estimators=N_BAEUME, random_state=ZUFALLSWERT)
        modelle[(bed, position)] = modell.fit(g[MERKMALE], g["ziel"])
        print(f"trainiert: {bed} {position} auf {len(g)} zeilen")
    return modelle


def modelle_auswerten(modelle, test):
    """Vergleicht jedes modell auf den testdaten mit der baseline. Die vorhergesagte
    änderung wird dafür zurückgerechnet: feuchte jetzt + änderung."""
    zeilen = []
    for (bed, position), g in test.groupby(SENSOR):
        vorhersage = g["moisture"] + modelle[(bed, position)].predict(g[MERKMALE])
        mae, rmse = fehler_mae_rmse(g["ziel_absolut"], vorhersage)
        base_mae, base_rmse = fehler_mae_rmse(g["ziel_absolut"], g["moisture"])
        zeilen.append({
            "bed": bed, "position": position, "kohle": BEDS[bed], "n_test": len(g),
            "modell_mae": mae, "baseline_mae": base_mae,
            "modell_rmse": rmse, "baseline_rmse": base_rmse,
            "besser": "ja" if mae < base_mae else "nein",
            "verbesserung_%": (1 - mae / base_mae) * 100,
        })
    return pd.DataFrame(zeilen)


def zeige_ergebnis(ergebnis):
    """Kontrollausgabe: modell und baseline nebeneinander, gesamt nach testzeilen gewichtet."""
    print("\n--- Ergebnis: random forest gegen baseline (testdaten, in %-punkten) ---")
    print(ergebnis.drop(columns="n_test").round(3).to_string(index=False))
    n = ergebnis["n_test"]
    print(f"\nalle sensoren zusammen: modell MAE {np.average(ergebnis['modell_mae'], weights=n):.3f}"
          f" | baseline MAE {np.average(ergebnis['baseline_mae'], weights=n):.3f}")
    besser = (ergebnis["besser"] == "ja").sum()
    print(f"das modell schlaegt die baseline bei {besser} von {len(ergebnis)} sensoren")
    print("verbesserung_%: positiv = modell besser als baseline, negativ = schlechter")


def zeige_wichtigkeit(modelle):
    """Kontrollausgabe: wie stark jede eingabe das modell beeinflusst, pro sensor summe 1."""
    tabelle = pd.DataFrame({
        f"{bed} {position}": pd.Series(modell.feature_importances_, index=MERKMALE)
        for (bed, position), modell in modelle.items()
    })
    print("\n--- Feature Importance (pro sensor, summe = 1) ---")
    print(tabelle.round(2).to_string())


# ---------------------------------------------------------------------------
# HAUPTPROGRAMM
# Ruft alle schritte nacheinander auf, jeder schritt arbeitet mit dem ergebnis
# des vorherigen.
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    roh = lade_daten_csv()
    print("roh geladen:", roh.shape)
    df = aufbereiten(roh)
    print("nach resample:", df.shape)
    df = leeren_anfang_abschneiden(df)
    df = bloecke_markieren(df)
    print("nach block-aufteilung:", df.shape)
    zeige_ueberblick(df)
    zeige_bloecke(df)

    wetter = wetter_aufbereiten(lade_wetter(df["time"].min(), df["time"].max()))
    df = wetter_zuordnen(df, wetter)
    zeige_wetter(df)
    pruefe_zeitversatz(df, wetter)

    df = features_bauen(df)
    zeige_features(df)

    train, test = zeitlich_teilen(df)
    zeige_split(train, test)
    zeige_baseline(baseline_berechnen(test), test)

    modelle = modelle_trainieren(train)
    zeige_ergebnis(modelle_auswerten(modelle, test))
    zeige_wichtigkeit(modelle)