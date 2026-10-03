import "./InternalPage.css";
import grafanaIcon from "../assets/grafana_icon.svg";
import monitorIcon from "../assets/monitor-up.svg";
import soilSensorIcon from "../assets/soil-sensor.svg";

type InternalPageProps = {
  onDashboardOeffnen: () => void;
  onNeleOeffnen: () => void;
};

export function InternalPage({
  onDashboardOeffnen,
  onNeleOeffnen,
}: InternalPageProps) {
  return (
    <div className="intern-seite">
      <header className="intern-kopf">
        <div>
          <p className="intern-klein">Smart Gardening</p>
          <h1>Interner Bereich</h1>
        </div>

        <button type="button" disabled>
          Abmelden
        </button>
      </header>

      <main className="intern-inhalt">
        <div className="intern-einleitung">
          <h2>Übersicht</h2>

          <p>
            Von hier aus können die verschiedenen Dashboards und Auswertungen
            geöffnet werden.
          </p>
        </div>

        <section className="intern-grid" aria-label="Interne Anwendungen">
          <article className="intern-karte">
            <div className="intern-icon">
              <img src={monitorIcon} alt="" aria-hidden="true" />
            </div>

            <h3>Smart-Gardening Dashboard</h3>

            <p>
              Aktuelle Sensordaten und Messwerte der verschiedenen Beete
              anzeigen.
            </p>

            <button type="button" onClick={onDashboardOeffnen}>
              Dashboard öffnen
            </button>
          </article>

          <article className="intern-karte">
            <div className="intern-icon">
              <img src={grafanaIcon} alt="" aria-hidden="true" />
            </div>

            <h3>Grafana</h3>

            <p>
              Technische Messwerte und historische Daten in Grafana anzeigen.
            </p>

            <button
              type="button"
              onClick={() =>
                window.open(
                  "http://sr-labor.ddns.net:3088/d/adtpq57/rooftop?from=now-24h&to=now&timezone=browser&var-query0=",
                  "_blank",
                )
              }
            >
              Grafana öffnen
            </button>
          </article>

          <article className="intern-karte">
            <div className="intern-icon">
              <img src={soilSensorIcon} alt="" aria-hidden="true" />
            </div>

            <h3>Nele Dashboard</h3>

            <p>
              Zusätzlicher Bereich für die Sensordaten von Neles
              Versuchsfläche.
            </p>

            <button type="button" onClick={onNeleOeffnen}>
              Dashboard öffnen
            </button>
          </article>
        </section>
      </main>

      <footer className="intern-fuss">
        Smart Gardening – Softwarepraktikum der Hochschule Bochum
      </footer>
    </div>
  );
}
