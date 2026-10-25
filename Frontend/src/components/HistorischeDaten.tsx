
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  historyCache,
  downsampleMultiSeriesData,
  type ChartDataPoint,
} from "../utils/historyCache";

type HistorischeDatenProps = {
  selectedBeds: string[];
  setSelectedBeds: Dispatch<SetStateAction<string[]>>;
  selectedMeasurements: string[];
  setSelectedMeasurements: Dispatch<SetStateAction<string[]>>;
  zeitraum: string;
  setZeitraum: Dispatch<SetStateAction<string>>;
};

const BED_COLORS: Record<string, string> = {
  Carla: "#2563eb",
  Berta: "#16a34a",
  Ilse: "#ea580c",
};

const BED_NAMES = ["Carla", "Berta", "Ilse"];

const MEASUREMENTS = [
  { key: "temperature", label: "Temperatur" },
  { key: "soil_moisture", label: "Bodenfeuchtigkeit" },
  { key: "conductivity", label: "Leitfähigkeit" },
  // { key: "battery_voltage", label: "Batteriespannung" },
];

const MEASUREMENT_CONFIG: Record<
  string,
  { label: string; unit: string }
> = {
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
  // battery_voltage: {
  //   label: "Batteriespannung",
  //   unit: "V",
  // },
};

const ZEITRAEUME = [
  { value: "24h", label: "Letzte 24 Stunden" },
  { value: "7d", label: "Letzte 7 Tage" },
  { value: "30d", label: "Letzte 30 Tage" },
  { value: "90d", label: "Letzte 90 Tage" },
  { value: "6mo", label: "Letzte 6 Monate" },
];

function getZeitraumMillis(zeitraum: string): number {
  switch (zeitraum) {
    case "24h":
      return 24 * 60 * 60 * 1000;

    case "7d":
      return 7 * 24 * 60 * 60 * 1000;

    case "30d":
      return 30 * 24 * 60 * 60 * 1000;

    case "90d":
      return 90 * 24 * 60 * 60 * 1000;

    case "6mo":
      return 183 * 24 * 60 * 60 * 1000;

    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    name?: string;
    value?: number | string | null;
    color?: string;
  }>;
  label?: string;
  unit: string;
};

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const validEntries = payload.filter(
    (item) =>
      item.value !== null &&
      item.value !== undefined &&
      item.value !== ""
  );

  if (validEntries.length === 0) {
    return null;
  }

  return (
    <div className="historische-tooltip">
      <strong>
        {label ? formatDate(label) : ""}
      </strong>

      {validEntries.map((item) => (
        <div
          key={String(item.dataKey)}
          style={{ color: item.color }}
        >
          {item.name}:{" "}
          {typeof item.value === "number"
            ? item.value.toLocaleString("de-DE")
            : item.value}{" "}
          {unit}
        </div>
      ))}
    </div>
  );
}

type HistoryChartProps = {
  title: string;
  unit: string;
  data: ChartDataPoint[];
  selectedBeds: string[];
};

