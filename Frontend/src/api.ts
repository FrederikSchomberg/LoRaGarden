import type { AuthResponse, LoginPayload, User } from "./types/auth";
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
  const antwort = await fetch(`${API_URL}/api/dashboard`);

  if (!antwort.ok) {
    throw new Error("Dashboard konnte nicht geladen werden");
  }

  const daten = await antwort.json();
  return daten;
}

// Hole historische Daten für das gesamte Dashboard
export async function holeDashboardHistorie(timeRange = "5d"): Promise<DashboardHistoryResponse> {
  const antwort = await fetch(
    `${API_URL}/api/dashboard/history?time_range=${encodeURIComponent(timeRange)}`);

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


/*
 * =========================================================
 * CHUNKED HISTORY (progressives Laden)
 * =========================================================
 *
 * Große Zeiträume (ab 30 Tagen) werden automatisch in
 * Monats-Chunks aufgeteilt. Jeder Chunk wird einzeln von
 * der API abgefragt, und das Ergebnis wird sofort per
 * Callback ans Frontend gemeldet. So füllt sich der Chart
 * Stück für Stück, ohne dass das Backend überlastet wird.
 */

// Schwelle: Ab dieser Anzahl Tage wird in Chunks aufgeteilt
const CHUNK_THRESHOLD_DAYS = 30;

// Maximale Chunk-Größe in Tagen (≈ 1 Monat)
const CHUNK_SIZE_DAYS = 30;


export type ChunkInfo = {
  /** 0-basierter Index des aktuellen Chunks */
  chunkIndex: number;
  /** Gesamtanzahl der Chunks */
  totalChunks: number;
  /** Start-Datum dieses Chunks */
  startDate: string;
  /** End-Datum dieses Chunks */
  endDate: string;
};

export type ChunkedHistoryCallback = (
  data: DashboardHistoryResponse,
  chunk: ChunkInfo,
) => void;


/**
 * Berechnet, wie viele Tage ein Zeitraum-String wie "5d", "2w" etc. enthält.
 */
// function zeitraumZuTagen(zeitraum: string): number {
//   const clean = zeitraum.replace(/^-/, "").trim();
//   const match = clean.match(/^(\d+)(s|m|h|d|w|M|mo|y)$/i);

//   if (!match) return 7;

//   const wert = parseInt(match[1], 10);
//   const einheit = match[2].toLowerCase();

//   switch (einheit) {
//     case "s": return wert / 86400;
//     case "m": return wert / 1440;
//     case "h": return wert / 24;
//     case "d": return wert;
//     case "w": return wert * 7;
//     case "mo": return wert * 30;
//     case "y": return wert * 365;
//     default: return wert;
//   }
// }


function zeitraumZuTagen(zeitraum: string): number {
  const clean = zeitraum.replace(/^-/, "").trim();
  const match = clean.match(/^(\d+)(s|m|h|d|w|M|mo|y)$/);

  if (!match) return 7;

  const wert = Number(match[1]);
  const einheit = match[2];

  switch (einheit) {
    case "s":  return wert / 86400;
    case "m":  return wert / 1440;
    case "h":  return wert / 24;
    case "d":  return wert;
    case "w":  return wert * 7;
    case "M":
    case "mo": return wert * 30;
    case "y":  return wert * 365;
    default:   return 7;
  }
}



/**
 * Teilt einen Zeitraum in Monats-Chunks auf.
 * Gibt ein Array von { start, end } ISO-Strings zurück.
 */
export function berechneChunks(zeitraum: string): { start: string; end: string }[] {
  const tage = zeitraumZuTagen(zeitraum);
  const jetzt = new Date();
  const startDatum = new Date(jetzt.getTime() - tage * 24 * 60 * 60 * 1000);

  // Wenn der Zeitraum unter der Schwelle liegt, ein einziger Chunk
  if (tage < CHUNK_THRESHOLD_DAYS) {
    return [{
      start: startDatum.toISOString(),
      end: jetzt.toISOString(),
    }];
  }

  const chunks: { start: string; end: string }[] = [];
  let cursor = new Date(startDatum);

  while (cursor < jetzt) {
    const chunkEnd = new Date(
      Math.min(
        cursor.getTime() + CHUNK_SIZE_DAYS * 24 * 60 * 60 * 1000,
        jetzt.getTime(),
      ),
    );

    chunks.push({
      start: cursor.toISOString(),
      end: chunkEnd.toISOString(),
    });

    cursor = chunkEnd;
  }

  return chunks;
}


/**
 * Fragt einen einzelnen Chunk von der API ab – optional gefiltert nach Beeten und Feldern.
 */
export async function holeHistorieChunkFiltered(
  startDate: string,
  endDate: string,
  beds?: string[],
  fields?: string[],
  abortSignal?: AbortSignal,
): Promise<DashboardHistoryResponse> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  if (beds && beds.length > 0) {
    params.set("beds", beds.join(","));
  }

  if (fields && fields.length > 0) {
    params.set("fields", fields.join(","));
  }

  const antwort = await fetch(
    `${API_URL}/api/dashboard/history/chunk?${params.toString()}`,
    { signal: abortSignal },
  );

  if (!antwort.ok) {
    const fehler = await extrahiereFehlermeldung(
      antwort,
      `Chunk ${startDate} – ${endDate} konnte nicht geladen werden`,
    );
    throw new Error(fehler);
  }

  return antwort.json();
}

