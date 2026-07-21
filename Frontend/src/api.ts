export type BedName = "Alle" | "Beet1" | "Beet2" | "Beet3";

export type BedData = {
  temperatur_ist: number | null;
  temperatur_soll: number | null;
  temperatur_differenz: number | null;
  updated_at: string | null;
};


export type DashboardResponse = {
  mqtt: {
    connected: boolean;
    last_message_at: string | null;
  };

  data: Partial<Record<Exclude<BedName, "Alle">, BedData>>;
};

const API_URL = "http://127.0.0.1:8001/api/dashboard";

export async function fetchDashboardData(
  beet: BedName = "Alle"
): Promise<DashboardResponse> {
  const url = `${API_URL}?beet=${encodeURIComponent(beet)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Dashboard API konnte nicht geladen werden");
  }

  return response.json();
}