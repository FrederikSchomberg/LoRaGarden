export function downsampleData(
  data: ChartDataPoint[],
  maxPoints: number = 350,
): ChartDataPoint[] {
  if (data.length <= maxPoints || maxPoints <= 2) {
    return data;
  }

  const result: ChartDataPoint[] = [];
  result.push(data[0]);

  const bucketSize = (data.length - 2) / (maxPoints - 2);

  for (let i = 0; i < maxPoints - 2; i++) {
    const bucketStart = Math.floor(1 + i * bucketSize);
    const bucketEnd = Math.floor(1 + (i + 1) * bucketSize);
    const midIndex = Math.floor((bucketStart + bucketEnd) / 2);

    if (midIndex < data.length - 1) {
      result.push(data[midIndex]);
    }
  }

  result.push(data[data.length - 1]);
  return result;
}

import type { DashboardHistoryResponse } from "../types/dashboard";
import { holeHistorieChunkFiltered } from "../api";

export type TimeRange = {
  start: number; // epoch ms
  end: number;   // epoch ms
};

export type ChartDataPoint = {
  timestamp: string;
  [key: string]: string | number | null | undefined;
};

// Mapping von Frontend-Messwertschlüsseln zu API-Feldnamen
export const MEASUREMENT_TO_API_FIELD: Record<string, string> = {
  temperature: "soil_temperature",
  soil_moisture: "soil_moisture",
  conductivity: "soil_ec",
};

export const API_FIELD_TO_MEASUREMENT: Record<string, string> = {
  soil_temperature: "temperature",
  soil_moisture: "soil_moisture",
  soil_ec: "conductivity",
};

const CHUNK_SIZE_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage in ms
const TOLERANCE_MS = 60 * 1000; // 1 Minute Toleranz bei Intervallen


// liefert den fehlenden teil des abgefragten intervalls
export function subtractIntervals(
  requested: TimeRange,
  covered: TimeRange[],
): TimeRange[] {
  let missing: TimeRange[] = [requested];

  for (const c of covered) {
    const nextMissing: TimeRange[] = [];
    for (const m of missing) {
      // Keine Überlappung
      if (c.end <= m.start || c.start >= m.end) {
        nextMissing.push(m);
      } else {
        // Teil vor dem abgedeckten Intervall
        if (m.start < c.start - TOLERANCE_MS) {
          nextMissing.push({ start: m.start, end: c.start });
        }
        // Teil nach dem abgedeckten Intervall
        if (m.end > c.end + TOLERANCE_MS) {
          nextMissing.push({ start: c.end, end: m.end });
        }
      }
    }
    missing = nextMissing;
  }

  // Filtert winzige Intervalle (< 1 Minute) heraus
  return missing.filter((m) => m.end - m.start > TOLERANCE_MS);
}

// Fügt ein neues Intervall in eine Liste von Intervallen ein
export function mergeInterval(
  existing: TimeRange[],
  newRange: TimeRange,
): TimeRange[] {
  const merged: TimeRange[] = [];
  let current = { ...newRange };
  let inserted = false;

  for (const range of existing) {
    if (current.end + TOLERANCE_MS < range.start) {
      if (!inserted) {
        merged.push(current);
        inserted = true;
      }
      merged.push(range);
    } else if (current.start > range.end + TOLERANCE_MS) {
      merged.push(range);
    } else {
      // Überlappend oder berührend -> vereinigen
      current = {
        start: Math.min(current.start, range.start),
        end: Math.max(current.end, range.end),
      };
    }
  }

  if (!inserted) {
    merged.push(current);
  }

  return merged.sort((a, b) => a.start - b.start);
}

// Zentraler In-Memory Cache für historische Sensordaten
class HistoryCache {
  // points: bed (lower) -> measurementKey -> position ("oben"|"unten") -> Map<timestamp, value>
  private points: Record<
    string,
    Record<string, Record<string, Map<string, number>>>
  > = {};

