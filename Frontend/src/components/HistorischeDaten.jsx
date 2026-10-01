import { useMemo, useState } from "react";
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


/*
 * =========================================================
 * MESSWERT-KONFIGURATION
 * =========================================================
 */

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


/*
 * =========================================================
 * FARBEN FÜR DIE BEETE
 * =========================================================
 */

const beetColors = {
  Carla: "#2563eb",
  Berta: "#16a34a",
  Ilse: "#ea580c",
};


/*
 * =========================================================
 * HILFSFUNKTION:
 * MOCK-DATEN FÜR RECHARTS AUFBEREITEN
 * =========================================================
 *
 * Recharts erwartet für mehrere Linien beispielsweise:
 *
 * [
 *   {
 *     timestamp: "...",
 *     Carla: 21.4,
 *     Berta: 20.8,
 *     Ilse: 21.1
 *   }
 * ]
 */

function buildChartData({
  selectedBeds,
  measurement,
  position,
}) {
  const byTimestamp = {};

  selectedBeds.forEach((bed) => {
    const values =
      MOCK_DATA[bed]?.[measurement]?.[position] ?? [];

    values.forEach((point) => {
      if (!byTimestamp[point.timestamp]) {
        byTimestamp[point.timestamp] = {
          timestamp: point.timestamp,
        };
      }

      byTimestamp[point.timestamp][bed] = point.value;
    });
  });

  return Object.values(byTimestamp).sort(
    (a, b) =>
      new Date(a.timestamp) -
      new Date(b.timestamp)
  );
}


/*
 * =========================================================
 * ZEITRAUM FILTERN
 * =========================================================
 */

function filterByTimeRange(data, zeitraum) {
  if (!data || data.length === 0) {
    return [];
  }

  /*
   * Die Mock-Daten gehen aktuell nur über wenige Tage.
   * Für die Mock-Daten reicht es deshalb, anhand des
   * vorhandenen Datenbereichs zu filtern.
   */

  const latestTimestamp = Math.max(
    ...data.map((point) =>
      new Date(point.timestamp).getTime()
    )
  );

  let milliseconds;

  switch (zeitraum) {
    case "24h":
      milliseconds = 24 * 60 * 60 * 1000;
      break;

    case "7d":
      milliseconds = 7 * 24 * 60 * 60 * 1000;
      break;

    case "30d":
      milliseconds = 30 * 24 * 60 * 60 * 1000;
      break;

    case "90d":
      milliseconds = 90 * 24 * 60 * 60 * 1000;
      break;

    default:
      return data;
  }

  const minimumTimestamp =
    latestTimestamp - milliseconds;

  return data.filter(
    (point) =>
      new Date(point.timestamp).getTime() >=
      minimumTimestamp
  );
}


/*
 * =========================================================
 * DATUM FORMATIEREN
 * =========================================================
 */

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
    }
  );
}


/*
 * =========================================================
 * TOOLTIP
 * =========================================================
 */

function HistoryTooltip({
  active,
  payload,
  label,
  unit,
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      className="history-tooltip"
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "10px 12px",
        boxShadow:
          "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          marginBottom: "6px",
        }}
      >
        {new Date(label).toLocaleString("de-DE")}
      </div>

      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            marginTop: "3px",
          }}
        >
          <span>
            {entry.name}
          </span>

          <strong>
            {entry.value} {unit}
          </strong>
        </div>
      ))}
    </div>
  );
}


/*
 * =========================================================
 * DIAGRAMM
 * =========================================================
 */

