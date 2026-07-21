// typ für die daten vom backend
export type DashboardResponse = {
  mqtt: {
    connected: boolean;
    last_message_at: string | null;
  };
  data: {
    "Beet1": {
      temperatur_ist: number | null;
      temperatur_soll: number | null;
      temperatur_differenz: number | null;
      updated_at: string | null;
    };
  };
};

// basis url
const API_URL = "http://127.0.0.1:8001/api/dashboard";

// dashboard daten laden
export async function fetchDashboardData(
  beet: string = "Alle"
): Promise<DashboardResponse> {

  const url = `${API_URL}?beet=${encodeURIComponent(beet)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Dashboard API konnte nicht geladen werden");
  }

  return response.json();
}