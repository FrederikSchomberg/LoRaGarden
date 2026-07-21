import { useEffect, useState } from "react";
import "./App.css";
import { mockBeds, mlMockData } from "./data/mockData";
import { WateringDecisionCard } from "./components/WateringDecisionCard";
import { WeatherCard } from "./components/WeatherCard";
import { MlPreviewCard } from "./components/MlPreviewCard";
import { SystemStatusCard } from "./components/SystemStatusCard";
import { DashboardHeader } from "./components/DashboardHeader";
import { SensorOverview } from "./components/SensorOverview";
import { ExtraLiveCards } from "./components/ExtraLiveCards";
import { fetchDashboardData, type DashboardResponse, type BedName } from "./api";
import { BarNavigator } from "./components/BarNavigator";

function App() {
  // hier kommen die daten vom backend rein
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  // checken ob die api kaputt ist
  const [apiError, setApiError] = useState<string | null>(null);

  // welcher tab ist ausgewählt
  const [selectedBed, setSelectedBed] = useState<BedName>("Alle");

  async function loadDashboard() {
    try {
      const data = await fetchDashboardData(selectedBed);

      setDashboard(data);
      setApiError(null);
    } catch {
      setDashboard(null);
      setApiError("Backend nicht erreichbar");
    }
  }

  useEffect(() => {

    loadDashboard();

    const interval = window.setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => window.clearInterval(interval);

  }, [selectedBed]);

  const selectedBedKey: Exclude<BedName, "Alle"> | null =
    selectedBed === "Alle" ? null : selectedBed;
  const selectedData = selectedBedKey
    ? getSelectedBedData(dashboard, selectedBedKey)
    : null;
  
  const mockBedData =
  selectedBed === "Alle"
    ? mockBeds.Beet1
    : mockBeds[selectedBed];

  // erstmal mock temperatur nehmen
  let temperature: number | null = selectedData?.temperatur_ist ?? mockBedData.sensors.temperature;

  // wenn live temperatur da ist dann die nehmen
  if (
    dashboard &&
    selectedBedKey &&
    selectedData?.temperatur_ist != null
  ) {
    temperature = selectedData.temperatur_ist;
  }

  // luftfeuchte (mock)
  const humidity: number | null = mockBedData.sensors.humidity;

  // letzte messungszeit (mock)
  let lastMeasurement = selectedData?.updated_at ?? mockBedData.lastMeasurement;

  // wenn mqtt zeit da ist dann die nehmen
  if (dashboard && dashboard.mqtt.last_message_at) {
    const formattedMeasurementTime = formatDate(dashboard.mqtt.last_message_at);

    if (formattedMeasurementTime) {
      lastMeasurement = formattedMeasurementTime;
    }
  }

  // mqtt status mit mock starten
  let mqttStatus = mockBedData.systemStatus.mqtt;

  // wenn api nicht geht oflline setzen
  if (apiError) {
    mqttStatus = "offline";
  } else if (dashboard) {
    mqttStatus = dashboard.mqtt.connected ? "online" : "offline";
  }

  // api status startet mi den mockdaten
  let apiStatus = mockBedData.systemStatus.api;

  // wenn api fehler hat dann offline setzen
  if (apiError) {
    apiStatus = "offline";
  } else if (dashboard) {
    apiStatus = "online";
  }

  // hier kommen die extra live karten rein
  const extraLiveCards: Array<{
    title: string;
    value: string;
    description: string;
  }> = [];

  // soll temperatur anzeigen wenn wert da ist
  if (
    selectedData &&
    hasValue(selectedData.temperatur_soll)
  ) {
    extraLiveCards.push({
      title: "Temperatur Soll",
      value: formatSensorValue(selectedData.temperatur_soll, "°C"),
      description: "Livewert aus S7",
    });
  }

  // differenz anzeigen wenn da ist
  if (
    selectedData &&
    hasValue(selectedData.temperatur_differenz)
  ) {
    extraLiveCards.push({
      title: "Temperatur Differenz",
      value: formatSensorValue(selectedData.temperatur_differenz, "°C"),
      description: "Livewert aus S7",
    });
  }

  return (
    <main className="app">
      {/* tab bar */}
      <BarNavigator
          activeTab={selectedBed}
          onTabChange={setSelectedBed}
      />

      {/* header oben */}
      <DashboardHeader
        beetName={mockBedData.beetName}
        lastMeasurement={lastMeasurement}
      />

      {/* fehler anzeigen wenn backend nicht geht */}
      {apiError && <div className="api-warning">{apiError}</div>}

      {/* normale sensor karten */}
      <SensorOverview
        temperature={formatSensorValue(temperature, "°C")}
        humidity={formatSensorValue(humidity, "%")}

        soilMoisture={mockBedData.sensors.soilMoisture}
        waterLevel={mockBedData.sensors.waterLevel}
        lightLux={mockBedData.sensors.lightLux}
        uvIndex={mockBedData.sensors.uvIndex}
      />

      {/* extra live karten */}
      <ExtraLiveCards cards={extraLiveCards} />

      {/* unterer dashboard bereich */}
      <section className="content-grid">
        {/* bewässerung ist mock */}
        <WateringDecisionCard
          shouldWater={mockBedData.wateringDecision.shouldWater}
          title={mockBedData.wateringDecision.title}
          reason={mockBedData.wateringDecision.reason}
          mode={mockBedData.wateringDecision.mode}
          urgency={mockBedData.wateringDecision.urgency}
          triggeredRule={mockBedData.wateringDecision.triggeredRule}
          nextCheck={mockBedData.wateringDecision.nextCheck}
        />

        {/* wetter ist mock */}
        <WeatherCard
          rainProbability={mockBedData.weather.rainProbability}
          forecast={mockBedData.weather.forecast}
          outsideTemperature={mockBedData.weather.outsideTemperature}
        />

        {/* ml ist mock */}
        <MlPreviewCard
          title={mlMockData.title}
          reason={mlMockData.reason}
          mode={mlMockData.mode}
          confidence={mlMockData.confidence}
          soilMoistureIn2Hours={mlMockData.prediction.soilMoistureIn2Hours}
          mainFactor={mlMockData.prediction.mainFactor}
        />

        {/* mqtt und api sind live rest mock */}
        <SystemStatusCard
          mqtt={mqttStatus}
          influxdb={mockBedData.systemStatus.influxdb}
          api={apiStatus}
          grafana={mockBedData.systemStatus.grafana}
          mqttIsLive={true}
          apiIsLive={true}
        />
      </section>
    </main>
  );
}

// gucken ob wert da ist
function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

// wert mit einheit
function formatSensorValue(value: unknown, unit: string) {
  const formattedValue = formatNumber(value);

  if (formattedValue === "-") {
    return "-";
  }

  return `${formattedValue}${unit}`;
}

// zahl schöner
function formatNumber(value: unknown) {
  if (!hasValue(value)) {
    return "-";
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return "-";
  }

  return numberValue.toFixed(2);
}

// macht backend zeit lesbar
function formatDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getSelectedBedData(
  dashboard: DashboardResponse | null,
  bed: Exclude<BedName, "Alle">
) {

  if (!dashboard) {
    return null;
  }

  return dashboard.data[bed] ?? null;
}
export default App;