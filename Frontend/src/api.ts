import type { DashboardResponse } from "./types/dashboard";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

export async function holeDashboard(): Promise<DashboardResponse> {
  const antwort = await fetch(`${API_URL}/api/dashboard`);

  if (!antwort.ok) {
    throw new Error("dashboard konnte nicht geladen werden");
  }

  return antwort.json();
}
