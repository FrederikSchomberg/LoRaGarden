import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/*
 * =========================================================
 * MOCKDATEN
 * =========================================================
 *
 * Diese Daten werden später durch die Antwort der API ersetzt.
 *
 * Aktuell:
 * MOCK_DATA
 *
 * Später:
 * API / Datenbank
 */

const MOCK_DATA = {
  Carla: {
    temperature: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 21.4 },
        { timestamp: "2026-09-25T12:00:00", value: 23.1 },
        { timestamp: "2026-09-25T16:00:00", value: 24.3 },
        { timestamp: "2026-09-26T08:00:00", value: 20.8 },
        { timestamp: "2026-09-26T12:00:00", value: 22.7 },
        { timestamp: "2026-09-26T16:00:00", value: 25.1 },
        { timestamp: "2026-09-27T08:00:00", value: 21.2 },
        { timestamp: "2026-09-27T12:00:00", value: 24.0 },
        { timestamp: "2026-09-27T16:00:00", value: 26.2 },
        { timestamp: "2026-09-28T08:00:00", value: 21.7 },
        { timestamp: "2026-09-28T12:00:00", value: 23.8 },
        { timestamp: "2026-09-28T16:00:00", value: 25.7 },
        { timestamp: "2026-09-29T08:00:00", value: 20.9 },
        { timestamp: "2026-09-29T12:00:00", value: 23.4 },
        { timestamp: "2026-09-29T16:00:00", value: 24.9 },
        { timestamp: "2026-09-30T08:00:00", value: 21.5 },
        { timestamp: "2026-09-30T12:00:00", value: 24.2 },
        { timestamp: "2026-09-30T16:00:00", value: 26.0 },
      ],

      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 19.8 },
        { timestamp: "2026-09-25T12:00:00", value: 21.2 },
        { timestamp: "2026-09-25T16:00:00", value: 22.4 },
        { timestamp: "2026-09-26T08:00:00", value: 19.3 },
        { timestamp: "2026-09-26T12:00:00", value: 21.0 },
        { timestamp: "2026-09-26T16:00:00", value: 23.0 },
        { timestamp: "2026-09-27T08:00:00", value: 19.6 },
        { timestamp: "2026-09-27T12:00:00", value: 21.9 },
        { timestamp: "2026-09-27T16:00:00", value: 23.8 },
        { timestamp: "2026-09-28T08:00:00", value: 20.0 },
        { timestamp: "2026-09-28T12:00:00", value: 21.7 },
        { timestamp: "2026-09-28T16:00:00", value: 23.4 },
        { timestamp: "2026-09-29T08:00:00", value: 19.5 },
        { timestamp: "2026-09-29T12:00:00", value: 21.5 },
        { timestamp: "2026-09-29T16:00:00", value: 22.9 },
        { timestamp: "2026-09-30T08:00:00", value: 20.1 },
        { timestamp: "2026-09-30T12:00:00", value: 22.0 },
        { timestamp: "2026-09-30T16:00:00", value: 24.1 },
      ],
    },

    soil_moisture: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 42 },
        { timestamp: "2026-09-25T12:00:00", value: 40 },
        { timestamp: "2026-09-25T16:00:00", value: 38 },
        { timestamp: "2026-09-26T08:00:00", value: 43 },
        { timestamp: "2026-09-26T12:00:00", value: 41 },
        { timestamp: "2026-09-26T16:00:00", value: 39 },
        { timestamp: "2026-09-27T08:00:00", value: 44 },
        { timestamp: "2026-09-27T12:00:00", value: 42 },
        { timestamp: "2026-09-27T16:00:00", value: 40 },
        { timestamp: "2026-09-28T08:00:00", value: 45 },
        { timestamp: "2026-09-28T12:00:00", value: 43 },
        { timestamp: "2026-09-28T16:00:00", value: 41 },
        { timestamp: "2026-09-29T08:00:00", value: 46 },
        { timestamp: "2026-09-29T12:00:00", value: 44 },
        { timestamp: "2026-09-29T16:00:00", value: 42 },
        { timestamp: "2026-09-30T08:00:00", value: 45 },
        { timestamp: "2026-09-30T12:00:00", value: 43 },
        { timestamp: "2026-09-30T16:00:00", value: 41 },
      ],

      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 48 },
        { timestamp: "2026-09-25T12:00:00", value: 46 },
        { timestamp: "2026-09-25T16:00:00", value: 44 },
        { timestamp: "2026-09-26T08:00:00", value: 49 },
        { timestamp: "2026-09-26T12:00:00", value: 47 },
        { timestamp: "2026-09-26T16:00:00", value: 45 },
        { timestamp: "2026-09-27T08:00:00", value: 50 },
        { timestamp: "2026-09-27T12:00:00", value: 48 },
        { timestamp: "2026-09-27T16:00:00", value: 46 },
        { timestamp: "2026-09-28T08:00:00", value: 51 },
        { timestamp: "2026-09-28T12:00:00", value: 49 },
        { timestamp: "2026-09-28T16:00:00", value: 47 },
        { timestamp: "2026-09-29T08:00:00", value: 52 },
        { timestamp: "2026-09-29T12:00:00", value: 50 },
        { timestamp: "2026-09-29T16:00:00", value: 48 },
        { timestamp: "2026-09-30T08:00:00", value: 51 },
        { timestamp: "2026-09-30T12:00:00", value: 49 },
        { timestamp: "2026-09-30T16:00:00", value: 47 },
      ],
    },

    conductivity: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 1.2 },
        { timestamp: "2026-09-25T12:00:00", value: 1.3 },
        { timestamp: "2026-09-25T16:00:00", value: 1.4 },
        { timestamp: "2026-09-26T08:00:00", value: 1.2 },
        { timestamp: "2026-09-26T12:00:00", value: 1.5 },
        { timestamp: "2026-09-26T16:00:00", value: 1.6 },
        { timestamp: "2026-09-27T08:00:00", value: 1.3 },
        { timestamp: "2026-09-27T12:00:00", value: 1.6 },
        { timestamp: "2026-09-27T16:00:00", value: 1.7 },
        { timestamp: "2026-09-28T08:00:00", value: 1.4 },
        { timestamp: "2026-09-28T12:00:00", value: 1.7 },
        { timestamp: "2026-09-28T16:00:00", value: 1.8 },
        { timestamp: "2026-09-29T08:00:00", value: 1.5 },
        { timestamp: "2026-09-29T12:00:00", value: 1.8 },
        { timestamp: "2026-09-29T16:00:00", value: 1.9 },
        { timestamp: "2026-09-30T08:00:00", value: 1.6 },
        { timestamp: "2026-09-30T12:00:00", value: 1.9 },
        { timestamp: "2026-09-30T16:00:00", value: 2.0 },
      ],

      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 1.0 },
        { timestamp: "2026-09-25T12:00:00", value: 1.1 },
        { timestamp: "2026-09-25T16:00:00", value: 1.2 },
        { timestamp: "2026-09-26T08:00:00", value: 1.0 },
        { timestamp: "2026-09-26T12:00:00", value: 1.2 },
        { timestamp: "2026-09-26T16:00:00", value: 1.3 },
        { timestamp: "2026-09-27T08:00:00", value: 1.1 },
        { timestamp: "2026-09-27T12:00:00", value: 1.3 },
        { timestamp: "2026-09-27T16:00:00", value: 1.4 },
        { timestamp: "2026-09-28T08:00:00", value: 1.2 },
        { timestamp: "2026-09-28T12:00:00", value: 1.4 },
        { timestamp: "2026-09-28T16:00:00", value: 1.5 },
        { timestamp: "2026-09-29T08:00:00", value: 1.3 },
        { timestamp: "2026-09-29T12:00:00", value: 1.5 },
        { timestamp: "2026-09-29T16:00:00", value: 1.6 },
        { timestamp: "2026-09-30T08:00:00", value: 1.4 },
        { timestamp: "2026-09-30T12:00:00", value: 1.6 },
        { timestamp: "2026-09-30T16:00:00", value: 1.7 },
      ],
    },
  },

  Berta: {
    temperature: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 11.4 },
        { timestamp: "2026-09-25T12:00:00", value: 13.1 },
        { timestamp: "2026-09-25T16:00:00", value: 14.3 },
        { timestamp: "2026-09-26T08:00:00", value: 10.8 },
        { timestamp: "2026-09-26T12:00:00", value: 12.7 },
        { timestamp: "2026-09-26T16:00:00", value: 15.1 },
        { timestamp: "2026-09-27T08:00:00", value: 11.2 },
        { timestamp: "2026-09-27T12:00:00", value: 14.0 },
        { timestamp: "2026-09-27T16:00:00", value: 16.2 },
        { timestamp: "2026-09-28T08:00:00", value: 11.7 },
        { timestamp: "2026-09-28T12:00:00", value: 13.8 },
        { timestamp: "2026-09-28T16:00:00", value: 15.7 },
        { timestamp: "2026-09-29T08:00:00", value: 10.9 },
        { timestamp: "2026-09-29T12:00:00", value: 13.4 },
        { timestamp: "2026-09-29T16:00:00", value: 14.9 },
        { timestamp: "2026-09-30T08:00:00", value: 11.5 },
        { timestamp: "2026-09-30T12:00:00", value: 14.2 },
        { timestamp: "2026-09-30T16:00:00", value: 16.0 },
      ],
      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 11.4 },
        { timestamp: "2026-09-25T12:00:00", value: 13.1 },
        { timestamp: "2026-09-25T16:00:00", value: 14.3 },
        { timestamp: "2026-09-26T08:00:00", value: 10.8 },
        { timestamp: "2026-09-26T12:00:00", value: 12.7 },
        { timestamp: "2026-09-26T16:00:00", value: 15.1 },
        { timestamp: "2026-09-27T08:00:00", value: 11.2 },
        { timestamp: "2026-09-27T12:00:00", value: 14.0 },
        { timestamp: "2026-09-27T16:00:00", value: 16.2 },
        { timestamp: "2026-09-28T08:00:00", value: 11.7 },
        { timestamp: "2026-09-28T12:00:00", value: 13.8 },
        { timestamp: "2026-09-28T16:00:00", value: 15.7 },
        { timestamp: "2026-09-29T08:00:00", value: 10.9 },
        { timestamp: "2026-09-29T12:00:00", value: 13.4 },
        { timestamp: "2026-09-29T16:00:00", value: 14.9 },
        { timestamp: "2026-09-30T08:00:00", value: 11.5 },
        { timestamp: "2026-09-30T12:00:00", value: 14.2 },
        { timestamp: "2026-09-30T16:00:00", value: 16.0 },
      ],
    },
    soil_moisture: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 32 },
        { timestamp: "2026-09-25T12:00:00", value: 30 },
        { timestamp: "2026-09-25T16:00:00", value: 28 },
        { timestamp: "2026-09-26T08:00:00", value: 33 },
        { timestamp: "2026-09-26T12:00:00", value: 31 },
        { timestamp: "2026-09-26T16:00:00", value: 29 },
        { timestamp: "2026-09-27T08:00:00", value: 34 },
        { timestamp: "2026-09-27T12:00:00", value: 32 },
        { timestamp: "2026-09-27T16:00:00", value: 30 },
        { timestamp: "2026-09-28T08:00:00", value: 35 },
        { timestamp: "2026-09-28T12:00:00", value: 33 },
        { timestamp: "2026-09-28T16:00:00", value: 31 },
        { timestamp: "2026-09-29T08:00:00", value: 36 },
        { timestamp: "2026-09-29T12:00:00", value: 34 },
        { timestamp: "2026-09-29T16:00:00", value: 32 },
        { timestamp: "2026-09-30T08:00:00", value: 35 },
        { timestamp: "2026-09-30T12:00:00", value: 33 },
        { timestamp: "2026-09-30T16:00:00", value: 31 },
      ],
      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 32 },
        { timestamp: "2026-09-25T12:00:00", value: 30 },
        { timestamp: "2026-09-25T16:00:00", value: 28 },
        { timestamp: "2026-09-26T08:00:00", value: 33 },
        { timestamp: "2026-09-26T12:00:00", value: 31 },
        { timestamp: "2026-09-26T16:00:00", value: 29 },
        { timestamp: "2026-09-27T08:00:00", value: 34 },
        { timestamp: "2026-09-27T12:00:00", value: 32 },
        { timestamp: "2026-09-27T16:00:00", value: 30 },
        { timestamp: "2026-09-28T08:00:00", value: 35 },
        { timestamp: "2026-09-28T12:00:00", value: 33 },
        { timestamp: "2026-09-28T16:00:00", value: 31 },
        { timestamp: "2026-09-29T08:00:00", value: 36 },
        { timestamp: "2026-09-29T12:00:00", value: 34 },
        { timestamp: "2026-09-29T16:00:00", value: 32 },
        { timestamp: "2026-09-30T08:00:00", value: 35 },
        { timestamp: "2026-09-30T12:00:00", value: 33 },
        { timestamp: "2026-09-30T16:00:00", value: 31 },
      ],
    },
    conductivity: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 1.1 },
        { timestamp: "2026-09-25T12:00:00", value: 1.2 },
        { timestamp: "2026-09-25T16:00:00", value: 1.3 },
        { timestamp: "2026-09-26T08:00:00", value: 1.1 },
        { timestamp: "2026-09-26T12:00:00", value: 1.4 },
        { timestamp: "2026-09-26T16:00:00", value: 1.3 },
        { timestamp: "2026-09-27T08:00:00", value: 1.2 },
        { timestamp: "2026-09-27T12:00:00", value: 1.4 },
        { timestamp: "2026-09-27T16:00:00", value: 1.4 },
        { timestamp: "2026-09-28T08:00:00", value: 1.2 },
        { timestamp: "2026-09-28T12:00:00", value: 1.4 },
        { timestamp: "2026-09-28T16:00:00", value: 1.5 },
        { timestamp: "2026-09-29T08:00:00", value: 1.3 },
        { timestamp: "2026-09-29T12:00:00", value: 1.5 },
        { timestamp: "2026-09-29T16:00:00", value: 1.6 },
        { timestamp: "2026-09-30T08:00:00", value: 1.2 },
        { timestamp: "2026-09-30T12:00:00", value: 1.2 },
        { timestamp: "2026-09-30T16:00:00", value: 2.3 },
      ],
      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 1.1 },
        { timestamp: "2026-09-25T12:00:00", value: 1.2 },
        { timestamp: "2026-09-25T16:00:00", value: 1.3 },
        { timestamp: "2026-09-26T08:00:00", value: 1.1 },
        { timestamp: "2026-09-26T12:00:00", value: 1.4 },
        { timestamp: "2026-09-26T16:00:00", value: 1.3 },
        { timestamp: "2026-09-27T08:00:00", value: 1.2 },
        { timestamp: "2026-09-27T12:00:00", value: 1.4 },
        { timestamp: "2026-09-27T16:00:00", value: 1.4 },
        { timestamp: "2026-09-28T08:00:00", value: 1.2 },
        { timestamp: "2026-09-28T12:00:00", value: 1.4 },
        { timestamp: "2026-09-28T16:00:00", value: 1.5 },
        { timestamp: "2026-09-29T08:00:00", value: 1.3 },
        { timestamp: "2026-09-29T12:00:00", value: 1.5 },
        { timestamp: "2026-09-29T16:00:00", value: 1.6 },
        { timestamp: "2026-09-30T08:00:00", value: 1.2 },
        { timestamp: "2026-09-30T12:00:00", value: 1.2 },
        { timestamp: "2026-09-30T16:00:00", value: 2.3 },
      ],
    },
  },

  Ilse: {
    temperature: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 16.4 },
        { timestamp: "2026-09-25T12:00:00", value: 18.1 },
        { timestamp: "2026-09-25T16:00:00", value: 19.3 },
        { timestamp: "2026-09-26T08:00:00", value: 15.8 },
        { timestamp: "2026-09-26T12:00:00", value: 17.7 },
        { timestamp: "2026-09-26T16:00:00", value: 20.1 },
        { timestamp: "2026-09-27T08:00:00", value: 16.2 },
        { timestamp: "2026-09-27T12:00:00", value: 19.0 },
        { timestamp: "2026-09-27T16:00:00", value: 21.2 },
        { timestamp: "2026-09-28T08:00:00", value: 16.7 },
        { timestamp: "2026-09-28T12:00:00", value: 18.8 },
        { timestamp: "2026-09-28T16:00:00", value: 20.7 },
        { timestamp: "2026-09-29T08:00:00", value: 15.9 },
        { timestamp: "2026-09-29T12:00:00", value: 18.4 },
        { timestamp: "2026-09-29T16:00:00", value: 19.9 },
        { timestamp: "2026-09-30T08:00:00", value: 16.5 },
        { timestamp: "2026-09-30T12:00:00", value: 19.2 },
        { timestamp: "2026-09-30T16:00:00", value: 21.0 },
      ],
      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 16.4 },
        { timestamp: "2026-09-25T12:00:00", value: 18.1 },
        { timestamp: "2026-09-25T16:00:00", value: 19.3 },
        { timestamp: "2026-09-26T08:00:00", value: 15.8 },
        { timestamp: "2026-09-26T12:00:00", value: 17.7 },
        { timestamp: "2026-09-26T16:00:00", value: 20.1 },
        { timestamp: "2026-09-27T08:00:00", value: 16.2 },
        { timestamp: "2026-09-27T12:00:00", value: 19.0 },
        { timestamp: "2026-09-27T16:00:00", value: 21.2 },
        { timestamp: "2026-09-28T08:00:00", value: 16.7 },
        { timestamp: "2026-09-28T12:00:00", value: 18.8 },
        { timestamp: "2026-09-28T16:00:00", value: 20.7 },
        { timestamp: "2026-09-29T08:00:00", value: 15.9 },
        { timestamp: "2026-09-29T12:00:00", value: 18.4 },
        { timestamp: "2026-09-29T16:00:00", value: 19.9 },
        { timestamp: "2026-09-30T08:00:00", value: 16.5 },
        { timestamp: "2026-09-30T12:00:00", value: 19.2 },
        { timestamp: "2026-09-30T16:00:00", value: 21.0 },
      ],
    },
    soil_moisture: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 27 },
        { timestamp: "2026-09-25T12:00:00", value: 25 },
        { timestamp: "2026-09-25T16:00:00", value: 23 },
        { timestamp: "2026-09-26T08:00:00", value: 28 },
        { timestamp: "2026-09-26T12:00:00", value: 26 },
        { timestamp: "2026-09-26T16:00:00", value: 24 },
        { timestamp: "2026-09-27T08:00:00", value: 29 },
        { timestamp: "2026-09-27T12:00:00", value: 27 },
        { timestamp: "2026-09-27T16:00:00", value: 25 },
        { timestamp: "2026-09-28T08:00:00", value: 30 },
        { timestamp: "2026-09-28T12:00:00", value: 28 },
        { timestamp: "2026-09-28T16:00:00", value: 26 },
        { timestamp: "2026-09-29T08:00:00", value: 31 },
        { timestamp: "2026-09-29T12:00:00", value: 29 },
        { timestamp: "2026-09-29T16:00:00", value: 27 },
        { timestamp: "2026-09-30T08:00:00", value: 30 },
        { timestamp: "2026-09-30T12:00:00", value: 28 },
        { timestamp: "2026-09-30T16:00:00", value: 26 },
      ],
      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 27 },
        { timestamp: "2026-09-25T12:00:00", value: 25 },
        { timestamp: "2026-09-25T16:00:00", value: 23 },
        { timestamp: "2026-09-26T08:00:00", value: 28 },
        { timestamp: "2026-09-26T12:00:00", value: 26 },
        { timestamp: "2026-09-26T16:00:00", value: 24 },
        { timestamp: "2026-09-27T08:00:00", value: 29 },
        { timestamp: "2026-09-27T12:00:00", value: 27 },
        { timestamp: "2026-09-27T16:00:00", value: 25 },
        { timestamp: "2026-09-28T08:00:00", value: 30 },
        { timestamp: "2026-09-28T12:00:00", value: 28 },
        { timestamp: "2026-09-28T16:00:00", value: 26 },
        { timestamp: "2026-09-29T08:00:00", value: 31 },
        { timestamp: "2026-09-29T12:00:00", value: 29 },
        { timestamp: "2026-09-29T16:00:00", value: 27 },
        { timestamp: "2026-09-30T08:00:00", value: 30 },
        { timestamp: "2026-09-30T12:00:00", value: 28 },
        { timestamp: "2026-09-30T16:00:00", value: 26 },
      ],
    },
    conductivity: {
      oben: [
        { timestamp: "2026-09-25T08:00:00", value: 1.7 },
        { timestamp: "2026-09-25T12:00:00", value: 1.2 },
        { timestamp: "2026-09-25T16:00:00", value: 1.9 },
        { timestamp: "2026-09-26T08:00:00", value: 1.4 },
        { timestamp: "2026-09-26T12:00:00", value: 2.1 },
        { timestamp: "2026-09-26T16:00:00", value: 1.6 },
        { timestamp: "2026-09-27T08:00:00", value: 1.1 },
        { timestamp: "2026-09-27T12:00:00", value: 1.8 },
        { timestamp: "2026-09-27T16:00:00", value: 2.3 },
        { timestamp: "2026-09-28T08:00:00", value: 1.5 },
        { timestamp: "2026-09-28T12:00:00", value: 2.0 },
        { timestamp: "2026-09-28T16:00:00", value: 1.3 },
        { timestamp: "2026-09-29T08:00:00", value: 1.9 },
        { timestamp: "2026-09-29T12:00:00", value: 2.4 },
        { timestamp: "2026-09-29T16:00:00", value: 1.7 },
        { timestamp: "2026-09-30T08:00:00", value: 1.2 },
        { timestamp: "2026-09-30T12:00:00", value: 2.2 },
        { timestamp: "2026-09-30T16:00:00", value: 1.6 },
      ],
      unten: [
        { timestamp: "2026-09-25T08:00:00", value: 1.7 },
        { timestamp: "2026-09-25T12:00:00", value: 1.2 },
        { timestamp: "2026-09-25T16:00:00", value: 1.9 },
        { timestamp: "2026-09-26T08:00:00", value: 1.4 },
        { timestamp: "2026-09-26T12:00:00", value: 2.1 },
        { timestamp: "2026-09-26T16:00:00", value: 1.6 },
        { timestamp: "2026-09-27T08:00:00", value: 1.1 },
        { timestamp: "2026-09-27T12:00:00", value: 1.8 },
        { timestamp: "2026-09-27T16:00:00", value: 2.3 },
        { timestamp: "2026-09-28T08:00:00", value: 1.5 },
        { timestamp: "2026-09-28T12:00:00", value: 2.0 },
        { timestamp: "2026-09-28T16:00:00", value: 1.3 },
        { timestamp: "2026-09-29T08:00:00", value: 1.9 },
        { timestamp: "2026-09-29T12:00:00", value: 2.4 },
        { timestamp: "2026-09-29T16:00:00", value: 1.7 },
        { timestamp: "2026-09-30T08:00:00", value: 1.2 },
        { timestamp: "2026-09-30T12:00:00", value: 2.2 },
        { timestamp: "2026-09-30T16:00:00", value: 1.6 },
      ],
    },
  },
};