function HistoryChart({
  title,
  data,
  unit,
  selectedBeds,
}) {
  const hasData = data && data.length > 0;

  return (
    <div className="history-chart-card">
      <div className="history-chart-header">
        <div>
          <h3>{title}</h3>

          {hasData && (
            <span className="history-chart-period">
              {formatDate(data[0].timestamp)}
              {" – "}
              {formatDate(
                data[data.length - 1].timestamp
              )}
            </span>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="history-chart-empty">
          <p>
            Für die ausgewählten Beete sind keine
            Daten vorhanden.
          </p>
        </div>
      ) : (
        <div
          className="history-chart-wrapper"
          style={{
            width: "100%",
            height: 340,
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="chart-grid"
              />

              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                minTickGap={25}
              />

              <YAxis
                tick={{ fontSize: 12 }}
                width={55}
                label={{
                  value: unit,
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                  },
                }}
              />

              <Tooltip
                content={
                  <HistoryTooltip unit={unit} />
                }
              />

              <Legend />

              {selectedBeds.map((bed) => (
                <Line
                  key={bed}
                  type="monotone"
                  dataKey={bed}
                  name={beetConfig[bed]?.label ?? bed}
                  stroke={
                    beetColors[bed] ?? "#64748b"
                  }
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}


/*
 * =========================================================
 * HAUPTKOMPONENTE
 * =========================================================
 */

export default function HistorischeDaten() {
  /*
   * -------------------------------------------------------
   * AUSGEWÄHLTE BEETE
   * -------------------------------------------------------
   */

  const [selectedBeds, setSelectedBeds] =
    useState(["Carla"]);


  /*
   * -------------------------------------------------------
   * AUSGEWÄHLTE MESSWERTE
   * -------------------------------------------------------
   */

  const [
    selectedMeasurements,
    setSelectedMeasurements,
  ] = useState(["temperature"]);


  /*
   * -------------------------------------------------------
   * ZEITRAUM
   * -------------------------------------------------------
   */

  const [zeitraum, setZeitraum] =
    useState("7d");


  /*
   * -------------------------------------------------------
   * BEET AUS-/ABWÄHLEN
   * -------------------------------------------------------
   */

  function toggleBed(bed) {
    setSelectedBeds((current) => {
      if (current.includes(bed)) {
        return current.filter(
          (item) => item !== bed
        );
      }

      return [...current, bed];
    });
  }


  /*
   * -------------------------------------------------------
   * MESSWERT AUS-/ABWÄHLEN
   * -------------------------------------------------------
   */

  function toggleMeasurement(measurement) {
    setSelectedMeasurements((current) => {
      if (current.includes(measurement)) {
        return current.filter(
          (item) => item !== measurement
        );
      }

      return [...current, measurement];
    });
  }


  /*
   * -------------------------------------------------------
   * DIAGRAMMDATEN ERZEUGEN
   * -------------------------------------------------------
   *
   * Für jeden Messwert und jede Position wird aus den
   * Mock-Daten ein eigenes Recharts-Dataset erstellt.
   */

  const chartData = useMemo(() => {
    const result = {};

    ["oben", "unten"].forEach((position) => {
      result[position] = {};

      selectedMeasurements.forEach(
        (measurement) => {
          const data = buildChartData({
            selectedBeds,
            measurement,
            position,
          });

          result[position][measurement] =
            filterByTimeRange(
              data,
              zeitraum
            );
        }
      );
    });

    return result;
  }, [
    selectedBeds,
    selectedMeasurements,
    zeitraum,
  ]);


  /*
   * -------------------------------------------------------
   * RENDER
   * -------------------------------------------------------
   */

  return (
    <section className="historische-daten">

      {/* ================================================= */}
      {/* ÜBERSCHRIFT                                      */}
      {/* ================================================= */}

      <div className="historische-übersichtNeu">
        <p>
          Historischer Verlauf der Messwerte
          für die ausgewählten Beete.
        </p>
      </div>


      {/* ================================================= */}
      {/* AUSWAHL                                          */}
      {/* ================================================= */}

      <div className="historische-kontrollen">

        {/* ----------------------------------------------- */}
        {/* BEETE                                           */}
        {/* ----------------------------------------------- */}

        <div className="historische-auswahl">
          <label>
            Beete
          </label>

          <div className="history-checkbox-group">

            {Object.entries(beetConfig).map(
              ([bed, config]) => (
                <label
                  key={bed}
                  className="history-checkbox"
                >
                  <input
                    type="checkbox"
                    checked={selectedBeds.includes(
                      bed
                    )}
                    onChange={() =>
                      toggleBed(bed)
                    }
                  />

                  <span>
                    {config.label}
                  </span>
                </label>
              )
            )}

          </div>
        </div>


        {/* ----------------------------------------------- */}
        {/* MESSWERTE                                       */}
        {/* ----------------------------------------------- */}

        <div className="historische-auswahl">
          <label>
            Messwerte
          </label>

          <div className="history-checkbox-group">

            {Object.entries(
              measurementConfig
            ).map(
              ([measurement, config]) => (
                <label
                  key={measurement}
                  className="history-checkbox"
                >
                  <input
                    type="checkbox"
                    checked={selectedMeasurements.includes(
                      measurement
                    )}
                    onChange={() =>
                      toggleMeasurement(
                        measurement
                      )
                    }
                  />

                  <span>
                    {config.label}
                  </span>
                </label>
              )
            )}

          </div>
        </div>


        {/* ----------------------------------------------- */}
        {/* ZEITRAUM                                        */}
        {/* ----------------------------------------------- */}

        <div className="historische-auswahl">
          <label
            htmlFor="history-zeitraum"
          >
            Zeitraum
          </label>

          <select
            id="history-zeitraum"
            value={zeitraum}
            onChange={(event) =>
              setZeitraum(
                event.target.value
              )
            }
          >
            <option value="24h">
              Letzte 24 Stunden
            </option>

            <option value="7d">
              Letzte 7 Tage
            </option>

            <option value="30d">
              Letzte 30 Tage
            </option>

            <option value="90d">
              Letzte 3 Monate
            </option>
          </select>
        </div>

      </div>


      {/* ================================================= */}
      {/* KEINE AUSWAHL                                    */}
      {/* ================================================= */}

      {selectedBeds.length === 0 ||
      selectedMeasurements.length === 0 ? (
        <div className="history-empty-selection">
          <h3>
            Keine Auswahl
          </h3>

          <p>
            Bitte mindestens ein Beet und einen
            Messwert auswählen.
          </p>
        </div>
      ) : (
        <>
          {/* ============================================= */}
          {/* OBEN                                          */}
          {/* ============================================= */}

          <section className="history-position-section">

            <div className="history-position-header">
              <h2>Oben</h2>
            </div>

            <div className="history-charts">

              {selectedMeasurements.map(
                (measurement) => {
                  const config =
                    measurementConfig[
                      measurement
                    ];

                  return (
                    <HistoryChart
                      key={`oben-${measurement}`}
                      title={
                        config.label
                      }
                      data={
                        chartData.oben[
                          measurement
                        ]
                      }
                      unit={config.unit}
                      selectedBeds={
                        selectedBeds
                      }
                    />
                  );
                }
              )}

            </div>
          </section>


          {/* ============================================= */}
          {/* UNTEN                                         */}
          {/* ============================================= */}

          <section className="history-position-section">

            <div className="history-position-header">
              <h2>Unten</h2>
            </div>

            <div className="history-charts">

              {selectedMeasurements.map(
                (measurement) => {
                  const config =
                    measurementConfig[
                      measurement
                    ];

                  return (
                    <HistoryChart
                      key={`unten-${measurement}`}
                      title={
                        config.label
                      }
                      data={
                        chartData.unten[
                          measurement
                        ]
                      }
                      unit={config.unit}
                      selectedBeds={
                        selectedBeds
                      }
                    />
                  );
                }
              )}

            </div>
          </section>
        </>
      )}

    </section>
  );
}