/**
 * Fragt einen einzelnen Chunk von der API ab.
 */
// async function holeHistorieChunk(
//   startDate: string,
//   endDate: string,
// ): Promise<DashboardHistoryResponse> {
//   return holeHistorieChunkFiltered(startDate, endDate);
// }
async function holeHistorieChunk(
  startDate: string,
  endDate: string,
  abortSignal?: AbortSignal,
): Promise<DashboardHistoryResponse> {
  return holeHistorieChunkFiltered(
    startDate,
    endDate,
    undefined,
    undefined,
    abortSignal,
  );
}


/**
 * Lädt historische Daten progressiv in Chunks.
 *
 * - Zeiträume < 30 Tage → ein einzelner API Call (normaler Endpunkt)
 * - Zeiträume ≥ 30 Tage → aufgeteilt in ~30 Tage Blöcke
 *
 * Nach jedem geladenen Chunk wird `onChunk` aufgerufen,
 * damit das Frontend die Daten sofort im Chart nachtragen kann.
 *
 * @returns Die Gesamtanzahl der Chunks
 */
export async function holeDashboardHistorieChunked(
  zeitraum: string,
  onChunk: ChunkedHistoryCallback,
  abortSignal?: AbortSignal,
): Promise<number> {
  const tage = zeitraumZuTagen(zeitraum);

  // Kleine Zeiträume ganz normal laden (kein Chunking)
  if (tage < CHUNK_THRESHOLD_DAYS) {
    const daten = await holeDashboardHistorie(zeitraum);
    onChunk(daten, {
      chunkIndex: 0,
      totalChunks: 1,
      startDate: new Date(Date.now() - tage * 86400000).toISOString(),
      endDate: new Date().toISOString(),
    });
    return 1;
  }

  // Große Zeiträume: in Chunks aufteilen und sequentiell abfragen
  const chunks = berechneChunks(zeitraum);

  for (let i = 0; i < chunks.length; i++) {
    // Abbruch, falls die Komponente unmounted oder der Zeitraum gewechselt wurde
    if (abortSignal?.aborted) break;

    const chunk = chunks[i];
    const daten = await holeHistorieChunk(chunk.start, chunk.end, abortSignal);

    onChunk(daten, {
      chunkIndex: i,
      totalChunks: chunks.length,
      startDate: chunk.start,
      endDate: chunk.end,
    });
  }

  return chunks.length;
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

  const daten: AuthResponse = await antwort.json();
  if (daten.token) {
    localStorage.setItem("access_token", daten.token);
  }
  return daten;
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem("access_token");

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
    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const antwort = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!antwort.ok) {
      if (antwort.status === 401) {
        localStorage.removeItem("access_token");
      }
      return null;
    }

    const daten = await antwort.json();
    return daten.user || null;
  } catch {
    return null;
  }
}