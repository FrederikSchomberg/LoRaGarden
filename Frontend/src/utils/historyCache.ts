import { holeHistorieChunkFiltered } from "../api";

export type TimeRange = { start: number; end: number };

export type ChartDataPoint = {
  timestamp: string;
  [key: string]: string | number | null | undefined;
};

export const MEASUREMENT_TO_API_FIELD: Record<string, string> = {
  temperature: "soil_temperature",
  soil_moisture: "soil_moisture",
  conductivity: "soil_ec",
  battery_voltage: "battery_voltage",
};

export const API_FIELD_TO_MEASUREMENT: Record<string, string> = {
  soil_temperature: "temperature",
  soil_moisture: "soil_moisture",
  soil_ec: "conductivity",
  battery_voltage: "battery_voltage",
};

const CHUNK_SIZE_MS = 30 * 24 * 60 * 60 * 1000;
const TOLERANCE_MS = 60 * 1000;

type MissingItem = { bed: string; measurement: string; start: number; end: number };
type RequestGroup = {
  start: number;
  end: number;
  beds: Set<string>;
  measurements: Set<string>;
  items: MissingItem[];
};

export function subtractIntervals(requested: TimeRange, covered: TimeRange[]): TimeRange[] {
  let missing: TimeRange[] = [requested];
  for (const c of covered) {
    const next: TimeRange[] = [];
    for (const m of missing) {
      if (c.end <= m.start || c.start >= m.end) {
        next.push(m);
      } else {
        if (m.start < c.start - TOLERANCE_MS) next.push({ start: m.start, end: c.start });
        if (m.end > c.end + TOLERANCE_MS) next.push({ start: c.end, end: m.end });
      }
    }
    missing = next;
  }
  return missing.filter((range) => range.end - range.start > TOLERANCE_MS);
}

export function mergeInterval(existing: TimeRange[], newRange: TimeRange): TimeRange[] {
  const sorted = [...existing, newRange].sort((a, b) => a.start - b.start);
  const merged: TimeRange[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end + TOLERANCE_MS) {
      merged.push({ ...range });
    } else {
      last.end = Math.max(last.end, range.end);
    }
  }
  return merged;
}

class HistoryCache {
  private points: Record<string, Record<string, Record<"oben" | "unten", Map<string, number>>>> = {};
  private covered: Record<string, Record<string, TimeRange[]>> = {};
  private inFlightKeys = new Set<string>();

  private getBedStore(bed: string, measurement: string) {
    const b = bed.toLowerCase();
    const m = measurement.toLowerCase();
    this.points[b] ??= {};
    this.points[b][m] ??= { oben: new Map(), unten: new Map() };
    this.covered[b] ??= {};
    this.covered[b][m] ??= [];
    return { points: this.points[b][m], covered: this.covered[b][m] };
  }

  public getCoveredRanges(bed: string, measurement: string): TimeRange[] {
    return this.covered[bed.toLowerCase()]?.[measurement.toLowerCase()] ?? [];
  }

  public addPoint(bed: string, measurement: string, position: string, timestamp: string, value: number) {
    const store = this.getBedStore(bed, measurement);
    const pos = position.toLowerCase();
    if ((pos === "oben" || pos === "unten") && Number.isFinite(value)) {
      store.points[pos].set(timestamp, value);
    }
  }

  public markCovered(bed: string, measurement: string, start: number, end: number) {
    const store = this.getBedStore(bed, measurement);
    this.covered[bed.toLowerCase()][measurement.toLowerCase()] = mergeInterval(
      store.covered,
      { start, end },
    );
  }

