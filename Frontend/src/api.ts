import type { AuthResponse, LoginPayload, RegisterPayload, User } from "./types/auth";
import type { DashboardHistoryResponse, DashboardResponse } from "./types/dashboard";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

async function extrahiereFehlermeldung(res: Response, standard: string): Promise<string> {
  try {
    const daten = await res.json();
    if (typeof daten?.detail === "string") {
      return daten.detail;
    }
    if (Array.isArray(daten?.detail) && daten.detail.length > 0) {
      return daten.detail
        .map((e: { msg?: string }) => e.msg || "")
        .filter(Boolean)
        .join(", ");
    }
  } catch {
    // Fehler beim Parsen ignorieren und Standardmeldung verwenden
  }
  return standard;
}

// Hole die Beete anstatt von dem Dashboard oder Dashboard
export async function holeDashboard(): Promise<DashboardResponse> {
  const antwort = await fetch(`${API_URL}/api/dashboard`, {
    credentials: "include",
  });

  if (!antwort.ok) {
    throw new Error("Dashboard konnte nicht geladen werden");
  }

  const daten = await antwort.json();
  return daten;
}

// Hole historische Daten für das gesamte Dashboard
export async function holeDashboardHistorie(timeRange = "5d"): Promise<DashboardHistoryResponse> {
  const antwort = await fetch(
    `${API_URL}/api/dashboard/history?time_range=${encodeURIComponent(timeRange)}`,
    {
      credentials: "include",
    },
  );

  if (!antwort.ok) {
    const fehler = await extrahiereFehlermeldung(
      antwort,
      "Dashboard-Historie konnte nicht geladen werden",
    );
    throw new Error(fehler);
  }

  const daten = await antwort.json();
  return daten;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const antwort = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!antwort.ok) {
    const fehler = await extrahiereFehlermeldung(
      antwort,
      "Anmeldung fehlgeschlagen. Bitte Eingaben überprüfen.",
    );
    throw new Error(fehler);
  }

  return antwort.json();
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const antwort = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!antwort.ok) {
    const fehler = await extrahiereFehlermeldung(
      antwort,
      "Registrierung fehlgeschlagen. Bitte Eingaben überprüfen.",
    );
    throw new Error(fehler);
  }

  return antwort.json();
}

export async function logoutUser(): Promise<void> {
  const antwort = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!antwort.ok) {
    const fehler = await extrahiereFehlermeldung(
      antwort,
      "Abmeldung fehlgeschlagen.",
    );
    throw new Error(fehler);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const antwort = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!antwort.ok) {
      return null;
    }

    const daten = await antwort.json();
    return daten.user || null;
  } catch {
    return null;
  }
}