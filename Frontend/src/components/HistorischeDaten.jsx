import { useMemo, useState } from "react";

/*
 * ---------------------------------------------------------
 * MOCKDATEN
 * ---------------------------------------------------------
 *
 * Die Daten sind absichtlich so aufgebaut, dass sie später
 * leicht durch die Antwort von /api/history ersetzt werden
 * können.
 */

const MOCK_DATA = {
  Carla: {
    temperature: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 21.4 },
        { timestamp: "2026-09-25T12:00:00", value: 23.1 },
        { timestamp: "2026-09-25T16:00:00", value: 24.3 },
        { timestamp: "2026-09-26T08:00:00", value: 20.8 },
        { timestamp: "2026-09-26T12:00:00", value: 22.7 },
        { timestamp: "2026-09-26T16:00:00", value: 25.1 },
        { timestamp: "2026-09-27T08:00:00", value: 21.2 },
        { timestamp: "2026-09-27T12:00:00", value: 24.0 },
        { timestamp: "2026-09-27T16:00:00", value: 26.2 },
        { timestamp: "2026-09-28T08:00:00", value: 21.7 },
        { timestamp: "2026-09-28T12:00:00", value: 23.8 },
        { timestamp: "2026-09-28T16:00:00", value: 25.7 },
        { timestamp: "2026-09-29T08:00:00", value: 20.9 },
        { timestamp: "2026-09-29T12:00:00", value: 23.4 },
        { timestamp: "2026-09-29T16:00:00", value: 24.9 },
        { timestamp: "2026-09-30T08:00:00", value: 21.5 },
        { timestamp: "2026-09-30T12:00:00", value: 24.2 },
        { timestamp: "2026-09-30T16:00:00", value: 26.0 },
      ],

      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 19.8 },
        { timestamp: "2026-09-25T12:00:00", value: 21.2 },
        { timestamp: "2026-09-25T16:00:00", value: 22.4 },
        { timestamp: "2026-09-26T08:00:00", value: 19.3 },
        { timestamp: "2026-09-26T12:00:00", value: 21.0 },
        { timestamp: "2026-09-26T16:00:00", value: 23.0 },
        { timestamp: "2026-09-27T08:00:00", value: 19.6 },
        { timestamp: "2026-09-27T12:00:00", value: 21.9 },
        { timestamp: "2026-09-27T16:00:00", value: 23.8 },
        { timestamp: "2026-09-28T08:00:00", value: 20.0 },
        { timestamp: "2026-09-28T12:00:00", value: 21.7 },
        { timestamp: "2026-09-28T16:00:00", value: 23.4 },
        { timestamp: "2026-09-29T08:00:00", value: 19.5 },
        { timestamp: "2026-09-29T12:00:00", value: 21.5 },
        { timestamp: "2026-09-29T16:00:00", value: 22.9 },
        { timestamp: "2026-09-30T08:00:00", value: 20.1 },
        { timestamp: "2026-09-30T12:00:00", value: 22.0 },
        { timestamp: "2026-09-30T16:00:00", value: 24.1 },
      ],
    },

    soil_moisture: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 42 },
        { timestamp: "2026-09-25T12:00:00", value: 40 },
        { timestamp: "2026-09-25T16:00:00", value: 38 },
        { timestamp: "2026-09-26T08:00:00", value: 43 },
        { timestamp: "2026-09-26T12:00:00", value: 41 },
        { timestamp: "2026-09-26T16:00:00", value: 39 },
        { timestamp: "2026-09-27T08:00:00", value: 44 },
        { timestamp: "2026-09-27T12:00:00", value: 42 },
        { timestamp: "2026-09-27T16:00:00", value: 40 },
        { timestamp: "2026-09-28T08:00:00", value: 45 },
        { timestamp: "2026-09-28T12:00:00", value: 43 },
        { timestamp: "2026-09-28T16:00:00", value: 41 },
        { timestamp: "2026-09-29T08:00:00", value: 46 },
        { timestamp: "2026-09-29T12:00:00", value: 44 },
        { timestamp: "2026-09-29T16:00:00", value: 42 },
        { timestamp: "2026-09-30T08:00:00", value: 45 },
        { timestamp: "2026-09-30T12:00:00", value: 43 },
        { timestamp: "2026-09-30T16:00:00", value: 41 },
      ],

      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 48 },
        { timestamp: "2026-09-25T12:00:00", value: 46 },
        { timestamp: "2026-09-25T16:00:00", value: 44 },
        { timestamp: "2026-09-26T08:00:00", value: 49 },
        { timestamp: "2026-09-26T12:00:00", value: 47 },
        { timestamp: "2026-09-26T16:00:00", value: 45 },
        { timestamp: "2026-09-27T08:00:00", value: 50 },
        { timestamp: "2026-09-27T12:00:00", value: 48 },
        { timestamp: "2026-09-27T16:00:00", value: 46 },
        { timestamp: "2026-09-28T08:00:00", value: 51 },
        { timestamp: "2026-09-28T12:00:00", value: 49 },
        { timestamp: "2026-09-28T16:00:00", value: 47 },
        { timestamp: "2026-09-29T08:00:00", value: 52 },
        { timestamp: "2026-09-29T12:00:00", value: 50 },
        { timestamp: "2026-09-29T16:00:00", value: 48 },
        { timestamp: "2026-09-30T08:00:00", value: 51 },
        { timestamp: "2026-09-30T12:00:00", value: 49 },
        { timestamp: "2026-09-30T16:00:00", value: 47 },
      ],
    },

    conductivity: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 1.2 },
        { timestamp: "2026-09-25T12:00:00", value: 1.3 },
        { timestamp: "2026-09-25T16:00:00", value: 1.4 },
        { timestamp: "2026-09-26T08:00:00", value: 1.2 },
        { timestamp: "2026-09-26T12:00:00", value: 1.5 },
        { timestamp: "2026-09-26T16:00:00", value: 1.6 },
        { timestamp: "2026-09-27T08:00:00", value: 1.3 },
        { timestamp: "2026-09-27T12:00:00", value: 1.6 },
        { timestamp: "2026-09-27T16:00:00", value: 1.7 },
        { timestamp: "2026-09-28T08:00:00", value: 1.4 },
        { timestamp: "2026-09-28T12:00:00", value: 1.7 },
        { timestamp: "2026-09-28T16:00:00", value: 1.8 },
        { timestamp: "2026-09-29T08:00:00", value: 1.5 },
        { timestamp: "2026-09-29T12:00:00", value: 1.8 },
        { timestamp: "2026-09-29T16:00:00", value: 1.9 },
        { timestamp: "2026-09-30T08:00:00", value: 1.6 },
        { timestamp: "2026-09-30T12:00:00", value: 1.9 },
        { timestamp: "2026-09-30T16:00:00", value: 2.0 },
      ],

      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 1.0 },
        { timestamp: "2026-09-25T12:00:00", value: 1.1 },
        { timestamp: "2026-09-25T16:00:00", value: 1.2 },
        { timestamp: "2026-09-26T08:00:00", value: 1.0 },
        { timestamp: "2026-09-26T12:00:00", value: 1.2 },
        { timestamp: "2026-09-26T16:00:00", value: 1.3 },
        { timestamp: "2026-09-27T08:00:00", value: 1.1 },
        { timestamp: "2026-09-27T12:00:00", value: 1.3 },
        { timestamp: "2026-09-27T16:00:00", value: 1.4 },
        { timestamp: "2026-09-28T08:00:00", value: 1.2 },
        { timestamp: "2026-09-28T12:00:00", value: 1.4 },
        { timestamp: "2026-09-28T16:00:00", value: 1.5 },
        { timestamp: "2026-09-29T08:00:00", value: 1.3 },
        { timestamp: "2026-09-29T12:00:00", value: 1.5 },
        { timestamp: "2026-09-29T16:00:00", value: 1.6 },
        { timestamp: "2026-09-30T08:00:00", value: 1.4 },
        { timestamp: "2026-09-30T12:00:00", value: 1.6 },
        { timestamp: "2026-09-30T16:00:00", value: 1.7 },
      ],
    },
  },
};


