import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { holeDashboard } from "./api";
import { BedCard } from "./components/BedCard";
import { ComparisonTable } from "./components/ComparisonTable";
import { DashboardHeader } from "./components/DashboardHeader";
import { DemoNotice } from "./components/DemoNotice";
import { StatusFooter } from "./components/StatusFooter";
import { SummaryCards } from "./components/SummaryCards";
import { letzteMessung } from "./dashboardUtils";
import { beispielDaten } from "./data/mockData";
import type { DashboardResponse } from "./types/dashboard";

function App() {
  // ohne vpn stehen hier zuerst beispieldaten drin
  const [daten, setDaten] = useState<DashboardResponse>(beispielDaten);
  const [demo, setDemo] = useState(true);
  const [fehler, setFehler] = useState("");
  const [laedt, setLaedt] = useState(false);

  const holeDaten = useCallback(async () => {
    setLaedt(true);

    try {
      const neu = await holeDashboard();

      setDaten(neu);
      setDemo(false);
      setFehler("");
    } catch {
      setDaten(beispielDaten);
      setDemo(true);
      setFehler("Backend nicht erreichbar – es werden Beispieldaten angezeigt.");
    } finally {
      setLaedt(false);
    }
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => void holeDaten(), 0);

    // 30 sekunden reichen, sonst fragen wir influx unnötig oft ab
    const timer = window.setInterval(() => void holeDaten(), 30000);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [holeDaten]);

  const letzterStand = letzteMessung(daten.beds);

  return (
    <main className="app">
      <DashboardHeader
        demo={demo}
        letzterStand={letzterStand}
        laedt={laedt}
        onNeuLaden={holeDaten}
      />

      {demo && <DemoNotice fehler={fehler} />}

      <SummaryCards beete={daten.beds} />

      <section className="beet-grid" aria-label="Beete">
        {daten.beds.map((beet) => (
          <BedCard key={beet.name} beet={beet} demo={demo} />
        ))}
      </section>

      <ComparisonTable beete={daten.beds} />

      <StatusFooter
        demo={demo}
        datenbankVerbunden={daten.database.connected}
      />
    </main>
  );
}

export default App;