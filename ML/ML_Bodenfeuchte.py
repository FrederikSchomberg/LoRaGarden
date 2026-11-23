"""
Bodenfeuchte-Modell mit Gießbefehl: ein Modell für alle Beete.
Ablauf: Daten einlesen -> Gießzeiten raten -> Feuchte in 24 h vorhersagen -> Gießbefehl.
Nötig: "Alle Beete-data.csv" im selben Ordner (Grafana-Export), die Wetterdateien entstehen selbst.
Installieren: pip install pandas numpy scikit-learn requests
"""

# 1) BIBLIOTHEKEN UND EINSTELLUNGEN
from pathlib import Path                                                    # Dateipfade, die auf jedem Rechner gehen
import numpy as np                                                          # Rechnen mit Zahlenreihen
import pandas as pd                                                         # Tabellen: das Hauptwerkzeug für Zeitreihen
import requests                                                             # Holt Daten aus dem Internet
from sklearn.ensemble import ExtraTreesRegressor                            # Das Modell: viele Bäume, Antworten gemittelt

ORDNER = Path(__file__).resolve().parent                                    # Ordner des Skripts: Alle Dateien liegen hier
BEETE = ["Berta", "Carla", "Ilse"]                                          # Beetnamen wie in den CSV-Spalten
ORT = {"latitude": 51.445, "longitude": 7.262}                              # Bochum: Das Wetter muss vom Ort kommen
GEWICHT_OBEN = 0.5                                                          # Oben und unten zählen gleich
P_PFLANZE = 0.5                                                             # Wie viel Wasser darf fehlen, bevor gegossen wird
# Ein Zeitschritt = 2 Stunden. Also: 1 Schritt = 2 h, 3 = 6 h, 6 = 12 h, 12 = 24 h.

# 2) HILFSFUNKTIONEN
def open_meteo(url, hourly, start, ende):                                   # Holt stündliches Wetter von Open-Meteo
    # Ort, Zeitraum und gewünschte Werte
    anfrage = {**ORT, "start_date": f"{start:%Y-%m-%d}", "end_date": f"{ende:%Y-%m-%d}", "hourly": hourly}
    antwort = requests.get(url, params=anfrage, timeout=60)                 # Anfrage ins Internet schicken
    antwort.raise_for_status()                                              # Bei Fehler der Seite sofort anhalten
    return pd.DataFrame(antwort.json()["hourly"])                           # Antwort als Tabelle zurückgeben


def luecken_fuellen(s):                                                     # Füllt kleine Lücken, große Ausfälle bleiben leer
    laenge = s.isna().groupby(s.notna().cumsum()).transform("sum")          # Länge der Lücke, in der die Zeile liegt
    # Gerade Linie bis 3 Schritte (6 h), längere bleiben leer
    return s.interpolate(limit_area="inside").mask(s.isna() & (laenge > 3))


# Frisches Modell: Test und Empfehlung nutzen dasselbe
def neues_modell():
    # 200 Bäume; Blatt ab 10 Zeilen + halbe Eingaben = keine Einzeltage merken; random_state = gleiches Ergebnis
    return ExtraTreesRegressor(n_estimators=200, min_samples_leaf=10, max_features=0.5, random_state=0)


def uhrzeit(index):                                                         # Weltzeit -> unsere Uhrzeit, gut lesbar
    # z. B. "03.11. 09:00"
    return index.tz_localize("UTC").tz_convert("Europe/Berlin").strftime("%d.%m. %H:%M")

# 3) SENSORDATEN LADEN
roh = pd.read_csv(ORDNER / "Alle Beete-data.csv", parse_dates=["Time"])     # Sensordatei einlesen, "Time" als Uhrzeit
# Am 25.10. Uhr zurückgestellt: Eine Uhrzeit kommt doppelt vor
zweites_mal = roh["Time"].duplicated()
# Deutsche Zeit mit Sommer-/Winterzeit versehen (zweites Mal = Winterzeit)
zeit = roh["Time"].dt.tz_localize("Europe/Berlin", ambiguous=(~zweites_mal).to_numpy())
# Auf Weltzeit (UTC) umstellen, damit es zum Wetter passt
roh["Time"] = zeit.dt.tz_convert("UTC").dt.tz_localize(None)
roh = roh.set_index("Time")                                                 # Uhrzeit wird Zeilenname: leicht nach Zeit rechnen