/*
 * ---------------------------------------------------------
 * EINHEITEN
 * ---------------------------------------------------------
 */

const measurementConfig = {
  temperature: {
    label: "Temperatur",
    unit: "°C",
  },

  soil_moisture: {
    label: "Bodenfeuchtigkeit",
    unit: "%",
  },

  conductivity: {
    label: "Leitfähigkeit",
    unit: "mS/cm",
  },
};


/*
 * ---------------------------------------------------------
 * DIAGRAMM
 * ---------------------------------------------------------
 */

function HistoryChart({ title, data, unit }) {
  if (!data || data.length === 0) {
    return (
      <div className="history-chart-card">
        <h3>{title}</h3>
        <p>Keine Daten vorhanden.</p>
      </div>
    );
  }

  const width = 900;
  const height = 320;

  const paddingLeft = 60;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 45;

  const values = data.map((point) => point.value);

  let minValue = Math.min(...values);
  let maxValue = Math.max(...values);

  // Etwas Abstand oberhalb und unterhalb der Daten
  const difference = maxValue - minValue || 1;

  minValue -= difference * 0.15;
  maxValue += difference * 0.15;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index) => {
    if (data.length === 1) {
      return paddingLeft + chartWidth / 2;
    }

    return (
      paddingLeft +
      (index / (data.length - 1)) * chartWidth
    );
  };

  const getY = (value) => {
    return (
      paddingTop +
      ((maxValue - value) / (maxValue - minValue)) *
        chartHeight
    );
  };

  const points = data
    .map(
      (point, index) =>
        `${getX(index)},${getY(point.value)}`
    )
    .join(" ");

  return (
    <div className="history-chart-card">
      <div className="history-chart-header">
        <h3>{title}</h3>

        <span>
          {data[data.length - 1].value.toFixed(1)} {unit}
        </span>
      </div>

      <div className="history-chart-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="history-chart"
          preserveAspectRatio="none"
        >
          {/* Horizontale Hilfslinien */}
          {[0, 1, 2, 3, 4].map((line) => {
            const y =
              paddingTop +
              (line / 4) * chartHeight;

            return (
              <line
                key={line}
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={y}
                y2={y}
                className="chart-grid-line"
              />
            );
          })}

          {/* Y-Achse */}
          <line
            x1={paddingLeft}
            x2={paddingLeft}
            y1={paddingTop}
            y2={height - paddingBottom}
            className="chart-axis"
          />

          {/* X-Achse */}
          <line
            x1={paddingLeft}
            x2={width - paddingRight}
            y1={height - paddingBottom}
            y2={height - paddingBottom}
            className="chart-axis"
          />

          {/* Datenlinie */}
          <polyline
            points={points}
            className="chart-line"
            fill="none"
          />

          {/* Datenpunkte */}
          {data.map((point, index) => (
            <circle
              key={`${point.timestamp}-${index}`}
              cx={getX(index)}
              cy={getY(point.value)}
              r="4"
              className="chart-point"
            />
          ))}

          {/* Startdatum */}
          <text
            x={paddingLeft}
            y={height - 15}
            className="chart-label"
          >
            {formatDate(data[0].timestamp)}
          </text>

          {/* Enddatum */}
          <text
            x={width - paddingRight}
            y={height - 15}
            textAnchor="end"
            className="chart-label"
          >
            {formatDate(data[data.length - 1].timestamp)}
          </text>
        </svg>
      </div>
    </div>
  );
}