function HistoryChart({
  title,
  unit,
  data,
  selectedBeds,
}: HistoryChartProps) {
  return (
    <section className="historische-chart">
      <header className="historische-chart-header">
        <h3>{title}</h3>

        <span className="historische-chart-einheit">
          {unit}
        </span>
      </header>

      {data.length === 0 ? (
        <div className="historische-chart-leer">
          Für diese Auswahl wurden keine Messwerte im Zeitraum gefunden.
        </div>
      ) : (
        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 25,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                minTickGap={30}
              />

              <YAxis
                width={60}
                tickFormatter={(value: number) =>
                  value.toLocaleString("de-DE")
                }
              />

              <Tooltip
                content={<CustomTooltip unit={unit} />}
              />

              <Legend />

              {selectedBeds.map((bed) => (
                <Line
                  key={bed}
                  type="linear"
                  dataKey={bed}
                  name={bed}
                  stroke={BED_COLORS[bed] ?? "#64748b"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                  connectNulls={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default function HistorischeDaten({
  selectedBeds,
  setSelectedBeds,
  selectedMeasurements,
  setSelectedMeasurements,
  zeitraum,
  setZeitraum,
}: HistorischeDatenProps) {
  const [cacheVersion, setCacheVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  // Berechnet den Start- und Endzeitpunkt des ausgewählten Zeitraums.
  const { targetStart, targetEnd } = useMemo(() => {
    const end = Date.now();

    return {
      targetStart: end - getZeitraumMillis(zeitraum),
      targetEnd: end,
    };
  }, [zeitraum]);

  // Lädt fehlende historische Daten aus dem Cache beziehungsweise Backend.
  useEffect(() => {
    if (
      selectedBeds.length === 0 ||
      selectedMeasurements.length === 0
    ) {
      setLoading(false);
      setErrorMessage(null);
      return;
    }

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setErrorMessage(null);

    historyCache
      .fetchMissingData(
        selectedBeds,
        selectedMeasurements,
        targetStart,
        targetEnd,
        () => {
          setCacheVersion((version) => version + 1);
        },
        controller.signal,
        (error) => {
          console.error(
            "Historische Daten konnten nicht geladen werden:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unbekannter Fehler beim Laden der Historie."
          );
        }
      )
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    selectedBeds,
    selectedMeasurements,
    targetStart,
    targetEnd,
  ]);

  // Bereitet die Diagrammdaten vor.
  // Wichtig: Beim Downsampling werden die Messpunkte aller ausgewählten
  // Beete berücksichtigt, statt die gemeinsame Zeitreihe pauschal
  // auf eine feste Anzahl von Zeilen zu reduzieren.
  const chartData = useMemo(() => {
    const result: {
      oben: Record<string, ChartDataPoint[]>;
      unten: Record<string, ChartDataPoint[]>;
    } = {
      oben: {},
      unten: {},
    };

    const seriesKeys = selectedBeds.map((bed) => {
      return bed.charAt(0).toUpperCase() + bed.slice(1);
    });

    for (const measurement of selectedMeasurements) {
      const obenData = historyCache.getChartData(
        selectedBeds,
        measurement,
        "oben",
        targetStart,
        targetEnd
      );

      const untenData = historyCache.getChartData(
        selectedBeds,
        measurement,
        "unten",
        targetStart,
        targetEnd
      );

      result.oben[measurement] = downsampleMultiSeriesData(
        obenData,
        seriesKeys,
        350
      );

      result.unten[measurement] = downsampleMultiSeriesData(
        untenData,
        seriesKeys,
        350
      );
    }

    return result;
  }, [
    selectedBeds,
    selectedMeasurements,
    targetStart,
    targetEnd,
    cacheVersion,
  ]);

  // Aktiviert oder deaktiviert ein Beet.
  const toggleBed = (bed: string) => {
    setSelectedBeds((current) =>
      current.includes(bed)
        ? current.filter((item) => item !== bed)
        : [...current, bed]
    );
  };

  // Aktiviert oder deaktiviert einen Messwert.
  const toggleMeasurement = (measurement: string) => {
    setSelectedMeasurements((current) =>
      current.includes(measurement)
        ? current.filter((item) => item !== measurement)
        : [...current, measurement]
    );
  };

  return (
    <section className="historische-date">
      <div className="historische-übersichtNeu">
        <p>
          Vergleiche historische Messwerte mehrerer Beete und
          Messgrößen aus der InfluxDB.
        </p>
      </div>

      {/* Filter für Beete, Messwerte und Zeitraum */}
      <section className="historische-filter">
        <div className="historische-filter-gruppe">
          <h2>Beete</h2>

          <div className="historische-checkboxen">
            {BED_NAMES.map((bed) => (
              <label
                key={bed}
                className="historische-checkbox"
              >
                <input
                  type="checkbox"
                  checked={selectedBeds.includes(bed)}
                  onChange={() => toggleBed(bed)}
                />

                <span
                  className="historische-checkbox-farbe"
                  style={{
                    backgroundColor: BED_COLORS[bed],
                  }}
                />

                <span>{bed}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="historische-filter-gruppe">
          <h2>Messwerte</h2>

          <div className="historische-checkboxen">
            {MEASUREMENTS.map((measurement) => (
              <label
                key={measurement.key}
                className="historische-checkbox"
              >
                <input
                  type="checkbox"
                  checked={selectedMeasurements.includes(
                    measurement.key
                  )}
                  onChange={() =>
                    toggleMeasurement(measurement.key)
                  }
                />

                <span>{measurement.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="historische-filter-gruppe">
          <h2>Zeitraum</h2>

          <select
            className="historische-auswahl"
            value={zeitraum}
            onChange={(
              event: ChangeEvent<HTMLSelectElement>
            ) => setZeitraum(event.target.value)}
          >
            {ZEITRAEUME.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Lade- und Fehlermeldungen */}
      {loading && (
        <p role="status">
          Historische Daten werden geladen …
        </p>
      )}

      {errorMessage && (
        <p
          className="historische-fehler"
          role="alert"
        >
          Fehler beim Laden: {errorMessage}
        </p>
      )}

      {/* Diagramme oder Hinweis bei fehlender Auswahl */}
      {selectedBeds.length === 0 ||
      selectedMeasurements.length === 0 ? (
        <div className="historische-leerzustand">
          <h2>Keine Auswahl</h2>

          <p>
            Bitte wähle mindestens ein Beet und einen Messwert aus.
          </p>
        </div>
      ) : (
        <>
          {(["oben", "unten"] as const).map((position) => (
            <section
              className="historische-bereich"
              key={position}
            >
              <div className="historische-bereich-header">
                <h2>
                  {position === "oben" ? "Oben" : "Unten"}
                </h2>
              </div>

              <div className="historische-charts">
                {selectedMeasurements.map((measurement) => {
                  const config =
                    MEASUREMENT_CONFIG[measurement];

                  if (!config) {
                    return null;
                  }

                  return (
                    <HistoryChart
                      key={`${position}-${measurement}`}
                      title={config.label}
                      unit={config.unit}
                      data={
                        chartData[position][measurement] ?? []
                      }
                      selectedBeds={selectedBeds}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </>
      )}
    </section>
  );
}