# 4) WETTER UND REGENVORHERSAGE
WETTER = ORDNER / "wetter_cache_utc.csv"                                    # Gespeichertes Wetter: nicht jedes Mal neu holen
PROGNOSE = ORDNER / "wetter_vorhersage_cache_utc.csv"                       # Gespeicherte Regenvorhersage
# Wetter ab 2 Tage vor dem ersten Messwert (48-h-Regensumme)
von = (roh.index.min() - pd.Timedelta(days=2)).normalize()
if not WETTER.exists():                                                     # Gibt es die Wetterdatei noch nicht, ...
    # Open-Meteo-Namen -> unsere Namen
    namen = {"temperature_2m": "aussentemp", "relative_humidity_2m": "luftfeuchte", "precipitation": "regen",
             "et0_fao_evapotranspiration": "et0", "shortwave_radiation": "einstrahlung"}
    # ... Wetter holen ...
    wetter_neu = open_meteo("https://archive-api.open-meteo.com/v1/archive", ",".join(namen), von, roh.index.max())
    wetter_neu.rename(columns=namen).to_csv(WETTER, index=False)            # ... umbenennen und speichern
w = pd.read_csv(WETTER, parse_dates=["time"], index_col="time")             # Wetter einlesen, Uhrzeit wird Zeilenname
if w.index.min() > von or w.index.max() < roh.index.max().floor("h"):       # Deckt das Wetter alle Sensordaten ab?
    # Sonst anhalten, damit keine Zeilen still verloren gehen
    raise SystemExit("Wetterdatei zu kurz: bitte wetter_cache_utc.csv löschen und neu starten.")

# Temperatur, Luftfeuchte (Trocknung), Sonne (1 h nach vorn)
wetter = pd.DataFrame({"aussentemp": w["aussentemp"], "luftfeuchte": w["luftfeuchte"],
                       "einstrahlung": w["einstrahlung"].shift(-1)})
# Pro Eintrag: neuer Name, Quelle, Stunden
for name, spalte, stunden in [("regen_jetzt", "regen", 2), ("regen_6h", "regen", 6), ("regen_12h", "regen", 12),
                              ("regen_48h", "regen", 48), ("et0_24h", "et0", 24)]:
    # Summe der letzten N Stunden bis zum Zeitschritt-Ende (Open-Meteo zählt die Stunde davor)
    wetter[name] = w[spalte].rolling(stunden).sum().shift(-2)

# Echter Regen der nächsten 24 h: geschummelt, nur Obergrenze
prognose = pd.DataFrame({"regen_echt_24h": w["regen"].rolling(24).sum().shift(-26)})
prognose_da = True                                                          # Merker: Gibt es die Vorhersage?
# Vorhersage holen; scheitert es, läuft das Skript ohne sie
try:
    if not PROGNOSE.exists():                                               # Nur holen, wenn die Datei fehlt
        # Vorhersage von gestern ("previous_day1") holen
        alt = open_meteo("https://previous-runs-api.open-meteo.com/v1/forecast", "precipitation_previous_day1",
                         roh.index.min(), roh.index.max() + pd.Timedelta(days=2))
        # Nur Zeit und Regen speichern
        alt[["time", "precipitation_previous_day1"]].to_csv(PROGNOSE, index=False)
    # Vorhersage einlesen (erste Spalte = Regen in mm)
    p = pd.read_csv(PROGNOSE, parse_dates=["time"], index_col="time").iloc[:, 0]
    # Datei fast leer oder zu kurz?
    if p.notna().mean() < 0.9 or p.index.max() < roh.index.max().floor("h"):
        # Dann als Fehler behandeln
        raise ValueError("Datei leer oder zu kurz, bitte wetter_vorhersage_cache_utc.csv löschen")
    # Vorhergesagter Regen der nächsten 24 h, wie der echte berechnet
    prognose["regen_prog_24h"] = p.rolling(24).sum().shift(-26)
# Fehler im Internet, im Namen oder in den Werten abfangen
except (requests.RequestException, KeyError, ValueError) as fehler:
    # Sagen, was schiefging
    print(f"Hinweis: Regenvorhersage nicht verfügbar ({type(fehler).__name__}: {str(fehler)[:100]}).",
          "Es läuft ohne sie weiter.\n")
    prognose_da = False                                                     # Ab jetzt ohne Vorhersage weiterrechnen