/*
 * =========================================================
 * BEET-KONFIGURATION
 * =========================================================
 */

const beetConfig = {
  Carla: {
    label: "Carla",
    description: "10 % Pflanzenkohle",
  },

  Berta: {
    label: "Berta",
    description: "5 % Pflanzenkohle",
  },

  Ilse: {
    label: "Ilse",
    description: "Sand",
  },
};

const measurementConfig = {
  temperature: {
    label: "Temperatur",
    unit: "°C",
  },
  soil_moisture: {
    label: "Bodenfeuchtigkeit",
    unit: "%",
  },
  conductivity: {
    label: "Leitfähigkeit",
    unit: "mS/cm",
  },
};

const BED_COLORS = {
  Carla: "#2563eb",
  Berta: "#16a34a",
  Ilse: "#ea580c",
};

const BED_NAMES = ["Carla", "Berta", "Ilse"];

const MEASUREMENTS = [
  {
    key: "temperature",
    label: "Temperatur",
  },
  {
    key: "soil_moisture",
    label: "Bodenfeuchtigkeit",
  },
  {
    key: "conductivity",
    label: "Leitfähigkeit",
  },
];

const ZEITRAEUME = [
  {
    value: "24h",
    label: "Letzte 24 Stunden",
  },
  {
    value: "7d",
    label: "Letzte 7 Tage",
  },
  // {
  //   value: "30d",
  //   label: "Letzte 30 Tage",
  // },
  // {
  //   value: "90d",
  //   label: "Letzte 90 Tage",
  // },
];

