import "./NeleDashboard.css";

type NeleDashboardProps = {
  onZurueck: () => void;
};

export function NeleDashboard({
  onZurueck,
}: NeleDashboardProps) {
  return (
    <div className="nele-seite">
      <header className="nele-kopf">
        <div>
          <p className="nele-klein">Smart Gardening</p>
          <h1>Nele Dashboard</h1>
        </div>

        <button type="button" onClick={onZurueck}>
          Zurück
        </button>
      </header>

      <main className="nele-inhalt">
        <section className="nele-einleitung">
          <h2>Sensorübersicht</h2>

          <p>
            Hier werden später die Messwerte von Neles Sensoren angezeigt.
          </p>
        </section>

        <section className="nele-grid">
          <article className="nele-karte">
            <h3>Bodenfeuchtigkeit</h3>
            <p>Noch keine Daten vorhanden.</p>
          </article>

          <article className="nele-karte">
            <h3>Temperatur</h3>
            <p>Noch keine Daten vorhanden.</p>
          </article>

          <article className="nele-karte">
            <h3>Weitere Messwerte</h3>
            <p>Noch keine Daten vorhanden.</p>
          </article>
        </section>
      </main>

      <footer className="nele-fuss">
        Smart Gardening – Softwarepraktikum der Hochschule Bochum
      </footer>
    </div>
  );
}