# 5) PRO BEET: SENSORFUSION, GIESSSCHWELLE, GIESSZEITEN RATEN, EINGABEN FÜRS MODELL
# Alle Eingaben, die nur Vergangenes nutzen
basis = ["lag_kurz", "lag_lang", "trend", "stunde_sin", "stunde_cos"] + list(wetter.columns)
# Sammelplätze: fertige Beet-Tabellen und schnelle Anstiege
beete, anstiege = [], []
for beet in BEETE:                                                          # Für jedes Beet einmal dasselbe
    sensor = {}                                                             # Hier landen die Werte von oben und unten
    for pos in ["Oben", "Unten"]:                                           # Beide Sensoren des Beetes
        spalte = f"{beet} {pos} Bodenfeuchtigkeit"                          # Spaltenname, z. B. "Carla Oben Bodenfeuchtigkeit"
        # Zwei Spalten pro Sensor: Die zweite füllt die Lücken der ersten
        feuchte = roh[spalte].combine_first(roh[spalte + ".1"])
        sensor[pos] = luecken_fuellen(feuchte.resample("2h").mean())        # Ein Wert alle 2 h, kleine Lücken füllen
    # Sensorfusion: Mittel aus oben und unten (fehlt einer, bleibt es leer)
    f = GEWICHT_OBEN * sensor["Oben"] + (1 - GEWICHT_OBEN) * sensor["Unten"]

    # Boden = Tank: "voll" = obere 5 %, "leer" = untere 5 % der Werte
    voll, leer = f.quantile(0.95), f.quantile(0.05)
    # Gießschwelle (FAO): voll minus erlaubter Wasserverlust
    schwelle = voll - P_PFLANZE * (voll - leer)
    # Tabelle des Beetes: Name, Feuchte oben, Beet-Feuchte, Schwelle
    g = pd.DataFrame({"bed": beet, "oben": sensor["Oben"], "feuchte": f, "schwelle": schwelle})
    g = g.join(wetter).join(prognose)                                       # Dazu Wetter und Regen der Zukunft (nach Uhrzeit)

    anstieg = g["oben"].diff(1)                                             # Anstieg der Feuchte oben pro Zeitschritt (2 h)
    # Schneller Anstieg (ab 0,5) nach 6 h Ruhe: gegossen oder Regen
    beginn = (anstieg >= 0.5) & (anstieg.shift(1).rolling(3).max() < 0.5)
    # Regen der letzten 6 h: <0,2 mm gegossen, ab 2 mm Regen
    g["einstufung"] = pd.cut(g["regen_6h"], [-np.inf, 0.2, 2, np.inf],
                             labels=["vermutlich gegossen", "unklar", "Regen"], right=False)
    anstiege.append(g[beginn].assign(anstieg=anstieg[beginn]))              # Anstiege samt Stärke für die Liste merken

    g["lag_kurz"] = f.shift(1)                                              # Eingabe: Feuchte einen Zeitschritt davor
    g["lag_lang"] = f.shift(12)                                             # Eingabe: Feuchte vor 24 h
    g["trend"] = f - f.shift(6)                                             # Eingabe: Änderung der letzten 12 h
    # Eingabe: Uhrzeit als Kreis (Teil 1): 23 Uhr nah bei 0 Uhr
    g["stunde_sin"] = np.sin(2 * np.pi * g.index.hour / 24)
    g["stunde_cos"] = np.cos(2 * np.pi * g.index.hour / 24)                 # Eingabe: Uhrzeit als Kreis (Teil 2)
    g["ziel"] = f.shift(-12) - f                                            # Ziel: Änderung der Feuchte in 24 h
    # Zeilen ohne Eingaben weglassen (letzte 24 h ohne Ziel bleiben)
    beete.append(g.dropna(subset=basis))
daten = pd.concat(beete)                                                    # Alle Beete zu einer großen Tabelle

# Was weiß das Modell vom künftigen Regen? Variante 1: nichts
VARIANTEN = {"nur vergangenes Wetter": basis}
if prognose_da:                                                             # Variante 2 nur, wenn die Vorhersage geholt wurde
    # Variante 2: dazu die Vorhersage (im Betrieb möglich)
    VARIANTEN["mit Regenvorhersage von gestern"] = basis + ["regen_prog_24h"]