function formatDate(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatTooltipDate(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getZeitraumMillis(zeitraum) {
  switch (zeitraum) {
    case "24h":
      return 24 * 60 * 60 * 1000;

    case "7d":
      return 7 * 24 * 60 * 60 * 1000;

    case "30d":
      return 30 * 24 * 60 * 60 * 1000;

    case "90d":
      return 90 * 24 * 60 * 60 * 1000;

    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

/*
 * Baut die Daten für genau einen Messwert und eine Position
 * (oben oder unten) zusammen.
 *
 * Ergebnis beispielsweise:
 *
 * [
 *   {
 *     timestamp: "...",
 *     Carla: 18.2,
 *     Berta: 19.1
 *   }
 * ]
 */
function buildChartData(selectedBeds, measurement, position, zeitraum) {
  const allePunkte = [];

  selectedBeds.forEach((bed) => {
    const messwerte =
      MOCK_DATA[bed]?.[measurement]?.[position] ?? [];

    messwerte.forEach((punkt) => {
      allePunkte.push({
        ...punkt,
        bed,
      });
    });
  });

  if (allePunkte.length === 0) {
    return [];
  }

  const letzterZeitpunkt = Math.max(
    ...allePunkte.map((punkt) => new Date(punkt.timestamp).getTime()),
  );

  const zeitraumMillis = getZeitraumMillis(zeitraum);
  const startZeitpunkt = letzterZeitpunkt - zeitraumMillis;

  const gefiltertePunkte = allePunkte.filter((punkt) => {
    const zeit = new Date(punkt.timestamp).getTime();

    return zeit >= startZeitpunkt && zeit <= letzterZeitpunkt;
  });

  const gruppiert = new Map();

  gefiltertePunkte.forEach((punkt) => {
    if (!gruppiert.has(punkt.timestamp)) {
      gruppiert.set(punkt.timestamp, {
        timestamp: punkt.timestamp,
      });
    }

    gruppiert.get(punkt.timestamp)[punkt.bed] = punkt.value;
  });

  return Array.from(gruppiert.values()).sort(
    (a, b) =>
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime(),
  );
}

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "10px 12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          marginBottom: "6px",
        }}
      >
        {formatTooltipDate(label)}
      </div>

      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{
            color: entry.color,
            marginTop: "3px",
          }}
        >
          {entry.name}: {entry.value} {unit}
        </div>
      ))}
    </div>
  );
}

