import { useEffect, useState } from "react";
import "./DataFlowPage.css";
import "../styles/LandingPage.css";

import sproutIcon from "../assets/sprout.svg";
import sensorIcon from "../assets/dataflow-sensor.svg";
import lorawanIcon from "../assets/dataflow-lorawan.svg";
import brokerIcon from "../assets/dataflow-broker.svg";
import filterIcon from "../assets/dataflow-filter.svg";
import databaseIcon from "../assets/dataflow-database.svg";
import grafanaIcon from "../assets/dataflow-grafana.svg";
import apiIcon from "../assets/dataflow-api.svg";
import dashboardIcon from "../assets/dataflow-dashboard.svg";

type DataFlowPageProps = {
  onZurueck: () => void;
};

const stationen = [
  {
    name: "Dragino-Sensor",
    untertitel: "Messen im Versuchsbeet",
    kategorie: "Erfassen",
    titel: "Alles beginnt im Boden.",
    text:
      "Der Dragino-Sensor misst Bodenfeuchte, Bodentemperatur und " +
      "Leitfähigkeit. Wir begleiten einen beispielhaften Feuchtewert " +
      "aus Carla – Messstelle oben.",
    hinweis:
      "Beispielwerte zur Erklärung. Diese Animation ist nicht mit " +
      "Sensoren oder Servern verbunden.",
    paket: "Unser Beispielmesswert",
    x: 37,
    y: 57,
    icon: sensorIcon,
  },
  {
    name: "LoRaWAN",
    untertitel: "Gateway & Infrastruktur",
    kategorie: "Übertragen",
    titel: "Ein Messwert geht auf Reisen.",
    text:
      "Der Sensor sendet ein LoRaWAN-Funkpaket. Das Gateway empfängt " +
      "es. Die vorhandene LoRaWAN-Infrastruktur verarbeitet die " +
      "Nachricht und stellt sie über die MQTT-Anbindung bereit.",
    hinweis:
      "Gateway, LoRaWAN-Verarbeitung und MQTT-Anbindung sind hier " +
      "als gemeinsamer Abschnitt dargestellt.",
    paket: "Unterwegs per LoRaWAN",
    x: 342,
    y: 57,
    icon: lorawanIcon,
  },
  {
    name: "MQTT-Broker",
    untertitel: "Mosquitto verteilt Nachrichten",
    kategorie: "Verteilen",
    titel: "Die Poststelle für Messdaten.",
    text:
      "Der Mosquitto-Broker empfängt MQTT-Nachrichten. Er verteilt " +
      "sie über Nachrichtenkanäle, sogenannte Topics, an die " +
      "passenden Abonnenten. Einer davon ist Telegraf.",
    hinweis:
      "Der Broker verteilt die Nachrichten. Die langfristige " +
      "Speicherung der Messreihen übernimmt später die InfluxDB.",
    paket: "Nachricht beim Broker",
    x: 647,
    y: 57,
    icon: brokerIcon,
  },
  {
    name: "Telegraf",
    untertitel: "Empfangen & aufbereiten",
    kategorie: "Aufbereiten",
    titel: "Aus Nachrichten werden Daten.",
    text:
      "Telegraf abonniert die MQTT-Nachrichten, verarbeitet deren " +
      "Inhalte und ordnet die Messfelder zu. Anschließend schreibt " +
      "es die Messwerte in die InfluxDB.",
    hinweis:
      "Welche Nachrichten verarbeitet werden und wie die Felder " +
      "zugeordnet sind, legt die Telegraf-Konfiguration fest.",
    paket: "Bereit zum Speichern",
    x: 647,
    y: 242,
    icon: filterIcon,
  },
  {
    name: "InfluxDB",
    untertitel: "Die gemeinsame Datenbasis",
    kategorie: "Speichern",
    titel: "Ein Zuhause für Messreihen.",
    text:
      "InfluxDB speichert Messwerte mit Zeitstempeln und " +
      "Sensorzuordnung. Hier verzweigt sich der Datenweg: Grafana " +
      "und unser Backend greifen auf dieselbe Datenbasis zu.",
    hinweis:
      "Die beiden folgenden Wege sind getrennt. Grafana ist keine " +
      "Zwischenstation auf dem Weg zum React-Dashboard.",
    paket: "In der Zeitreihe gespeichert",
    x: 342,
    y: 242,
    icon: databaseIcon,
  },
  {
    name: "Grafana",
    untertitel: "Technische Detailauswertung",
    kategorie: "Auswerten",
    titel: "Der Blick ins Detail.",
    text:
      "Grafana fragt die InfluxDB direkt ab und visualisiert die " +
      "zurückgegebenen Messreihen. Das unterstützt das Projektteam " +
      "beim technischen Monitoring und bei der Detailauswertung.",
    hinweis:
      "Dieser Abzweig endet bei Grafana. Im nächsten Schritt " +
      "betrachten wir den zweiten Weg ab der InfluxDB.",
    paket: "In Grafana verfügbar",
    x: 37,
    y: 242,
    icon: grafanaIcon,
  },
  {
    name: "FastAPI",
    untertitel: "Backend & DB-Connector",
    kategorie: "Bereitstellen",
    titel: "Die Verbindung zur Anwendung.",
    text:
      "Das Dashboard sendet eine HTTP-Anfrage an FastAPI. Der " +
      "DB-Connector liest die benötigten Werte aus der InfluxDB. " +
      "Das Backend liefert die Messwerte und Beetzuordnung als JSON.",
    hinweis:
      "Die Anfrage läuft zur Datenbank. Die Pfeile in der Grafik " +
      "zeigen die Richtung der zurückgelieferten Messdaten.",
    paket: "Für die API-Antwort geladen",
    x: 342,
    y: 427,
    icon: apiIcon,
  },
  {
    name: "Dashboard",
    untertitel: "Messwerte verständlich sehen",
    kategorie: "Visualisieren",
    titel: "Aus Daten wird ein Überblick.",
    text:
      "Das React-Dashboard zeigt die Messwerte in Karten, " +
      "Vergleichsansichten und historischen Diagrammen. Dadurch " +
      "lassen sich Carla, Berta und Ilse gemeinsam untersuchen.",
    hinweis:
      "Die neue Historienansicht nutzt ebenfalls die Backend-API. " +
      "Die ältere Grafana-Einbettung ist hier nicht dargestellt.",
    paket: "Im Dashboard angekommen",
    x: 647,
    y: 427,
    icon: dashboardIcon,
  },
];

