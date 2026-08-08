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