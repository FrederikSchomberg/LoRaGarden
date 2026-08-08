import type { DashboardResponse } from "../types/dashboard";

// damit man das neue frontend auch ohne hochschul-vpn ansehen kann
const demoZeit = new Date().toISOString();

export const beispielDaten: DashboardResponse = {
  database: {
    type: "InfluxDB",
    connected: false,
  },
  beds: [
    {
      name: "carla",
      substrate: "10 % Pflanzenkohle",
      sensors: [
        {
          sensor_id: "00612B1F",
          city: "Bochum",
          area: "RUB",
          place: "Botanischer Garten",
          bed: "Carla",
          bed_position: "Oben",
          substrate: "10 % Pflanzenkohle",
          values: {
            soil_temperature: 22.8,
            soil_moisture: 43.1,
            soil_ec: 389,
            battery_voltage: 3.82,
          },
          updated_at: demoZeit,
        },
        {
          sensor_id: "0060294C",
          city: "Bochum",
          area: "RUB",
          place: "Botanischer Garten",
          bed: "Carla",
          bed_position: "Unten",
          substrate: "10 % Pflanzenkohle",
          values: {
            soil_temperature: 21.9,
            soil_moisture: 47.5,
            soil_ec: 410,
            battery_voltage: 3.79,
          },
          updated_at: demoZeit,
        },
      ],
    },
    {
      name: "berta",
      substrate: "5 % Pflanzenkohle",
      sensors: [
        {
          sensor_id: "00612B28",
          city: "Bochum",
          area: "RUB",
          place: "Botanischer Garten",
          bed: "Berta",
          bed_position: "Oben",
          substrate: "5 % Pflanzenkohle",
          values: {
            soil_temperature: 23.4,
            soil_moisture: 36.2,
            soil_ec: 362,
            battery_voltage: 3.76,
          },
          updated_at: demoZeit,
        },
        {
          sensor_id: "0060294B",
          city: "Bochum",
          area: "RUB",
          place: "Botanischer Garten",
          bed: "Berta",
          bed_position: "Unten",
          substrate: "5 % Pflanzenkohle",
          values: {
            soil_temperature: 22.6,
            soil_moisture: 39.8,
            soil_ec: 377,
            battery_voltage: 3.74,
          },
          updated_at: demoZeit,
        },
      ],
    },
    {
      name: "ilse",
      substrate: "Sand",
      sensors: [
        {
          sensor_id: "0060294A",
          city: "Bochum",
          area: "RUB",
          place: "Botanischer Garten",
          bed: "Ilse",
          bed_position: "Oben",
          substrate: "Sand",
          values: {
            soil_temperature: 24.1,
            soil_moisture: 29.4,
            soil_ec: 245,
            battery_voltage: 3.68,
          },
          updated_at: demoZeit,
        },
        {
          sensor_id: "0060294E",
          city: "Bochum",
          area: "RUB",
          place: "Botanischer Garten",
          bed: "Ilse",
          bed_position: "Unten",
          substrate: "Sand",
          values: {
            soil_temperature: 23.2,
            soil_moisture: 33.1,
            soil_ec: 261,
            battery_voltage: 3.71,
          },
          updated_at: demoZeit,
        },
      ],
    },
  ],
};