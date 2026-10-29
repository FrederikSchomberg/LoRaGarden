import {
  beetName,
  formatiereZahl,
  mittelwert,
} from "../dashboardUtils";
import type { BeetDaten } from "../types/dashboard";
import "../styles/components/dashboard-card.css";
import "../styles/components/summary-cards.css";

type SummaryCardsProps = {
  beete: BeetDaten[];
};

export function SummaryCards({ beete }: SummaryCardsProps) {
  let trockenesBeet: BeetDaten | null = null;
  let trockenWert: number | null = null;
  let warmesBeet: BeetDaten | null = null;
  let warmWert: number | null = null;

  for (const beet of beete) {
    const feuchte = mittelwert(beet, "soil_moisture");
    const temperatur = mittelwert(beet, "soil_temperature");

    if (feuchte !== null && (trockenWert === null || feuchte < trockenWert)) {
      trockenWert = feuchte;
      trockenesBeet = beet;
    }

    if (temperatur !== null && (warmWert === null || temperatur > warmWert)) {
      warmWert = temperatur;
      warmesBeet = beet;
    }
  }

  const sensorAnzahl = beete.reduce(
    (gesamt, beet) => gesamt + beet.sensors.length,
    0,
  );

  return (
    <section className="kurz-grid" aria-label="Schneller Vergleich">
      <article className="dashboard-karte">
        <span>Trockenstes Beet</span>
        <strong>{trockenesBeet ? beetName(trockenesBeet) : "-"}</strong>
        <small>{formatiereZahl(trockenWert, " %", 1)} im Durchschnitt</small>
      </article>

      <article className="dashboard-karte">
        <span>Wärmstes Beet</span>
        <strong>{warmesBeet ? beetName(warmesBeet) : "-"}</strong>
        <small>{formatiereZahl(warmWert, " °C", 1)} im Durchschnitt</small>
      </article>

      <article className="dashboard-karte">
        <span>Messstellen</span>
        <strong>{sensorAnzahl} Sensoren</strong>
        <small>jeweils oben und unten im Beet</small>
      </article>
    </section>
  );
}