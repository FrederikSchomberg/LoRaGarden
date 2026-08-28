import type { DashboardResponse } from "./types/dashboard";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

// Hole die Beete anstatt von dem Dashboard oder Dashboard
export async function holeDashboard(): Promise<DashboardResponse> {
  // console.log("API URL:", API_URL);
  // console.log("Rufe auf:", `${API_URL}`);

  const antwort = await fetch(`${API_URL}/api/dashboard`);

  // console.log("HTTP Status:", antwort.status);
  // console.log("Antwort OK:", antwort.ok);

  if (!antwort.ok) {
    throw new Error("Dashboard konnte nicht geladen werden");
  }

  const daten = await antwort.json();

  // console.log("Dashboard-Daten:", daten);

  return daten;
}