  // covered: bed (lower) -> measurementKey -> TimeRange[]
  private covered: Record<string, Record<string, TimeRange[]>> = {};

  // Trackt laufende Anfragen, um doppelte parallele Calls zu verhindern
  private inFlightKeys = new Set<string>();

  private getBedStore(bed: string, measurement: string) {
    const b = bed.toLowerCase();
    const m = measurement.toLowerCase();

    if (!this.points[b]) this.points[b] = {};
    if (!this.points[b][m]) {
      this.points[b][m] = {
        oben: new Map(),
        unten: new Map(),
      };
    }

    if (!this.covered[b]) this.covered[b] = {};
    if (!this.covered[b][m]) this.covered[b][m] = [];

    return {
      points: this.points[b][m],
      covered: this.covered[b][m],
    };
  }

  public getCoveredRanges(bed: string, measurement: string): TimeRange[] {
    const b = bed.toLowerCase();
    const m = measurement.toLowerCase();
    return this.covered[b]?.[m] ?? [];
  }

  public addPoint(
    bed: string,
    measurement: string,
    position: string,
    timestamp: string,
    value: number,
  ) {
    const store = this.getBedStore(bed, measurement);
    const pos = position.toLowerCase();
    if (pos === "oben" || pos === "unten") {
      store.points[pos].set(timestamp, value);
    }
  }

  public markCovered(
    bed: string,
    measurement: string,
    startMs: number,
    endMs: number,
  ) {
    const b = bed.toLowerCase();
    const m = measurement.toLowerCase();
    const current = this.getCoveredRanges(b, m);
    this.covered[b][m] = mergeInterval(current, { start: startMs, end: endMs });
  }