  public getChartData(beds: string[], measurement: string, position: "oben" | "unten", startMs: number, endMs: number): ChartDataPoint[] {
    const timeMap = new Map<string, ChartDataPoint>();
    for (const bed of beds) {
      const values = this.points[bed.toLowerCase()]?.[measurement.toLowerCase()]?.[position];
      if (!values) continue;
      for (const [timestamp, value] of values) {
        const time = new Date(timestamp).getTime();
        if (time < startMs || time > endMs) continue;
        if (!timeMap.has(timestamp)) timeMap.set(timestamp, { timestamp });
        timeMap.get(timestamp)![bed] = value;
      }
    }
    return [...timeMap.values()].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public hasAnyData(beds: string[], measurement: string, position: "oben" | "unten", startMs: number, endMs: number): boolean {
    return beds.some((bed) => {
      const values = this.points[bed.toLowerCase()]?.[measurement.toLowerCase()]?.[position];
      if (!values) return false;
      for (const timestamp of values.keys()) {
        const time = new Date(timestamp).getTime();
        if (time >= startMs && time <= endMs) return true;
      }
      return false;
    });
  }

  public async fetchMissingData(
    beds: string[],
    measurements: string[],
    startMs: number,
    endMs: number,
    onDataUpdated: () => void,
    signal?: AbortSignal,
    onError?: (error: unknown) => void,
  ): Promise<void> {
    if (!beds.length || !measurements.length || endMs <= startMs) return;

    const missingItems: MissingItem[] = [];
    for (const bed of beds) {
      for (const measurement of measurements) {
        const gaps = subtractIntervals({ start: startMs, end: endMs }, this.getCoveredRanges(bed, measurement));
        for (const gap of gaps) {
          let cursor = gap.start;
          while (cursor < gap.end) {
            const chunkEnd = Math.min(cursor + CHUNK_SIZE_MS, gap.end);
            const item = { bed: bed.toLowerCase(), measurement: measurement.toLowerCase(), start: cursor, end: chunkEnd };
            const key = this.inFlightKey(item);
            if (!this.inFlightKeys.has(key)) {
              this.inFlightKeys.add(key);
              missingItems.push(item);
            }
            cursor = chunkEnd;
          }
        }
      }
    }
    if (!missingItems.length) return;

    const groups = new Map<string, RequestGroup>();
    for (const item of missingItems) {
      const key = `${item.start}_${item.end}`;
      if (!groups.has(key)) groups.set(key, { start: item.start, end: item.end, beds: new Set(), measurements: new Set(), items: [] });
      const group = groups.get(key)!;
      group.beds.add(item.bed);
      group.measurements.add(item.measurement);
      group.items.push(item);
    }

    let successfulRequest = false;
    const tasks = [...groups.values()].map(async (group) => {
      try {
        if (signal?.aborted) return;
        const fields = [...group.measurements].map((m) => MEASUREMENT_TO_API_FIELD[m]).filter(Boolean);
        const response = await holeHistorieChunkFiltered(
          new Date(group.start).toISOString(),
          new Date(group.end).toISOString(),
          [...group.beds],
          fields,
          signal,
        );
        if (signal?.aborted) return;

        for (const bed of response.beds ?? []) {
          for (const sensor of bed.sensors ?? []) {
            const position = sensor.bed_position.toLowerCase();
            for (const point of sensor.history ?? []) {
              for (const [apiField, value] of Object.entries(point.values ?? {})) {
                const measurement = API_FIELD_TO_MEASUREMENT[apiField];
                if (measurement && typeof value === "number" && Number.isFinite(value)) {
                  this.addPoint(bed.name, measurement, position, point.timestamp, value);
                }
              }
            }
          }
        }

        for (const item of group.items) this.markCovered(item.bed, item.measurement, group.start, group.end);
        successfulRequest = true;
      } catch (error) {
        if (!signal?.aborted) onError?.(error);
      } finally {
        for (const item of group.items) this.inFlightKeys.delete(this.inFlightKey(item));
      }
    });

    await Promise.all(tasks);
    if (!signal?.aborted && successfulRequest) onDataUpdated();
  }

  private inFlightKey(item: MissingItem) {
    return `${item.bed}:${item.measurement}:${item.start}:${item.end}`;
  }

  public clear() {
    this.points = {};
    this.covered = {};
    this.inFlightKeys.clear();
  }
}

export function downsampleData(data: ChartDataPoint[], maxPoints = 350): ChartDataPoint[] {
  if (data.length <= maxPoints || maxPoints <= 2) return data;
  const result: ChartDataPoint[] = [data[0]];
  const bucketSize = (data.length - 2) / (maxPoints - 2);
  for (let i = 0; i < maxPoints - 2; i++) {
    const start = Math.floor(1 + i * bucketSize);
    const end = Math.floor(1 + (i + 1) * bucketSize);
    const mid = Math.floor((start + end) / 2);
    if (mid < data.length - 1) result.push(data[mid]);
  }
  result.push(data[data.length - 1]);
  return result;
}

export const historyCache = new HistoryCache();

export function downsampleMultiSeriesData(
  data: ChartDataPoint[],
  seriesKeys: string[],
  maxPointsPerSeries = 350,
): ChartDataPoint[] {
  if (data.length <= maxPointsPerSeries || seriesKeys.length === 0) {
    return data;
  }

  const keep = new Set<number>([0, data.length - 1]);

  for (const key of seriesKeys) {
    const indices: number[] = [];

    data.forEach((point, index) => {
      if (
        typeof point[key] === "number" &&
        Number.isFinite(point[key])
      ) {
        indices.push(index);
      }
    });

    if (indices.length <= maxPointsPerSeries) {
      indices.forEach((index) => keep.add(index));
      continue;
    }

    const step =
      (indices.length - 1) / (maxPointsPerSeries - 1);

    for (let i = 0; i < maxPointsPerSeries; i++) {
      keep.add(indices[Math.round(i * step)]);
    }
  }

  return Array.from(keep)
    .sort((a, b) => a - b)
    .map((index) => data[index]);
}