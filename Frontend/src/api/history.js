const MOCK_DATA = [
  {
    beet: "Carla",
    measurement: "temperature",
    position: "oben",
    timestamp: "2026-09-25T08:00:00",
    value: 21.4,
  },
  {
    beet: "Carla",
    measurement: "temperature",
    position: "oben",
    timestamp: "2026-09-25T12:00:00",
    value: 23.1,
  },
  {
    beet: "Carla",
    measurement: "temperature",
    position: "oben",
    timestamp: "2026-09-25T16:00:00",
    value: 24.3,
  },

  {
    beet: "Carla",
    measurement: "temperature",
    position: "unten",
    timestamp: "2026-09-25T08:00:00",
    value: 19.8,
  },

  {
    beet: "Carla",
    measurement: "soil_moisture",
    position: "oben",
    timestamp: "2026-09-25T08:00:00",
    value: 42,
  },

  {
    beet: "Carla",
    measurement: "conductivity",
    position: "oben",
    timestamp: "2026-09-25T08:00:00",
    value: 1.2,
  },
];

export async function getHistory({
  beete,
  measurements,
  position,
  from,
  to,
}) {
  /*
   * Später:
   *
   * const params = new URLSearchParams({
   *   beete: beete.join(","),
   *   measurements: measurements.join(","),
   *   position,
   *   from,
   *   to,
   * });
   *
   * const response = await fetch(
   *   `/api/history?${params}`
   * );
   *
   * return response.json();
   */

  await new Promise((resolve) =>
    setTimeout(resolve, 200)
  );

  return MOCK_DATA.filter(
    (point) => {
      if (
        beete.length > 0 &&
        !beete.includes(point.beet)
      ) {
        return false;
      }

      if (
        measurements.length > 0 &&
        !measurements.includes(
          point.measurement
        )
      ) {
        return false;
      }

      if (
        position &&
        point.position !== position
      ) {
        return false;
      }

      if (
        from &&
        new Date(point.timestamp) <
          new Date(from)
      ) {
        return false;
      }

      if (
        to &&
        new Date(point.timestamp) >
          new Date(to)
      ) {
        return false;
      }

      return true;
    }
  );
}