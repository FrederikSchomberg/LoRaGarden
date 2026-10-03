import "./EmilyDashboard.css";

type EmilyDashboardProps = {
  onZurueck: () => void;
};

export function EmilyDashboard({
  onZurueck,
}: EmilyDashboardProps) {
  return (
    <div className="emily-seite">
      <header className="emily-kopf">
        <div>
          <p className="emily-klein">Smart Gardening</p>
          <h1>Emily Dashboard</h1>
        </div>

        <button type="button" onClick={onZurueck}>
          Zurück
        </button>
      </header>

      <main className="emily-inhalt">
        <section className="emily-einleitung">
          <h2>Sensorübersicht</h2>

          <p>
            Hier werden später die Messwerte von Emilys Sensoren angezeigt.
          </p>
        </section>

        <section className="emily-grid">
          <article className="emily-karte">
            <h3>Bodenfeuchtigkeit</h3>
            <p>Noch keine Daten vorhanden.</p>
          </article>

          <article className="emily-karte">
            <h3>Temperatur</h3>
            <p>Noch keine Daten vorhanden.</p>
          </article>

          <article className="emily-karte">
            <h3>Weitere Messwerte</h3>
            <p>Noch keine Daten vorhanden.</p>
          </article>
        </section>
      </main>

      <footer className="emily-fuss">
        Smart Gardening – Softwarepraktikum der Hochschule Bochum
      </footer>
    </div>
  );
}