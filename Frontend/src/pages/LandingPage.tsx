import "./LandingPage.css";
import boaseBild from "../assets/boase.jpg";
import botanischerGartenBild from "../assets/botanischer_garten.jpg";
import chinesischerGartenBild from "../assets/chinesischer_garten.jpg";
import databaseIcon from "../assets/database.svg";
import draginoGarden from "../assets/dragino_garden.png";
import dropletsIcon from "../assets/droplets.svg";
import grafanaLogo from "../assets/grafana_icon.svg";
import hsBoLogo from "../assets/hs-bo_logo.svg";
import monitorUpIcon from "../assets/monitor-up.svg";
import radioTowerIcon from "../assets/radio-tower.svg";
import soilSensorIcon from "../assets/soil-sensor.svg";
import thermometerIcon from "../assets/thermometer.svg";
import zapIcon from "../assets/zap.svg";

type LandingPageProps = {
  onDashboardOeffnen: () => void;
};

export function LandingPage({ onDashboardOeffnen }: LandingPageProps) {
  return (
    <div className="landingpage">
      <header className="landingpage-navigation">
        <a
          className="landingpage-logo-link"
          href="https://www.hochschule-bochum.de/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="landingpage-logo"
            src={hsBoLogo}
            alt="Hochschule Bochum"
          />
        </a>

        <nav aria-label="Navigation der Landingpage">
          <a href="#projekt">Projekt</a>
          <a href="#standorte">Standorte</a>
          <a href="#technik">Technik</a>
        </nav>
      </header>

      <section className="landingpage-hero" id="start">
        <div className="landingpage-hero-text">
          <h1>Smart Gardening</h1>

          <p className="landingpage-untertitel">
            Digitale Bodendaten für Forschung und nachhaltige Bewässerung
          </p>

          <p className="landingpage-beschreibung">
            Unsere LoRaWAN-Sensoren erfassen Bodenfeuchte, Bodentemperatur und
            elektrische Leitfähigkeit an verschiedenen Versuchsstandorten. Die
            Messwerte werden zentral gespeichert und für Forschung, Lehre und
            eine ressourcenschonende Bewässerung aufbereitet.
          </p>

          <a
            className="grafana-link"
            href="http://sr-labor.ddns.net:3088/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={grafanaLogo} alt="" aria-hidden="true" />
            <span>Grafana öffnen</span>
          </a>
        </div>

        <div className="landingpage-hero-bild">
          <img
            src={draginoGarden}
            alt="Dragino-Bodensensoren und LoRaWAN-Gateway in einem Gartenbeet"
          />
        </div>
      </section>

      <section
        className="projekt-abschnitt"
        id="projekt"
        aria-labelledby="projekt-ueberschrift"
      >
        <div className="projekt-container">
          <div className="projekt-kopf">
            <h2 id="projekt-ueberschrift">Über das Projekt</h2>

            <p>
              Smart Gardening ist ein studentisches Softwareprojekt der
              Hochschule Bochum. In Zusammenarbeit mit der Projektstudie Carbon
              Sequestration @ NRW entwickeln wir eine digitale Lösung, die
              Bodendaten von Versuchsflächen automatisiert erfasst, speichert
              und visualisiert.
            </p>

            <p>
              CSEQ@NRW untersucht Pflanzenkohle als Möglichkeit, Kohlenstoff
              langfristig im Boden zu binden. Da Pflanzenkohle unter anderem die
              Wasser- und Nährstoffspeicherung beeinflussen kann, helfen unsere
              Messwerte dabei, Bodenbedingungen und Veränderungen über längere
              Zeiträume sichtbar und vergleichbar zu machen.
            </p>

            <a
              className="projekt-link"
              href="https://www.hochschule-bochum.de/carbon-sequestration/das-projekt/start/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mehr über Carbon Sequestration @ NRW
            </a>
          </div>

          <div className="messwert-grid">
            <article className="messwert-karte">
              <div className="messwert-icon">
                <img src={dropletsIcon} alt="" aria-hidden="true" />
              </div>

              <div>
                <h3>Bodenfeuchte</h3>
                <p>
                  Misst den Wassergehalt des Bodens und unterstützt eine
                  bedarfsgerechte Bewässerung.
                </p>
              </div>
            </article>

            <article className="messwert-karte">
              <div className="messwert-icon">
                <img src={thermometerIcon} alt="" aria-hidden="true" />
              </div>

              <div>
                <h3>Temperatur</h3>
                <p>
                  Erfasst die Bodentemperatur und macht Veränderungen zwischen
                  Beeten vergleichbar.
                </p>
              </div>
            </article>

            <article className="messwert-karte">
              <div className="messwert-icon">
                <img src={zapIcon} alt="" aria-hidden="true" />
              </div>

              <div>
                <h3>Leitwert</h3>
                <p>
                  Misst die elektrische Leitfähigkeit des Bodens.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <main className="landingpage-inhalt" id="standorte">
        <h2>Unsere Standorte</h2>

        <section className="standort-grid" aria-label="Unsere Standorte">
          <article className="standort-karte">
            <img
              className="standort-bild"
              src={botanischerGartenBild}
              alt="Botanischer Garten"
            />

            <div className="standort-karte-inhalt">
              <h3>Botanischer Garten</h3>

              <p>
                In den Beeten Ilse, Berta und Carla werden Bodendaten
                kontinuierlich erfasst und im Dashboard dargestellt.
              </p>

              <button type="button" onClick={onDashboardOeffnen}>
                Dashboard öffnen
              </button>
            </div>
          </article>

          <article className="standort-karte">
            <img
              className="standort-bild"
              src={boaseBild}
              alt="BOAse der Hochschule Bochum"
            />

            <div className="standort-karte-inhalt">
              <h3>BOAse</h3>

              <p>Für diesen Standort stehen noch keine Daten bereit.</p>

              <button type="button" disabled>
                Noch nicht verfügbar
              </button>
            </div>
          </article>

          <article className="standort-karte">
            <img
              className="standort-bild"
              src={chinesischerGartenBild}
              alt="Chinesischer Garten"
            />

            <div className="standort-karte-inhalt">
              <h3>Chinesischer Garten</h3>

              <p>Für diesen Standort stehen noch keine Daten bereit.</p>

              <button type="button" disabled>
                Noch nicht verfügbar
              </button>
            </div>
          </article>
        </section>
      </main>

      <section
        className="ablauf-abschnitt"
        id="technik"
        aria-labelledby="ablauf-ueberschrift"
      >
        <div className="ablauf-container">
          <h2 id="ablauf-ueberschrift">So funktioniert es</h2>

          <ol className="ablauf-liste">
            <li className="ablauf-schritt">
              <div className="ablauf-icon">
                <img src={soilSensorIcon} alt="" aria-hidden="true" />
              </div>

              <div className="ablauf-text">
                <h3>Sensoren</h3>
                <p>Messen Bodenfeuchte, Bodentemperatur und Leitfähigkeit.</p>
              </div>
            </li>

            <li className="ablauf-schritt">
              <div className="ablauf-icon">
                <img src={radioTowerIcon} alt="" aria-hidden="true" />
              </div>

              <div className="ablauf-text">
                <h3>LoRaWAN</h3>
                <p>
                  Überträgt die Messwerte stromsparend über große Entfernungen.
                </p>
              </div>
            </li>

            <li className="ablauf-schritt">
              <div className="ablauf-icon">
                <img src={databaseIcon} alt="" aria-hidden="true" />
              </div>

              <div className="ablauf-text">
                <h3>InfluxDB / API</h3>
                <p>
                  Speichert die Messwerte und stellt sie über die API bereit.
                </p>
              </div>
            </li>

            <li className="ablauf-schritt">
              <div className="ablauf-icon">
                <img src={monitorUpIcon} alt="" aria-hidden="true" />
              </div>

              <div className="ablauf-text">
                <h3>Dashboard &amp; Grafana</h3>
                <p>
                  Bereitet aktuelle und historische Messwerte anschaulich auf.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <footer className="landingpage-fuss">
        Smart Gardening – Softwarepraktikum der Hochschule Bochum
      </footer>
    </div>
  );
}