/*
 * ---------------------------------------------------------
 * DATUM FORMATIEREN
 * ---------------------------------------------------------
 */

function formatDate(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
}


/*
 * ---------------------------------------------------------
 * HAUPTKOMPONENTE
 * ---------------------------------------------------------
 */

export default function HistorischeDaten() {
  const [beet, setBeet] = useState("Carla");
  const [messwert, setMesswert] = useState("temperature");
  const [zeitraum, setZeitraum] = useState("7d");

  /*
   * Hier holen wir aktuell noch die Mockdaten.
   *
   * Später wird genau diese Stelle durch fetch()
   * auf /api/history ersetzt.
   */

  const history = useMemo(() => {
    return MOCK_DATA[beet]?.[messwert] ?? {
      oben: [],
      unten: [],
    };
  }, [beet, messwert]);

  const config = measurementConfig[messwert];

  return (
    <section className="historische-daten">

      {/* ------------------------------------------------ */}
      {/* AUSWAHL                                         */}
      {/* ------------------------------------------------ */}

      <div className="historische-kontrollen">

        <div className="historische-auswahl">
          <label htmlFor="history-beet">
            Beet
          </label>

          <select
            id="history-beet"
            value={beet}
            onChange={(event) =>
              setBeet(event.target.value)
            }
          >
            <option value="Carla">
              Carla 10 % Pflanzenkohle
            </option>

            <option value="Berta">
              Berta 5 % Pflanzenkohle
            </option>

            <option value="Ilse">
              Ilse Sand
            </option>
          </select>
        </div>


        <div className="historische-auswahl">
          <label htmlFor="history-messwert">
            Messwert
          </label>

          <select
            id="history-messwert"
            value={messwert}
            onChange={(event) =>
              setMesswert(event.target.value)
            }
          >
            <option value="temperature">
              Temperatur
            </option>

            <option value="soil_moisture">
              Bodenfeuchtigkeit
            </option>

            <option value="conductivity">
              Leitfähigkeit
            </option>
          </select>
        </div>


        <div className="historische-auswahl">
          <label htmlFor="history-zeitraum">
            Zeitraum
          </label>

          <select
            id="history-zeitraum"
            value={zeitraum}
            onChange={(event) =>
              setZeitraum(event.target.value)
            }
          >
            <option value="24h">
              Letzte 24 Stunden
            </option>

            <option value="7d">
              Letzte 7 Tage
            </option>

            <option value="30d">
              Letzte 30 Tage
            </option>

            <option value="90d">
              Letzte 3 Monate
            </option>
          </select>
        </div>

      </div>


      {/* ------------------------------------------------ */}
      {/* ÜBERSCHRIFT                                    */}
      {/* ------------------------------------------------ */}

      <div className="historische-übersicht">
        <h2>
          {config.label} – {beet}
        </h2>

        <p>
          Historischer Verlauf · {zeitraum}
        </p>
      </div>


      {/* ------------------------------------------------ */}
      {/* DIAGRAMME                                      */}
      {/* ------------------------------------------------ */}

      <div className="history-charts">

        <HistoryChart
          title={`${config.label} – Oben`}
          data={history.oben}
          unit={config.unit}
        />

        <HistoryChart
          title={`${config.label} – Unten`}
          data={history.unten}
          unit={config.unit}
        />

      </div>

    </section>
  );
}