# Variante 3: dazu der echte Regen (nur zum Vergleich)
VARIANTEN["mit echtem Regen (geschummelt)"] = basis + ["regen_echt_24h"]
# Alltags-Variante: Vorhersage, sonst nur Vergangenes
HAUPT = list(VARIANTEN)[-2]
# Alle Regenspalten, die bekannt sein müssen
regen_spalten = ["regen_echt_24h"] + (["regen_prog_24h"] if prognose_da else [])
# Nur Zeilen mit Ergebnis UND allen Regenspalten: Varianten vergleichbar
lernbar = daten.dropna(subset=["ziel"] + regen_spalten)
# Zur Kontrolle ausgeben
print("Gießschwelle pro Beet in %:", daten.groupby("bed")["schwelle"].first().round(1).to_dict(), "\n")

# Geratene Gießzeiten: Anstiege aller Beete, nach Zeit sortiert
liste = pd.concat(anstiege).sort_index(kind="stable")
liste.insert(0, "uhrzeit", uhrzeit(liste.index))                            # Spalte mit unserer Uhrzeit vorn einfügen
# Nur wichtige Spalten, eine Stelle
liste = liste[["uhrzeit", "bed", "anstieg", "regen_6h", "einstufung"]].round(1)
# Liste ausgeben
print("Schnelle Anstiege oben und was wir daraus raten:\n", liste.to_string(index=False), "\n", sep="")
liste.to_csv(ORDNER / "giessen_geraten.csv", index=False)                   # Liste als Datei speichern

# 6) TESTEN: Wie gut ist das Modell gegenüber "die Feuchte bleibt wie jetzt" (Baseline)?
# Letzte 30 Tage in 6 Zeiträume zu je 5 Tagen
FENSTER = pd.date_range(end=roh.index.max().ceil("D"), periods=7, freq="5D")


# Prüft in allen 6 Zeiträumen (neues_beet=True: Modell lernt ohne das geprüfte Beet)
def pruefen(neues_beet, merkmale):
    ergebnisse = []                                                         # Ergebnisse der einzelnen Zeiträume
    for start, ende in zip(FENSTER[:-1], FENSTER[1:]):                      # Für jeden Zeitraum: Beginn und Ende
        # Bei "neues Beet" einmal pro Beet, sonst einmal für alle
        for beet in (BEETE if neues_beet else [None]):
            # Lernstoff: nur bis 24 h vor dem Zeitraum (Sicherheitsabstand)
            train = lernbar[lernbar.index <= start - pd.Timedelta(hours=24)]
            # Prüfungsaufgaben: Zeilen des Zeitraums
            test = lernbar[(lernbar.index >= start) & (lernbar.index < ende)]
            if beet:                                                        # Beim Test mit neuem Beet ...
                # ... lernt das Modell ohne dieses Beet und wird nur darauf geprüft
                train, test = train[train["bed"] != beet], test[test["bed"] == beet]
            if test.empty:                                                  # Keine Zeilen im Zeitraum (z. B. Sensorausfall)?
                continue                                                    # Dann überspringen
            # Lernen (fit), dann vorhersagen (predict)
            vorhersage = neues_modell().fit(train[merkmale], train["ziel"]).predict(test[merkmale])
            # Merken: Vorhersage, Fehler der Baseline (= echte Änderung), Fehler des Modells
            ergebnisse.append(test.assign(vorhersage=vorhersage, fenster=start, baseline=test["ziel"].abs(),
                                          modell=(test["ziel"] - vorhersage).abs()))
    return pd.concat(ergebnisse)                                            # Alle Zeiträume zu einer Tabelle


