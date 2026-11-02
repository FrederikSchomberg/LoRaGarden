
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  historyCache,
  downsampleMultiSeriesData,
  type ChartDataPoint,
} from "../utils/historyCache";

import {
  getWeatherData,
  type WeatherPoint,
} from "../utils/weatherCache";

type HistorischeDatenProps = {
  selectedBeds: string[];
  setSelectedBeds: Dispatch<SetStateAction<string[]>>;
  selectedMeasurements: string[];
  setSelectedMeasurements: Dispatch<SetStateAction<string[]>>;
  zeitraum: string;
  setZeitraum: Dispatch<SetStateAction<string>>;
  bedNames?: string[];
  bedColors?: Record<string, string>;
};

const MEASUREMENT_CONFIG: Record<
  string,
  { label: string; unit: string }
> = {
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
  // battery_voltage: {
  //   label: "Batteriespannung",
  //   unit: "V",
  // },
};

const MOCK_DATA: Record<string, any> = {
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

const BED_COLORS: Record<string, string> = {
  Carla: "#2563eb",
  Berta: "#16a34a",
  Ilse: "#ea580c",
  "Beet 1": "#2563eb",
  "Beet 2": "#16a34a",
  "Beet 3": "#ea580c",
};

// Aliase für Beet 1, 2, 3 hinzufügen, falls Mockdaten abgefragt werden
MOCK_DATA["Beet 1"] = MOCK_DATA.Carla;
MOCK_DATA["Beet 2"] = MOCK_DATA.Berta;
MOCK_DATA["Beet 3"] = MOCK_DATA.Ilse;

const BED_NAMES: string[] = ["Carla", "Berta", "Ilse"];

const MEASUREMENTS: { key: string; label: string }[] = [
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
  { value: "24h", label: "Letzte 24 Stunden" },
  { value: "7d", label: "Letzte 7 Tage" },
  { value: "30d", label: "Letzte 30 Tage" },
  { value: "90d", label: "Letzte 90 Tage" },
  { value: "6mo", label: "Letzte 6 Monate" },
];

function getZeitraumMillis(zeitraum: string): number {
  switch (zeitraum) {
    case "24h":
      return 24 * 60 * 60 * 1000;

    case "7d":
      return 7 * 24 * 60 * 60 * 1000;

    case "30d":
      return 30 * 24 * 60 * 60 * 1000;

    case "90d":
      return 90 * 24 * 60 * 60 * 1000;

    case "6mo":
      return 183 * 24 * 60 * 60 * 1000;

    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    name?: string;
    value?: number | string | null;
    color?: string;
  }>;
  label?: string;
  unit: string;
};

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const validEntries = payload.filter(
    (item) =>
      item.value !== null &&
      item.value !== undefined &&
      item.value !== ""
  );

  if (validEntries.length === 0) {
    return null;
  }

  return (
    <div className="historische-tooltip">
      <strong>
        {label ? formatDate(label) : ""}
      </strong>

      {validEntries.map((item) => (
        <div
          key={String(item.dataKey)}
          style={{ color: item.color }}
        >
          {item.name}:{" "}
          {typeof item.value === "number"
            ? item.value.toLocaleString("de-DE")
            : item.value}{" "}
          {unit}
        </div>
      ))}
    </div>
  );
}

type HistoryChartProps = {
  title: string;
  unit: string;
  data: ChartDataPoint[];
  selectedBeds: string[];
  showOutsideTemperature: boolean;
};

