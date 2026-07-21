import { mockData } from "../data/mockData";
import { SensorCard } from "./SensorCard";

// SensorOverview component is responsible for displaying an overview of 
// various sensor readings in a grid format. Using the SensorCard.tsx component, 
// it presents information such as soil moisture, temperature, humidity, water level, light intensity, and UV index.

type SensorOverviewProps = {
  temperature: string;
  humidity: string;
};

export function SensorOverview({ temperature, humidity }: SensorOverviewProps) {
  return (
    <section className="sensor-grid">
      {/* bleibt erstmal mock */}
      <SensorCard
        title="Bodenfeuchtigkeit"
        value={`${mockData.sensors.soilMoisture}%`}
        description="Aktueller Feuchtewert im Beet"
      />

      {/* temperatur ist live wenn api wert da ist */}
      <SensorCard
        title="Temperatur"
        value={temperature}
        description="Temperatur am Beet"
      />

      {/* luftfeuchtigkeit ist live wenn loccheck wert da ist */}
      <SensorCard
        title="Luftfeuchtigkeit"
        value={humidity}
        description="Aktuelles Klima im Rooftop-Garden"
      />

      {/* bleibt erstmal mock */}
      <SensorCard
        title="Wasserstand"
        value={`${mockData.sensors.waterLevel}%`}
        description="Füllstand des Wassertanks"
      />

      {/* bleibt erstmal mock */}
      <SensorCard
        title="Licht"
        value={`${mockData.sensors.lightLux}lx`}
        description="Sichtbares Licht am Beet"
      />

      {/* bleibt erstmal mock */}
      <SensorCard
        title="UV-Index"
        value={`${mockData.sensors.uvIndex} UVI`}
        description="UV-Belastung"
      />
    </section>
  );
}