import "./LandingPage.css";

type LandingPageProps = {
  onDashboardOeffnen: () => void;
};

export function LandingPage({
  onDashboardOeffnen,
}: LandingPageProps) {
  return (
    <div className="landingpage">
      <header className="landingpage-kopf">
        <p>Hochschule Bochum</p>
        <h1>Smart Gardening</h1>
        <span>Wähle einen Standort aus</span>
      </header>

      <main className="landingpage-inhalt">
        <h2>Unsere Standorte</h2>

        <section className="standort-grid">
          <article className="standort-karte">
            <h3>Botanischer Garten</h3>
            <p>Hier befinden sich die Beete Ilse, Berta und Carla.</p>

            <button type="button" onClick={onDashboardOeffnen}>
              Dashboard öffnen
            </button>
          </article>

          <article className="standort-karte">
            <h3>BOAse</h3>
            <p>Für diesen Standort stehen noch keine Daten bereit.</p>

            <button type="button" disabled>
              Noch nicht verfügbar
            </button>
          </article>

          <article className="standort-karte">
            <h3>Chinesischer Garten</h3>
            <p>Für diesen Standort stehen noch keine Daten bereit.</p>

            <button type="button" disabled>
              Noch nicht verfügbar
            </button>
          </article>
        </section>
      </main>

      <footer className="landingpage-fuss">
        Smart Gardening – Softwarepraktikum
      </footer>
    </div>
  );
}