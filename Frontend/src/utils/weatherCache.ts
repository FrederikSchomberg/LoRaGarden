export type WeatherPoint = {
  timestamp: string;
  value: number | null;
};

const weatherValues = new Map<string, number | null>();

const cachedDays = new Set<string>();

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  return formatDateForApi(date);
}

function getMissingRanges(
  startDate: string,
  endDate: string
): Array<{ startDate: string; endDate: string }> {
  const missingRanges: Array<{
    startDate: string;
    endDate: string;
  }> = [];

  let currentDate = startDate;

  while (currentDate <= endDate) {
    if (cachedDays.has(currentDate)) {
      currentDate = addDays(currentDate, 1);
      continue;
    }

    const rangeStart = currentDate;

    while (
      currentDate <= endDate &&
      !cachedDays.has(currentDate)
    ) {
      currentDate = addDays(currentDate, 1);
    }

    missingRanges.push({
      startDate: rangeStart,
      endDate: addDays(currentDate, -1),
    });
  }

  return missingRanges;
}

async function fetchWeatherRange(
  startDate: string,
  endDate: string,
  signal?: AbortSignal
): Promise<void> {
  const latitude = 51.4817;
  const longitude = 7.2165;

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start_date: startDate,
    end_date: endDate,
    hourly: "temperature_2m",
    timezone: "Europe/Berlin",
  });

  const url =
    `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(
      `Wetterdaten konnten für ${startDate} bis ${endDate} nicht geladen werden.`
    );
  }

  const data = await response.json();

  const times: string[] = data.hourly?.time ?? [];
  const temperatures: Array<number | null> =
    data.hourly?.temperature_2m ?? [];

  times.forEach((timestamp, index) => {
    weatherValues.set(
      timestamp,
      temperatures[index] ?? null
    );
  });

  let currentDate = startDate;

  while (currentDate <= endDate) {
    cachedDays.add(currentDate);
    currentDate = addDays(currentDate, 1);
  }
}

export async function getWeatherData(
  targetStart: number,
  targetEnd: number,
  signal?: AbortSignal
): Promise<WeatherPoint[]> {
  const startDate = formatDateForApi(new Date(targetStart));
  const endDate = formatDateForApi(new Date(targetEnd));

  const missingRanges = getMissingRanges(startDate, endDate);

  for (const range of missingRanges) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    await fetchWeatherRange(
      range.startDate,
      range.endDate,
      signal
    );
  }

  return Array.from(weatherValues.entries())
    .filter(([timestamp]) => {
      const time = new Date(timestamp).getTime();

      return time >= targetStart && time <= targetEnd;
    })
    .map(([timestamp, value]) => ({
      timestamp,
      value,
    }))
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    );
}

export function clearWeatherCache(): void {
  weatherValues.clear();
  cachedDays.clear();
}