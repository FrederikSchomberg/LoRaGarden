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

// login daten ans backend schicken
export async function login(benutzername: string, passwort: string) {
  const antwort = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    // wichtig für den login-cookie vom backend
    credentials: "include",

    body: JSON.stringify({
      username: benutzername,
      password: passwort,
    }),
  });

  // login daten waren falsch
  if (antwort.status === 401 || antwort.status === 403) {
    return false;
  }

  // irgendein anderer fehler vom backend
  if (!antwort.ok) {
    throw new Error("Login fehlgeschlagen");
  }

  return true;
}
