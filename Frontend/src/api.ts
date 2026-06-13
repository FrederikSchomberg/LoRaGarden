// typ für die daten vom backend
export type DashboardResponse = {
  mqtt: {
    connected: boolean;
    last_message_at: string | null;
  };
  data: {
    s7: {
      temperatur_ist: number | null;
      temperatur_soll: number | null;
      temperatur_differenz: number | null;
      updated_at: string | null;
    };
  };
};

// api adresse vom backend
const API_URL = "http://127.0.0.1:8001/api/dashboard";

// dashboard daten vom backend holen
export async function fetchDashboardData(): Promise<DashboardResponse> {
  // api anfragen
  const response = await fetch(API_URL);

  // wenn api fehler dann abbruch
  if (!response.ok) {
    throw new Error("Dashboard API konnte nicht geladen werden");
  }

  //als json zurück
  return response.json();
}