const verbindungen = [
  {
    ziel: 1,
    pfad: "M247 112H342",
    text: "LoRaWAN",
    x: 294,
    y: 97,
  },
  {
    ziel: 2,
    pfad: "M552 112H647",
    text: "MQTT",
    x: 599,
    y: 97,
  },
  {
    ziel: 3,
    pfad: "M752 168V242",
    text: "Subscribe",
    x: 799,
    y: 209,
  },
  {
    ziel: 4,
    pfad: "M647 297H552",
    text: "Schreiben",
    x: 599,
    y: 281,
  },
  {
    ziel: 5,
    pfad: "M342 297H247",
    text: "Lesen",
    x: 294,
    y: 281,
  },
  {
    ziel: 6,
    pfad: "M447 353V427",
    text: "Lesen",
    x: 482,
    y: 393,
  },
  {
    ziel: 7,
    pfad: "M552 482H647",
    text: "HTTP / JSON",
    x: 599,
    y: 467,
  },
];

function PflanzenGrafik() {
  return (
    <svg viewBox="0 0 200 190" fill="none" aria-hidden="true">
      <ellipse
        cx="105"
        cy="162"
        rx="80"
        ry="18"
        stroke="#587344"
        strokeDasharray="3 5"
      />
      <path d="M105 159V64" stroke="#c3e990" strokeWidth="2" />

      <path
        d="M105 118C61 125 44 96 49 69c38 0 60 17 56 49Z"
        fill="#263f28"
        stroke="#8fb96b"
      />

      <path
        d="M105 88c-3-37 23-58 57-56 3 34-20 61-57 56Z"
        fill="#314d2e"
        stroke="#b5d583"
      />

      <path d="m65 86 40 32m0-30 40-38" stroke="#89b167" />

      <path d="m91 159-16 17m30-17 13 17m-13-26 23 10" stroke="#6a8755" />

      <circle cx="37" cy="42" r="5" fill="#cef58b" />

      <path
        d="M27 29a19 19 0 0 1 27 2M20 20a31 31 0 0 1 43 4"
        stroke="#688451"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DataFlowPage({ onZurueck }: DataFlowPageProps) {
  const [schritt, setSchritt] = useState(0);
  const [laeuft, setLaeuft] = useState(false);
  const [tempo, setTempo] = useState(2800);

  const station = stationen[schritt];
  const aktiveVerbindung = verbindungen.find(
    (verbindung) => verbindung.ziel === schritt,
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    const alterTitel = document.title;
    document.title = "Datenfluss entdecken | LoRaGarden";

    return () => {
      document.title = alterTitel;
    };
  }, []);

  useEffect(() => {
    const sichtbarkeitGeaendert = () => {
      if (document.hidden) {
        setLaeuft(false);
      }
    };

    document.addEventListener("visibilitychange", sichtbarkeitGeaendert);

    return () => {
      document.removeEventListener("visibilitychange", sichtbarkeitGeaendert);
    };
  }, []);

  useEffect(() => {
    if (!laeuft) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (schritt === stationen.length - 1) {
        setLaeuft(false);
      } else {
        setSchritt((bisher) => bisher + 1);
      }
    }, tempo);

    return () => window.clearTimeout(timer);
  }, [laeuft, schritt, tempo]);

  function stationAuswaehlen(index: number) {
    setLaeuft(false);
    setSchritt(index);
  }

  function startenOderPausieren() {
    if (!laeuft && schritt === stationen.length - 1) {
      setSchritt(0);
    }

    setLaeuft((bisher) => !bisher);
  }

  return (
    <div className="datenfluss-seite">
      <div className="datenfluss-container">
        <header className="datenfluss-kopf">
          <a
            href="#/"
            className="landingpage-marke"
            onClick={(event) => {
              event.preventDefault();
              onZurueck();
            }}
          >
            <img src={sproutIcon} alt="" aria-hidden="true" />
            <span>Smart Gardening</span>
          </a>

          <a
            href="#/"
            className="datenfluss-zurueck"
            onClick={(event) => {
              event.preventDefault();
              onZurueck();
            }}
          >
            ← Zurück zur Startseite
          </a>
        </header>

        <main>
          <section className="datenfluss-hero">
            <div>
              <p className="datenfluss-eyebrow">
                <span />
                Hinter den Messwerten
              </p>

              <h1>
                Vom Boden
                <br />
                bis zum <em>Dashboard.</em>
              </h1>

              <p className="datenfluss-einleitung">
                Ein kleiner Messwert legt einen weiten Weg zurück. Folge ihm
                durch unser System und entdecke, wie aus Funksignalen
                verständliche Daten werden.
              </p>
            </div>

            <div className="datenfluss-pflanze">
              <PflanzenGrafik />
            </div>
          </section>

          <div className="datenfluss-layout">
            <section
              className="datenfluss-karte"
              aria-label="Interaktiver Datenfluss"
            >
              <div className="datenfluss-kartenkopf">
                <span>Die Reise eines Messwerts</span>
                <span className="datenfluss-badge">Simulation</span>
              </div>

              <p className="datenfluss-mobilhinweis">
                Die Grafik kannst du seitlich verschieben.
              </p>

              <div
                className="datenfluss-scroll"
                tabIndex={0}
                role="region"
                aria-label="Datenflussgrafik, horizontal scrollbar"
              >
                <svg
                  className="datenfluss-svg"
                  viewBox="0 0 900 580"
                  role="group"
                  aria-labelledby="datenfluss-svg-titel"
                >
                  <title id="datenfluss-svg-titel">
                    Vom Dragino-Sensor über LoRaWAN, MQTT und Telegraf zur
                    InfluxDB. Von dort zu Grafana und über FastAPI zum
                    Dashboard.
                  </title>

                  <defs>
                    <marker
                      id="df-pfeil"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path
                        d="m1 1 7 4-7 4"
                        fill="none"
                        stroke="#87a275"
                        strokeWidth="1.5"
                      />
                    </marker>
                  </defs>

                  {verbindungen.map((verbindung) => (
                    <g key={verbindung.ziel}>
                      <path
                        d={verbindung.pfad}
                        className={[
                          "datenfluss-verbindung",
                          schritt === verbindung.ziel ? "aktiv" : "",
                          schritt > verbindung.ziel ? "besucht" : "",
                        ].join(" ")}
                        markerEnd="url(#df-pfeil)"
                      />

                      <text
                        className="datenfluss-kantenlabel"
                        x={verbindung.x}
                        y={verbindung.y}
                        textAnchor="middle"
                      >
                        {verbindung.text}
                      </text>
                    </g>
                  ))}

                  {stationen.map((eintrag, index) => (
                    <g
                      key={eintrag.name}
                      transform={`translate(${eintrag.x} ${eintrag.y})`}
                      className={[
                        "datenfluss-station",
                        schritt === index ? "aktiv" : "",
                        schritt > index ? "besucht" : "",
                      ].join(" ")}
                      tabIndex={0}
                      role="button"
                      aria-label={`Station ${index + 1}: ${eintrag.name}`}
                      aria-pressed={schritt === index}
                      onClick={() => stationAuswaehlen(index)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          stationAuswaehlen(index);
                        }
                      }}
                    >
                      <rect
                        className="datenfluss-stationsbox"
                        width="210"
                        height="111"
                        rx="13"
                      />

                      <text className="datenfluss-nummer" x="183" y="21">
                        {String(index + 1).padStart(2, "0")}
                      </text>

                      <use
                        href={`${eintrag.icon}#icon`}
                        className="datenfluss-symbol"
                        x="23"
                        y="15"
                      />

                      <text className="datenfluss-stationstitel" x="20" y="72">
                        {eintrag.name}
                      </text>

                      <text
                        className="datenfluss-stationsuntertitel"
                        x="20"
                        y="91"
                      >
                        {eintrag.untertitel}
                      </text>
                    </g>
                  ))}

                  <text x="39" y="461" className="datenfluss-grafiktext">
                    Ein Messwert.
                  </text>
                  <text x="39" y="481" className="datenfluss-grafiktext">
                    Zwei Perspektiven.
                  </text>
                  <text x="39" y="509" className="datenfluss-kantenlabel">
                    Grafana und Dashboard nutzen
                  </text>
                  <text x="39" y="525" className="datenfluss-kantenlabel">
                    dieselbe Datenbasis.
                  </text>

                  {aktiveVerbindung && (
                    <circle
                      key={schritt}
                      r="4"
                      className="datenfluss-paket"
                      aria-hidden="true"
                      style={{
                        offsetPath: `path("${aktiveVerbindung.pfad}")`,
                        animationPlayState: laeuft ? "running" : "paused",
                        animationDuration: `${tempo}ms`,
                      }}
                    />
                  )}
                </svg>
              </div>

              <div className="datenfluss-legende">
                <span>
                  <i />
                  Aktueller Datenweg
                </span>
                <span>Pfeile zeigen die Richtung der Messdaten</span>
              </div>

              <div className="datenfluss-steuerung">
                <button
                  type="button"
                  className="datenfluss-start"
                  onClick={startenOderPausieren}
                >
                  {laeuft ? "Ⅱ Pause" : "▶ Starten"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    stationAuswaehlen((schritt + 1) % stationen.length)
                  }
                >
                  {schritt === stationen.length - 1
                    ? "Zum Anfang ↺"
                    : "Nächster Schritt →"}
                </button>

                <button
                  type="button"
                  aria-label="Animation zurücksetzen"
                  onClick={() => stationAuswaehlen(0)}
                >
                  ↺
                </button>

                <label className="datenfluss-tempo">
                  Tempo
                  <select
                    value={tempo}
                    onChange={(event) => setTempo(Number(event.target.value))}
                  >
                    <option value={4500}>Ruhig</option>
                    <option value={2800}>Normal</option>
                    <option value={1500}>Schnell</option>
                  </select>
                </label>
              </div>
            </section>

            <aside
              className="datenfluss-detail"
              aria-label="Erklärung der ausgewählten Station"
            >
              <div className="datenfluss-detailkopf">
                <span>{String(schritt + 1).padStart(2, "0")} / 08</span>
                <span>{station.kategorie}</span>
              </div>

              <div
                className="datenfluss-erklaerung"
                aria-live={laeuft ? "off" : "polite"}
                aria-atomic="true"
              >
                <h2>{station.titel}</h2>
                <p>{station.text}</p>
              </div>

              <div className="datenfluss-messwert">
                <div className="datenfluss-messwertlabel">{station.paket}</div>

                <div className="datenfluss-wert">
                  32,0 <small>%</small>
                </div>

                <div className="datenfluss-messgroesse">Bodenfeuchtigkeit</div>

                <dl>
                  <div>
                    <dt>Beet / Position</dt>
                    <dd>Carla / oben</dd>
                  </div>
                  <div>
                    <dt>Sensor-ID</dt>
                    <dd>00612B1F</dd>
                  </div>
                  <div>
                    <dt>Messzeit · Beispiel</dt>
                    <dd>28.10.26 · 12:00</dd>
                  </div>
                </dl>
              </div>

              <p className="datenfluss-hinweis">{station.hinweis}</p>

              <div className="datenfluss-fortschritt" aria-hidden="true">
                {stationen.map((eintrag, index) => (
                  <span
                    key={eintrag.name}
                    className={index <= schritt ? "gefuellt" : ""}
                  />
                ))}
              </div>
            </aside>
          </div>

          <section
            className="datenfluss-fakten"
            aria-label="Wissenswertes zum Datenfluss"
          >
            <article>
              <span>01 /</span>
              <div>
                <h3>Funk statt Kabel</h3>
                <p>
                  Die Bodensensoren übertragen ihre Messwerte über LoRaWAN an
                  die vorhandene Infrastruktur.
                </p>
              </div>
            </article>

            <article>
              <span>02 /</span>
              <div>
                <h3>Mit Zeitstempel gespeichert</h3>
                <p>
                  InfluxDB bewahrt die Messreihen auf. So lassen sich aktuelle
                  Zustände und historische Verläufe betrachten.
                </p>
              </div>
            </article>

            <article>
              <span>03 /</span>
              <div>
                <h3>Gezielt abgefragt</h3>
                <p>
                  Grafana liest die Datenbank direkt. Unser Dashboard ruft die
                  Messwerte über das FastAPI-Backend ab.
                </p>
              </div>
            </article>
          </section>
        </main>

        <footer className="datenfluss-fuss">
          <span>
            Station anklicken oder den Messwert Schritt für Schritt begleiten.
          </span>
        </footer>
      </div>
    </div>
  );
}