# Zeigt den mittleren Fehler und prüft den Gießbefehl
def auswerten(erg, titel):
    je_fenster = erg.groupby("fenster")[["baseline", "modell"]].mean()      # Mittlerer Fehler pro Zeitraum
    # Überschrift und Fehler pro Beet
    print(f"\n=== {titel} ===", erg.groupby("bed")[["baseline", "modell"]].mean().round(3), sep="\n")
    gewonnen = (je_fenster["modell"] < je_fenster["baseline"]).sum()        # In wie vielen Zeiträumen ist das Modell besser?
    # Gesamtfehler und gewonnene Zeiträume
    print(f"alle zusammen: Baseline {erg['baseline'].mean():.3f} | Modell {erg['modell'].mean():.3f}, "
          f"das Modell ist in {gewonnen} von {len(je_fenster)} Testzeiträumen besser\n")
    # Wahrheit: War es nach 24 h wirklich unter der Schwelle?
    echt = erg["feuchte"] + erg["ziel"] < erg["schwelle"]
    baseline_sagt = erg["feuchte"] < erg["schwelle"]                        # Baseline: gießen, wenn es schon trocken ist
    modell_sagt = erg["feuchte"] + erg["vorhersage"] < erg["schwelle"]      # Modell: gießen, wenn es in 24 h trocken sein wird
    # Jetzt noch feucht genug, später trocken: Hier hilft eine Vorwarnung
    neu = echt & ~baseline_sagt
    # Zählt: richtig erkannt, davon Vorwarnung, Fehlalarm
    zaehlen = lambda sagt: [(sagt & echt).sum(), (sagt & neu).sum(), (sagt & ~echt).sum()]
    # Kleine Tabelle: Baseline gegen Modell
    tabelle = pd.DataFrame({"Baseline": zaehlen(baseline_sagt), "Modell": zaehlen(modell_sagt)},
                           index=[f"trockene Fälle erkannt (von {echt.sum()})",
                                  f"davon Vorwarnung (von {neu.sum()})", "Fehlalarme"])
    print(tabelle)                                                          # Tabelle ausgeben

# Jede Variante in beiden Tests: (a) Beete bekannt, (b) Beet neu
ergebnis = {name: (pruefen(False, m), pruefen(True, m)) for name, m in VARIANTEN.items()}
# Überschrift mit Baseline-Fehler
print(f"Vergleich der Wetter-Varianten (Baseline 'es ändert sich nichts': {ergebnis[HAUPT][0]['baseline'].mean():.3f})")
print(f"{'':34s} (a) Beete bekannt | (b) Beet neu")                         # Spaltenköpfe
for name, (a, b) in ergebnis.items():                                       # Pro Variante eine Zeile
    # Fehler des Modells in Test (a) und (b)
    print(f"{name:34s} {a['modell'].mean():16.3f} | {b['modell'].mean():11.3f}")
# Details zu Test (a)
auswerten(ergebnis[HAUPT][0], f"Test (a): Modell kennt alle Beete, die Zeit ist neu ({HAUPT})")
# Details zu Test (b)
auswerten(ergebnis[HAUPT][1], f"Test (b): Modell hat das Beet NIE gesehen ({HAUPT})")

# 7) AKTUELLE EMPFEHLUNG: Soll jetzt gegossen werden?
merkmale = VARIANTEN[HAUPT]                                                 # Eingaben der Alltags-Variante
# Pro Beet die letzte vollständige Zeile = aktueller Stand
jetzt = daten.dropna(subset=merkmale).groupby("bed").tail(1)
# Mit allen Daten lernen, Änderung in 24 h vorhersagen
aenderung = neues_modell().fit(lernbar[merkmale], lernbar["ziel"]).predict(jetzt[merkmale])
# Tabelle: Beet, Feuchte jetzt, Schwelle
e = jetzt[["bed", "feuchte", "schwelle"]].rename(columns={"feuchte": "feuchte_jetzt"})
e["aenderung_24h"] = aenderung                                              # Dazu die vorhergesagte Änderung
e["erwartet_24h"] = e["feuchte_jetzt"] + e["aenderung_24h"]                 # Erwartete Feuchte in 24 h = jetzt + Änderung
# Gießbefehl: unter der Schwelle = gießen
e["befehl"] = np.where(e["erwartet_24h"] < e["schwelle"], "GIESSEN", "noch nicht gießen")
e.insert(0, "stand", uhrzeit(e.index))                                      # Zeitpunkt des letzten Messwerts vorn einfügen
e = e.round(1).reset_index(drop=True)                                       # Eine Stelle, Zeilen neu nummerieren
e["aenderung_24h"] += 0.0                                                   # Verhindert die Anzeige "-0.0"
# Empfehlung ausgeben
print(f"\nAktuelle Empfehlung (Feuchte in %, Variante: {HAUPT}):", e.to_string(), sep="\n")
e.to_csv(ORDNER / "giessempfehlung.csv", index=False)                       # Empfehlung als Datei speichern