function HistoryChart({
  title,
  unit,
  data,
  selectedBeds,
  showOutsideTemperature,
}: HistoryChartProps) {
  return (
    <section className="historische-chart">
      <header className="historische-chart-header">
        <h3>{title}</h3>

        <span className="historische-chart-einheit">
          {unit}
        </span>
      </header>

      {data.length === 0 ? (
        <div className="historische-chart-leer">
          Für diese Auswahl wurden keine Messwerte im Zeitraum gefunden.
        </div>
      ) : (
        <div style={{ width: "100%", height: 360 }}>
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
                width={60}
                tickFormatter={(value: number) =>
                  value.toLocaleString("de-DE")
                }
              />

              <Tooltip
                content={<CustomTooltip unit={unit} />}
              />

              <Legend />

              {selectedBeds.map((bed) => (
                <Line
                  key={bed}
                  type="linear"
                  dataKey={bed}
                  name={bed}
                  stroke={BED_COLORS[bed] ?? "#64748b"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                  connectNulls={true}
                />
              ))}
              {showOutsideTemperature && (
                <Line
                  type="monotone"
                  dataKey="outsideTemperature"
                  name="Außentemperatur (stündlich)"
                  stroke="#111827"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  connectNulls={true}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeTimestamp(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addWeatherData(
  chartData: ChartDataPoint[],
  weatherData: WeatherPoint[],
  selectedBeds: string[] = []
): ChartDataPoint[] {
  const rows = new Map<string, ChartDataPoint>();

  for (const point of chartData) {
    rows.set(point.timestamp, { ...point, outsideTemperature: null });
  }

  for (const weather of weatherData) {
    const existing = rows.get(weather.timestamp);

    rows.set(weather.timestamp, {
      ...(existing ??
      {
        timestamp: weather.timestamp,
        ...Object.fromEntries(selectedBeds.map((bed) => [bed, null]))
      }),
      outsideTemperature: weather.value,
    } as ChartDataPoint);
  }

  return Array.from(rows.values()).sort((a, b) =>
    new Date(a.timestamp).getTime() -
    new Date(b.timestamp).getTime()
  );
}

export default function HistorischeDaten({
  selectedBeds,
  setSelectedBeds,
  selectedMeasurements,
  setSelectedMeasurements,
  zeitraum,
  setZeitraum,
  bedNames = BED_NAMES,
  bedColors = BED_COLORS,
}: HistorischeDatenProps) {
  const [cacheVersion, setCacheVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );
  const [weatherData, setWeatherData] = useState<WeatherPoint[]>([]);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const { targetStart, targetEnd } = useMemo(() => {
    const end = Date.now();

    return {
      targetStart: end - getZeitraumMillis(zeitraum),
      targetEnd: end,
    };
  }, [zeitraum]);

  useEffect(() => {
    if (
      selectedBeds.length === 0 ||
      selectedMeasurements.length === 0
    ) {
      setLoading(false);
      setErrorMessage(null);
      return;
    }

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setErrorMessage(null);

    historyCache
      .fetchMissingData(
        selectedBeds,
        selectedMeasurements,
        targetStart,
        targetEnd,
        () => {
          setCacheVersion((version) => version + 1);
        },
        controller.signal,
        (error) => {
          console.error(
            "Historische Daten konnten nicht geladen werden:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unbekannter Fehler beim Laden der Historie."
          );
        }
      )
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    selectedBeds,
    selectedMeasurements,
    targetStart,
    targetEnd,
  ]);

  useEffect(() => {
    if (!selectedMeasurements.includes("temperature")) {
      setWeatherData([]);
      setWeatherError(null);
      return;
    }

    const controller = new AbortController();

    setWeatherError(null);

    getWeatherData(
      targetStart,
      targetEnd,
      controller.signal
    )
      .then((data) => {
        setWeatherData(data);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        console.error(
          "Außentemperatur konnte nicht geladen werden:",
          error
        );
        setWeatherError(
          "Die Außentemperatur konnte nicht geladen werden."
        );
      });

    return () => {
      controller.abort();
    };
  }, [selectedMeasurements, targetStart, targetEnd]);

  const chartData = useMemo(() => {
    const result: {
      oben: Record<string, ChartDataPoint[]>;
      unten: Record<string, ChartDataPoint[]>;
    } = {
      oben: {},
      unten: {},
    };

    const seriesKeys = selectedBeds.map((bed) => {
      return bed.charAt(0).toUpperCase() + bed.slice(1);
    });

    for (const measurement of selectedMeasurements) {
      const obenData = historyCache.getChartData(
        selectedBeds,
        measurement,
        "oben",
        targetStart,
        targetEnd
      );

      const untenData = historyCache.getChartData(
        selectedBeds,
        measurement,
        "unten",
        targetStart,
        targetEnd
      );

      result.oben[measurement] = downsampleMultiSeriesData(
        obenData,
        seriesKeys,
        350
      );

      result.unten[measurement] = downsampleMultiSeriesData(
        untenData,
        seriesKeys,
        350
      );
    }

    return result;
  }, [
    selectedBeds,
    selectedMeasurements,
    targetStart,
    targetEnd,
    cacheVersion,
  ]);

  const toggleBed = (bed: string) => {
    setSelectedBeds((current) =>
      current.includes(bed)
        ? current.filter((item) => item !== bed)
        : [...current, bed]
    );
  };

  const toggleMeasurement = (measurement: string) => {
    setSelectedMeasurements((current) =>
      current.includes(measurement)
        ? current.filter((item) => item !== measurement)
        : [...current, measurement]
    );
  };

  return (
    <section className="historische-date">
      <div className="historische-übersichtNeu">
        <p>
          Vergleiche historische Messwerte mehrerer Beete und
          Messgrößen aus der InfluxDB.
        </p>
      </div>

      {/* Filter für Beete, Messwerte und Zeitraum */}
      <section className="historische-filter">
        <div className="historische-filter-gruppe">
          <h2>Beete</h2>

          <div className="historische-checkboxen">
            {bedNames.map((bed) => (
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
                    backgroundColor: bedColors[bed] || BED_COLORS[bed] || "#2563eb",
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
                    measurement.key
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
            onChange={(
              event: ChangeEvent<HTMLSelectElement>
            ) => setZeitraum(event.target.value)}
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

      {/* Lade- und Fehlermeldungen */}
      {loading && (
        <div className="historische-daten-laden" role="status">
          <span className="lade-spinner" aria-hidden="true" />
          <span>Historische Daten werden geladen …</span>
        </div>
      )}

      {errorMessage && (
        <p
          className="historische-fehler"
          role="alert"
        >
          Fehler beim Laden: {errorMessage}
        </p>
      )}

      {weatherError && (
        <p
          className="historische-fehler"
          role="alert"
        >
          Hinweis: {weatherError}
          Die Sensordaten werden weiterhin angezeigt.
        </p>
      )}

      {/* Diagramme oder Hinweis bei fehlender Auswahl */}
      {selectedBeds.length === 0 ||
        selectedMeasurements.length === 0 ? (
        <div className="historische-leerzustand">
          <p>
            <center>Keine Auswahl</center>
            Bitte wähle mindestens ein Beet und einen Messwert aus.
          </p>
        </div>
      ) : (
        <>
          {(["oben", "unten"] as const).map((position) => (
            <section
              className="historische-bereich"
              key={position}
            >
              <div className="historische-bereich-header">
                <h2>
                  {position === "oben" ? "Oben" : "Unten"}
                </h2>
              </div>

              <div className="historische-charts">
                {selectedMeasurements.map((measurement) => {
                  const config = MEASUREMENT_CONFIG[measurement];

                  if (!config) {
                    return null;
                  }

                  const baseData =
                    chartData[position][measurement] ?? [];

                  const showOutsideTemperature =
                    measurement === "temperature" &&
                    weatherData.length > 0;

                  const data = showOutsideTemperature
                    ? addWeatherData(
                      baseData,
                      weatherData,
                      selectedBeds
                    )
                    : baseData;

                  return (
                    <HistoryChart
                      key={`${position}-${measurement}`}
                      title={config.label}
                      unit={config.unit}
                      data={data}
                      selectedBeds={selectedBeds}
                      showOutsideTemperature={showOutsideTemperature}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </>
      )}

      <footer className="weather-attribution">
        Externe Wetterdaten (Außentemperatur) von&nbsp;
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
          Open-Meteo.com&nbsp;
        </a>
        •&nbsp;
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
          CC BY 4.0
        </a>
      </footer>
    </section>
  );
}
