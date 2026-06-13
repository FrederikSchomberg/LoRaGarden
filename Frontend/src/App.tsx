import { useEffect, useState } from "react";
import "./App.css";
import { mockData, mlMockData } from "./data/mockData";
import { WateringDecisionCard } from "./components/WateringDecisionCard";
import { WeatherCard } from "./components/WeatherCard";
import { MlPreviewCard } from "./components/MlPreviewCard";
import { SystemStatusCard } from "./components/SystemStatusCard";
import { DashboardHeader } from "./components/DashboardHeader";
import { SensorOverview } from "./components/SensorOverview";
import { ExtraLiveCards } from "./components/ExtraLiveCards";
import { fetchDashboardData, type DashboardResponse } from "./api";

function App() {
  // hier kommen die daten vom backend rein
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  // checken ob die api kaputt ist
  const [apiError, setApiError] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      // daten vom backend holen
      const data = await fetchDashboardData();

      // daten speichern
      setDashboard(data);

      // alten fehler wegmachen
      setApiError(null);
    } catch {
      // wenn backend nicht geht daten löschen
      setDashboard(null);

      // fehler anzeigen
      setApiError("Backend nicht erreichbar");
    }
  }

  useEffect(() => {

    loadDashboard();

    // alle 5sek seite neu laden
    const interval = window.setInterval(() => {
      loadDashboard();
    }, 5000); // all 5sek aktuell

    // interval wieder stoppen
    return () => window.clearInterval(interval);
  }, []);

  // erstmal mock temperatur nehmen
  let temperature: number | null = mockData.sensors.temperature;

  // wenn live temperatur da ist dann die nehmen
  if (
    dashboard &&
    dashboard.data.s7.temperatur_ist !== null &&
    dashboard.data.s7.temperatur_ist !== undefined
  ) {
    temperature = dashboard.data.s7.temperatur_ist;
  }

  // luftfeuchte (mock)
  const humidity: number | null = mockData.sensors.humidity;

  // letzte messungszeit (mock)
  let lastMeasurement = mockData.lastMeasurement;

  // wenn mqtt zeit da ist dann die nehmen
  if (dashboard && dashboard.mqtt.last_message_at) {
    const formattedMeasurementTime = formatDate(dashboard.mqtt.last_message_at);

    if (formattedMeasurementTime) {
      lastMeasurement = formattedMeasurementTime;
    }
  }

  // mqtt status mit mock starten
  let mqttStatus = mockData.systemStatus.mqtt;

  // wenn api nicht geht oflline setzen
  if (apiError) {
    mqttStatus = "offline";
  } else if (dashboard) {
    mqttStatus = dashboard.mqtt.connected ? "online" : "offline";
  }

  // api status startet mi den mockdaten
  let apiStatus = mockData.systemStatus.api;

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
  if (dashboard && hasValue(dashboard.data.s7.temperatur_soll)) {
    extraLiveCards.push({
      title: "Temperatur Soll",
      value: formatSensorValue(dashboard.data.s7.temperatur_soll, "°C"),
      description: "Livewert aus S7",
    });
  }

  // differenz anzeigen wenn da ist
  if (dashboard && hasValue(dashboard.data.s7.temperatur_differenz)) {
    extraLiveCards.push({
      title: "Temperatur Differenz",
      value: formatSensorValue(dashboard.data.s7.temperatur_differenz, "°C"),
      description: "Livewert aus S7",
    });
  }

  return (
    <main className="app">
      {/* header oben */}
      <DashboardHeader
        beetName={mockData.beetName}
        lastMeasurement={lastMeasurement}
      />

      {/* fehler anzeigen wenn backend nicht geht */}
      {apiError && <div className="api-warning">{apiError}</div>}

      {/* normale sensor karten */}
      <SensorOverview
        temperature={formatSensorValue(temperature, "°C")}
        humidity={formatSensorValue(humidity, "%")}
      />

      {/* extra live karten */}
      <ExtraLiveCards cards={extraLiveCards} />

      {/* unterer dashboard bereich */}
      <section className="content-grid">
        {/* bewässerung ist mock */}
        <WateringDecisionCard
          shouldWater={mockData.wateringDecision.shouldWater}
          title={mockData.wateringDecision.title}
          reason={mockData.wateringDecision.reason}
          mode={mockData.wateringDecision.mode}
          urgency={mockData.wateringDecision.urgency}
          triggeredRule={mockData.wateringDecision.triggeredRule}
          nextCheck={mockData.wateringDecision.nextCheck}
        />

        {/* wetter ist mock */}
        <WeatherCard
          rainProbability={mockData.weather.rainProbability}
          forecast={mockData.weather.forecast}
          outsideTemperature={mockData.weather.outsideTemperature}
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
          influxdb={mockData.systemStatus.influxdb}
          api={apiStatus}
          grafana={mockData.systemStatus.grafana}
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

export default App;