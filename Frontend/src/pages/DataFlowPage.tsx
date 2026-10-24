import { useEffect, useState } from "react";
import "./DataFlowPage.css";
import sproutIcon from "../assets/sprout.svg";
import "./LandingPage.css";

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
    icon: "sensor",
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
    icon: "funk",
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
    icon: "broker",
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
    icon: "filter",
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
    icon: "datenbank",
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
    icon: "diagramm",
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
    icon: "api",
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
    icon: "bildschirm",
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

  // Bei einem ausgeblendeten Browser-Tab pausieren.
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

  // Jeder Schritt bleibt entsprechend dem gewählten Tempo sichtbar.
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

                    <g id="df-icon-sensor">
                      <path d="M0 0h18v24H0zM5 24v9M13 24v9M5 7h8M5 12h8" />
                      <path d="M23 2q8 6 0 12m5-16q13 10 0 20" />
                    </g>

                    <g id="df-icon-funk">
                      <path d="M8 12v23m-8 0h16M1 35l7-17 7 17M-1 5q-9 9 0 18m18-18q9 9 0 18M3 9q-5 5 0 10m10-10q5 5 0 10" />
                      <circle cx="8" cy="14" r="2" />
                    </g>

                    <g id="df-icon-broker">
                      <rect x="3" y="7" width="21" height="18" rx="3" />
                      <path d="M-4 16h7m21 0h8M13 0v7m0 18v7M9 13h9m-9 6h9" />
                    </g>

                    <g id="df-icon-filter">
                      <path d="M-2 1h31L17 17v13l-7-4v-9Z" />
                    </g>

                    <g id="df-icon-datenbank">
                      <ellipse cx="13" cy="5" rx="15" ry="5" />
                      <path d="M-2 5v22c0 7 30 7 30 0V5M-2 16c0 7 30 7 30 0" />
                    </g>

                    <g id="df-icon-diagramm">
                      <path d="M-2 0v29h32M3 22l8-9 7 4 11-15" />
                    </g>

                    <g id="df-icon-api">
                      <path d="m7 4-11 10L7 24m13-20 11 10-11 10M17 0l-7 28" />
                    </g>

                    <g id="df-icon-bildschirm">
                      <rect x="-3" y="0" width="34" height="25" rx="3" />
                      <path d="M14 25v7m-9 0h18M3 18V9m7 9V5m7 13v-7m7 7V7" />
                    </g>
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
                        href={`#df-icon-${eintrag.icon}`}
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
                    <dd>24.10.26 · 12:00</dd>
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
