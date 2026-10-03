export type Messwerte = {
  soil_temperature: number | null;
  soil_moisture: number | null;
  soil_ec: number | null;
  battery_voltage: number | null;
};

export type SensorDaten = {
  sensor_id: string;
  city: string;
  area: string;
  place: string;
  bed: string;
  bed_position: "Oben" | "Unten";
  substrate: string;
  values: Messwerte;
  updated_at: string | null;
};

export type BeetDaten = {
  name: string;
  substrate: string;
  sensors: SensorDaten[];
};

export type DashboardResponse = {
  database: {
    type: string;
    connected: boolean;
  };
  beds: BeetDaten[];
};

export type SensorPosition = "oben" | "unten";

export type HistoricalSensorPoint = {
  timestamp: string;
  values: Messwerte;
};

export type SensorHistoryDaten = Omit<SensorDaten, "values" | "updated_at"> & {
  history: HistoricalSensorPoint[];
  count: number;
};

export type BeetHistoryDaten = {
  name: string;
  substrate: string;
  time_range: string;
  sensors: SensorHistoryDaten[];
};

export type DashboardHistoryResponse = {
  database: {
    type: string;
    connected: boolean;
  };
  time_range: string;
  beds: BeetHistoryDaten[];
};