  public getChartData(
    beds: string[],
    measurement: string,
    position: "oben" | "unten",
    startMs: number,
    endMs: number,
  ): ChartDataPoint[] {
    const m = measurement.toLowerCase();
    const timeMap = new Map<string, ChartDataPoint>();

    for (const bed of beds) {
      const b = bed.toLowerCase();
      const posMap = this.points[b]?.[m]?.[position];
      if (!posMap) continue;

      for (const [timestamp, value] of posMap.entries()) {
        const time = new Date(timestamp).getTime();
        if (time >= startMs && time <= endMs) {
          if (!timeMap.has(timestamp)) {
            timeMap.set(timestamp, { timestamp });
          }
          // Bed-Name mit Großbuchstaben für den Chart anzeigen
          const bedLabel = bed.charAt(0).toUpperCase() + bed.slice(1);
          timeMap.get(timestamp)![bedLabel] = value;
        }
      }
    }

    return Array.from(timeMap.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }

  public hasAnyData(
    beds: string[],
    measurement: string,
    position: "oben" | "unten",
    startMs: number,
    endMs: number,
  ): boolean {
    const m = measurement.toLowerCase();
    for (const bed of beds) {
      const b = bed.toLowerCase();
      const posMap = this.points[b]?.[m]?.[position];
      if (!posMap) continue;
      for (const [timestamp] of posMap.entries()) {
        const time = new Date(timestamp).getTime();
        if (time >= startMs && time <= endMs) {
          return true;
        }
      }
    }
    return false;
  }

  // Berechnet welche Daten noch fehlen und lädt die fehlenden Chunks
  public async fetchMissingData(
    beds: string[],
    measurements: string[],
    startMs: number,
    endMs: number,
    onDataUpdated: () => void,
    signal?: AbortSignal,
  ): Promise<void> {
    if (beds.length === 0 || measurements.length === 0) return;

    // 1. Sammle für jedes (bed, measurement) die fehlenden Zeitintervalle
    type MissingItem = {
      bed: string;
      measurement: string;
      start: number;
      end: number;
    };

    const missingItems: MissingItem[] = [];

    for (const bed of beds) {
      for (const measurement of measurements) {
        const covered = this.getCoveredRanges(bed, measurement);
        const gaps = subtractIntervals({ start: startMs, end: endMs }, covered);

        for (const gap of gaps) {
          // Ggf. in 30-Tage-Blöcke teilen, um das Backend nicht zu überlasten
          let cursor = gap.start;
          while (cursor < gap.end) {
            const chunkEnd = Math.min(cursor + CHUNK_SIZE_MS, gap.end);
            const inFlightKey = `${bed.toLowerCase()}:${measurement.toLowerCase()}:${cursor}:${chunkEnd}`;

            if (!this.inFlightKeys.has(inFlightKey)) {
              this.inFlightKeys.add(inFlightKey);
              missingItems.push({
                bed: bed.toLowerCase(),
                measurement: measurement.toLowerCase(),
                start: cursor,
                end: chunkEnd,
              });
            }

            cursor = chunkEnd;
          }
        }
      }
    }

    if (missingItems.length === 0) {
      // Alles bereits im Frontend vorhanden!
      return;
    }

    // 2. Gruppiere Anfragen mit identischen Zeitfenstern, um HTTP-Calls zu bündeln
    // timeKey -> { start, end, beds: Set, measurements: Set }
    const timeGroups = new Map<
      string,
      {
        start: number;
        end: number;
        beds: Set<string>;
        measurements: Set<string>;
      }
    >();

    for (const item of missingItems) {
      const key = `${item.start}_${item.end}`;
      if (!timeGroups.has(key)) {
        timeGroups.set(key, {
          start: item.start,
          end: item.end,
          beds: new Set(),
          measurements: new Set(),
        });
      }
      const group = timeGroups.get(key)!;
      group.beds.add(item.bed);
      group.measurements.add(item.measurement);
    }

    // 3. Führe alle Chunks parallel aus, um die Ladezeit drastisch zu verkürzen
    const tasks = Array.from(timeGroups.values()).map(async (group) => {
      if (signal?.aborted) return;

      const bedsList = Array.from(group.beds);
      const fieldsList = Array.from(group.measurements)
        .map((m) => MEASUREMENT_TO_API_FIELD[m] || m)
        .filter(Boolean);

      const startIso = new Date(group.start).toISOString();
      const endIso = new Date(group.end).toISOString();

      try {
        const response: DashboardHistoryResponse =
          await holeHistorieChunkFiltered(
            startIso,
            endIso,
            bedsList,
            fieldsList,
            signal,
          );

        if (signal?.aborted) return;

        // Empfangene Punkte in den Cache einspeisen
        for (const bed of response.beds) {
          const bedName = bed.name.toLowerCase();
          for (const sensor of bed.sensors) {
            const pos = sensor.bed_position.toLowerCase();
            for (const pt of sensor.history) {
              for (const [apiField, val] of Object.entries(pt.values)) {
                if (val !== null && val !== undefined) {
                  const mKey = API_FIELD_TO_MEASUREMENT[apiField];
                  if (mKey) {
                    this.addPoint(
                      bedName,
                      mKey,
                      pos,
                      pt.timestamp,
                      val as number,
                    );
                  }
                }
              }
            }
          }
        }

        // Als abgedeckt markieren
        for (const bed of group.beds) {
          for (const m of group.measurements) {
            this.markCovered(bed, m, group.start, group.end);
          }
        }
      } catch (err) {
        if (!signal?.aborted) {
          console.error("Fehler beim Abfragen des Datenchunks:", err);
        }
      } finally {
        for (const b of group.beds) {
          for (const m of group.measurements) {
            this.inFlightKeys.delete(`${b}:${m}:${group.start}:${group.end}`);
          }
        }
      }
    });

    await Promise.all(tasks);

    // Einmaliges Re-Render-Update, wenn alle parallelen Anfragen fertig sind
    if (!signal?.aborted) {
      onDataUpdated();
    }
  }

  public clear() {
    this.points = {};
    this.covered = {};
    this.inFlightKeys.clear();
  }
}

// Globaler Singleton für die Frontend-Sitzung
export const historyCache = new HistoryCache();
