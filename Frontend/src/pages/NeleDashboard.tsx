import { useCallback, useEffect, useState } from "react";
import "../styles/pages/nele-dashboard.css";
import { holeNeleDashboard } from "../api";
import { BedCard } from "../components/BedCard";
import { ComparisonTable } from "../components/ComparisonTable";
import { DemoNotice } from "../components/DemoNotice";
import { StatusFooter } from "../components/StatusFooter";
import { SummaryCards } from "../components/SummaryCards";
import HistorischeDaten from "../components/HistorischeDaten";
import { letzteMessung, formatiereZeit } from "../dashboardUtils";
import { neleBeispielDaten } from "../data/mockData";
import type { DashboardResponse } from "../types/dashboard";
import type { User } from "../types/auth";

type NeleDashboardProps = {
  onZurueck: () => void;
  user?: User | null;
  onLogout?: () => void;
};

export function NeleDashboard({
  onZurueck,
  user,
  onLogout,
}: NeleDashboardProps) {
  // damit wir wieder oben landen wenn wir das dashboard über den link öffnen
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  // ohne vpn stehen hier zuerst beispieldaten drin
  const [daten, setDaten] = useState<DashboardResponse>(neleBeispielDaten);
  const [demo, setDemo] = useState(true);
  const [fehler, setFehler] = useState("");
  const [laedt, setLaedt] = useState(false);

  // Aktiver Tab
  const [aktiverTab, setAktiverTab] = useState<
    "aktuell" | "historisch" | "historischNeu"
  >("aktuell");

  const [historischeBeete, setHistorischeBeete] = useState<string[]>(["Beet 1"]);

  const [historischeMesswerte, setHistorischeMesswerte] = useState<string[]>([
    "temperature",
  ]);

  const [historischerZeitraum, setHistorischerZeitraum] = useState("7d");

  const holeDaten = useCallback(async () => {
    setLaedt(true);

    try {
      const neu = await holeNeleDashboard();
      console.log("Nele – Neue Daten:", neu);

      setDaten(neu);
      setDemo(false);
      setFehler("");
    } catch {
      setDaten(neleBeispielDaten);
      setDemo(true);
      setFehler(
        "Backend nicht erreichbar – es werden Beispieldaten angezeigt.",
      );
    } finally {
      setLaedt(false);
    }
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => void holeDaten(), 0);

    // im 15 min intervall wird die seite neu geladen
    const timer = window.setInterval(() => void holeDaten(), 900000);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [holeDaten]);

  const letzterStand = letzteMessung(daten.beds);

  return (
    <div className="dashboard-page">
      <div className="dashboard-background" aria-hidden="true">
        <div className="green-orb green-orb-1" />
        <div className="green-orb green-orb-2" />
        <div className="green-orb green-orb-3" />
        <div className="green-orb green-orb-4" />
      </div>

      <main className="app">
        <header className="kopf">
          <div className="kopf-text">
            <h1>Nele Dashboard</h1>

            <p className="kopf-beschreibung">
              Beet 1, Beet 2 und Beet 3 auf einen Blick. Die großen Werte sind immer der
              Durchschnitt aus den Sensoren 1, 2 und 3.
            </p>
          </div>

          <div className="kopf-rechts">
            <div className="kopf-status">
              <button type="button" onClick={holeDaten} disabled={laedt}>
                {laedt ? "wird geladen ..." : "Daten neu laden"}
              </button>

              <div className={demo ? "daten-status demo" : "daten-status live"}>
                <span />
                {demo ? "Beispieldaten" : "Live"}
              </div>
            </div>

            <p>{demo ? "" : `Letzter Stand: ${formatiereZeit(letzterStand)}`}</p>

            <div className="kopf-aktionen">
              {user ? (
                <div className="kopf-benutzer">
                  <button
                    type="button"
                    className="kopf-benutzer-name"
                    onClick={onZurueck}
                    title="Zur internen Seite"
                    aria-label={`Angemeldet als ${user.name} – Zur internen Seite wechseln`}
                  >
                    👤 {user.name}
                  </button>

                  {onLogout && (
                    <button
                      type="button"
                      className="btn-abmelden"
                      onClick={onLogout}
                    >
                      Abmelden
                    </button>
                  )}
                </div>
              ) : null}

              <button
                type="button"
                className="btn-abmelden"
                onClick={onZurueck}
              >
                Zurück
              </button>
            </div>
          </div>
        </header>

        {/* Navigation zwischen aktuellem und historischem Dashboard */}
        <nav className="tabs" aria-label="Dashboard Navigation">
          <button
            type="button"
            className={aktiverTab === "aktuell" ? "tab aktiv" : "tab"}
            onClick={() => setAktiverTab("aktuell")}
          >
            Aktuelle Daten
          </button>


          <button
            type="button"
            className={aktiverTab === "historisch" ? "tab aktiv" : "tab"}
            onClick={() => {
              setAktiverTab("historisch");
            }}
          >
            Historische Daten
          </button>
        </nav>

        {/* Aktuelle Daten */}
        {aktiverTab === "aktuell" && (
          <>
            {demo && <DemoNotice fehler={fehler} />}

            <SummaryCards
              beete={daten.beds}
              messstellenBeschreibung="jeweils 3 Sensoren im Beet"
            />

            <section className="beet-grid" aria-label="Beete">
              {daten.beds.map((beet) => (
                <BedCard
                  key={beet.name}
                  beet={beet}
                  demo={demo}
                  positionen={["1", "2", "3"]}
                />
              ))}
            </section>

            <ComparisonTable
              beete={daten.beds}
              untertitel="Sensoren 1, 2 und 3 getrennt"
              positionen={[
                { key: "1", label: "1" },
                { key: "2", label: "2" },
                { key: "3", label: "3" },
              ]}
            />

            <StatusFooter
              demo={demo}
              datenbankVerbunden={daten.database.connected}
            />
          </>
        )}

        {/* Historische Daten */}
        {aktiverTab === "historisch" && (
          <HistorischeDaten
            selectedBeds={historischeBeete}
            setSelectedBeds={setHistorischeBeete}
            selectedMeasurements={historischeMesswerte}
            setSelectedMeasurements={setHistorischeMesswerte}
            zeitraum={historischerZeitraum}
            setZeitraum={setHistorischerZeitraum}
            bedNames={["Beet 1", "Beet 2", "Beet 3"]}
            bedColors={{
              "Beet 1": "#2563eb",
              "Beet 2": "#16a34a",
              "Beet 3": "#ea580c",
            }}
          />
        )}
      </main>
    </div>
  );
}
