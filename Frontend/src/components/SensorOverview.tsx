import { SensorCard } from "./SensorCard";

type SensorOverviewProps = {
  temperature: string;
  humidity: string;

  soilMoisture: number;
  waterLevel: number;
  lightLux: number;
  uvIndex: number;
};


export function SensorOverview({
  temperature,
  humidity,
  soilMoisture,
  waterLevel,
  lightLux,
  uvIndex,
}: SensorOverviewProps) {

  return (
    <section className="sensor-grid">

      <SensorCard
        title="Bodenfeuchtigkeit"
        value={`${soilMoisture}%`}
        description="Aktueller Feuchtewert im Beet"
      />


      <SensorCard
        title="Temperatur"
        value={temperature}
        description="Temperatur am Beet"
      />


      <SensorCard
        title="Luftfeuchtigkeit"
        value={humidity}
        description="Aktuelles Klima im Rooftop-Garden"
      />


      <SensorCard
        title="Wasserstand"
        value={`${waterLevel}%`}
        description="Füllstand des Wassertanks"
      />


      <SensorCard
        title="Licht"
        value={`${lightLux}lx`}
        description="Sichtbares Licht am Beet"
      />


      <SensorCard
        title="UV-Index"
        value={`${uvIndex} UVI`}
        description="UV-Belastung"
      />

    </section>
  );
}