function HistoryChart({
  title,
  data,
  unit,
  selectedBeds,
  showOutsideTemperature,
}) {
  return (
    <section className="historische-chart">
      <div className="historische-chart-header">
        <h3>{title}</h3>

        <span className="historische-chart-einheit">
          {unit}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="historische-chart-leer">
          <p>
            Für die ausgewählten Beete und den gewählten Zeitraum
            sind keine Daten vorhanden.
          </p>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            height: 360,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 25,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                minTickGap={30}
              />

              <YAxis
                width={55}
                tickFormatter={(value) =>
                  typeof value === "number"
                    ? value.toLocaleString("de-DE")
                    : value
                }
              />

              <Tooltip
                content={
                  <CustomTooltip unit={unit} />
                }
              />

              <Legend />

              {selectedBeds.map((bed) => (
                <Line
                  key={bed}
                  type="monotone"
                  dataKey={bed}
                  name={bed}
                  stroke={BED_COLORS[bed]}
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: BED_COLORS[bed],
                  }}
                  activeDot={{
                    r: 5,
                  }}
                  connectNulls
                />
              ))}

              {showOutsideTemperature && (
                <Line
                  type="monotone"
                  dataKey="outsideTemperature"
                  name="Außentemperatur"
                  stroke="#111827"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
// Wenn tatsächlich eine Verbindung zur DB vorhanden ist
// function getDateRange(zeitraum) {
//   const end = new Date();
//   const start = new Date(end);

//   switch (zeitraum) {
//     case "24h":
//       start.setHours(start.getHours() - 24);
//       break;

//     case "7d":
//       start.setDate(start.getDate() - 7);
//       break;

//     case "30d":
//       start.setDate(start.getDate() - 30);
//       break;

//     case "90d":
//       start.setDate(start.getDate() - 90);
//       break;

//     default:
//       start.setDate(start.getDate() - 7);
//   }

//   return {
//     start,
//     end,
//   };
// }

function getDateRange(zeitraum) {
  return {
    start: new Date("2026-09-25T00:00:00"),
    end: new Date("2026-09-30T23:59:59"),
  };
}

function formatDateForApi(date) {
  return date.toISOString().slice(0, 10);
}

async function fetchWeatherData(zeitraum) {
  const { start, end } = getDateRange(zeitraum);

  const startDate = formatDateForApi(start);
  const endDate = formatDateForApi(end);

  const latitude = 51.4817;
  const longitude = 7.2165;

  const url =
    `https://archive-api.open-meteo.com/v1/archive` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&start_date=${startDate}` +
    `&end_date=${endDate}` +
    `&hourly=temperature_2m` +
    `&models=dwd_icon_seamless` +
    `&timezone=Europe%2FBerlin`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Open-Meteo Anfrage fehlgeschlagen.");
  }

  const data = await response.json();

  return data.hourly.time.map((timestamp, index) => ({
    timestamp,
    value: data.hourly.temperature_2m[index],
  }));
}

function addWeatherData(chartData, weatherData) {
  const weatherMap = new Map();

  weatherData.forEach((point) => {
    weatherMap.set(
      normalizeTimestamp(point.timestamp),
      point.value
    );
  });

  return chartData.map((point) => ({
    ...point,
    outsideTemperature:
      weatherMap.get(
        normalizeTimestamp(point.timestamp)
      ) ?? null,
  }));
}

function normalizeTimestamp(timestamp) {
  const date = new Date(timestamp);

  return date.toISOString().slice(0, 13);
}

export default function HistorischeDaten({
  selectedBeds,
  setSelectedBeds,
  selectedMeasurements,
  setSelectedMeasurements,
  zeitraum,
  setZeitraum,
}) {

  const [weatherData, setWeatherData] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  const toggleBed = (bed) => {
    setSelectedBeds((aktuell) => {
      if (aktuell.includes(bed)) {
        return aktuell.filter((item) => item !== bed);
      }

      return [...aktuell, bed];
    });
  };

  const toggleMeasurement = (measurement) => {
    setSelectedMeasurements((aktuell) => {
      if (aktuell.includes(measurement)) {
        return aktuell.filter((item) => item !== measurement);
      }

      return [...aktuell, measurement];
    });
  };

  useEffect(() => {
  async function loadWeatherData() {
    try {
      setWeatherLoading(true);
      setWeatherError(null);

      const data = await fetchWeatherData(zeitraum);

      setWeatherData(data);
    } catch (error) {
      console.error(error);
      setWeatherError(
        "Die Wetterdaten konnten nicht geladen werden."
      );
    } finally {
      setWeatherLoading(false);
    }
  }

  loadWeatherData();
}, [zeitraum]);

  const chartData = useMemo(() => {
    const ergebnis = {
      oben: {},
      unten: {},
    };

    selectedMeasurements.forEach((measurement) => {
      let oben = buildChartData(
        selectedBeds,
        measurement,
        "oben",
        zeitraum,
      );

      let unten = buildChartData(
        selectedBeds,
        measurement,
        "unten",
        zeitraum,
      );

      if (measurement === "temperature") {
        oben = addWeatherData(oben, weatherData);
        unten = addWeatherData(unten, weatherData);
      }

      ergebnis.oben[measurement] = oben;
      ergebnis.unten[measurement] = unten;
    });

    return ergebnis;
  }, [
    selectedBeds,
    selectedMeasurements,
    zeitraum,
    weatherData,
  ]);

  return (
    <section className="historische-date">
        <div className="historische-übersichtNeu">
          <p>
            Vergleiche historische Messwerte mehrerer Beete
            und Messgrößen.
          </p>
        </div>

      <section className="historische-filter">
        <div className="historische-filter-gruppe">
          <h2>Beete</h2>

          <div className="historische-checkboxen">
            {BED_NAMES.map((bed) => (
              <label
                key={bed}
                className="historische-checkbox"
              >
                <input
                  type="checkbox"
                  checked={selectedBeds.includes(bed)}
                  onChange={() => toggleBed(bed)}
                />

                <span
                  className="historische-checkbox-farbe"
                  style={{
                    backgroundColor: BED_COLORS[bed],
                  }}
                />

                <span>{bed}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="historische-filter-gruppe">
          <h2>Messwerte</h2>

          <div className="historische-checkboxen">
            {MEASUREMENTS.map((measurement) => (
              <label
                key={measurement.key}
                className="historische-checkbox"
              >
                <input
                  type="checkbox"
                  checked={selectedMeasurements.includes(
                    measurement.key,
                  )}
                  onChange={() =>
                    toggleMeasurement(measurement.key)
                  }
                />

                <span>{measurement.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="historische-filter-gruppe">
          <h2>Zeitraum</h2>

          <select
            className="historische-auswahl"
            value={zeitraum}
            onChange={(event) =>
              setZeitraum(event.target.value)
            }
          >
            {ZEITRAEUME.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {selectedBeds.length === 0 ||
      selectedMeasurements.length === 0 ? (
        <div className="historische-leerzustand">
          <h2>Keine Auswahl</h2>

          <p>
            Bitte wähle mindestens ein Beet und einen Messwert
            aus.
          </p>
        </div>
      ) : (
        <>
          <section className="historische-bereich">
            <div className="historische-bereich-header">
              <h2>Oben</h2>
            </div>

            <div className="historische-charts">
              {selectedMeasurements.map((measurement) => {
                const config =
                  measurementConfig[measurement];

                return (
                  <HistoryChart
                    key={`oben-${measurement}`}
                    title={config.label}
                    unit={config.unit}
                    data={
                      chartData.oben[measurement] ?? []
                    }
                    selectedBeds={selectedBeds}
                    showOutsideTemperature={measurement === "temperature"}
                  />
                );
              })}
            </div>
          </section>

          <section className="historische-bereich">
            <div className="historische-bereich-header">
              <h2>Unten</h2>
            </div>

            <div className="historische-charts">
              {selectedMeasurements.map((measurement) => {
                const config =
                  measurementConfig[measurement];

                return (
                  <HistoryChart
                    key={`unten-${measurement}`}
                    title={config.label}
                    unit={config.unit}
                    data={
                      chartData.unten[measurement] ?? []
                    }
                    selectedBeds={selectedBeds}
                    showOutsideTemperature={measurement === "temperature"}
                  />
                );
              })}
            </div>
          </section>
        </>
      )}

      <div class="weather-attribution">
        Externe Wetterdaten (Außentemperatur) von&nbsp;
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
            Open-Meteo.com&nbsp;
        </a>
        •&nbsp;
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
            CC BY 4.0
        </a>
      </div>
    </section>
    
  );
}