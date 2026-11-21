import { useState } from "react";
import { beispielDaten } from "../data/mockData";
import { setzeSensorIntervall } from "../api";
import radioTowerIcon from "../assets/radio-tower.svg";

const sensoren = beispielDaten.beds.flatMap((beet) =>
  beet.sensors.map((sensor) => ({
    id: sensor.sensor_id,
    name: `${sensor.bed} ${sensor.bed_position}`,
  })),
);

const intervalle = [5, 10, 15, 20, 25, 30];

export function SensorIntervalControl() {
  const [sensorId, setSensorId] = useState("0060294A");
  const [intervall, setIntervall] = useState(5);
  const [sendet, setSendet] = useState(false);
  const [hinweis, setHinweis] = useState("");
  const [fehler, setFehler] = useState(false);

  const intervallSenden = async () => {
    const sensor = sensoren.find((eintrag) => eintrag.id === sensorId);
    const name = sensor?.name ?? sensorId;

    if (
      !window.confirm(
        `${name}: Sendeintervall auf ${intervall} Minuten ändern?`,
      )
    ) {
      return;
    }

    setSendet(true);
    setHinweis("");
    setFehler(false);

    try {
      await setzeSensorIntervall(sensorId, intervall);

      setHinweis(
        `Downlink für ${name} (${intervall} Min.) an MQTT übergeben. ` +
          "Bitte in Grafana prüfen, ob der Sensor das neue Intervall übernommen hat.",
      );
    } catch (error) {
      setFehler(true);

      setHinweis(
        error instanceof Error ? error.message : "Downlink fehlgeschlagen.",
      );
    } finally {
      setSendet(false);
    }
  };

  return (
    <article className="intern-karte intern-sensor-karte">
      <div className="intern-icon">
        <img src={radioTowerIcon} alt="" aria-hidden="true" />
      </div>

      <h3>Sensorsteuerung</h3>

      <p>Sendeintervall eines Sensors per LoRaWAN-Downlink ändern.</p>

      <div className="intern-sensor-felder">
        <label htmlFor="intern-sensor">Sensor auswählen</label>

        <select
          id="intern-sensor"
          value={sensorId}
          disabled={sendet}
          onChange={(e) => {
            setSensorId(e.target.value);
            setHinweis("");
          }}
        >
          {sensoren.map((sensor) => (
            <option key={sensor.id} value={sensor.id}>
              {sensor.name} ({sensor.id})
            </option>
          ))}
        </select>

        <label htmlFor="intern-intervall">Sendeintervall</label>

        <select
          id="intern-intervall"
          value={intervall}
          disabled={sendet}
          onChange={(e) => {
            setIntervall(Number(e.target.value));
            setHinweis("");
          }}
        >
          {intervalle.map((minuten) => (
            <option key={minuten} value={minuten}>
              {minuten} Minuten
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        disabled={sendet}
        onClick={() => void intervallSenden()}
      >
        {sendet ? "Downlink wird gesendet..." : "Intervall ändern"}
      </button>

      {hinweis && (
        <p
          className={`intern-sensor-hinweis${
            fehler ? " intern-sensor-fehler" : ""
          }`}
          role="status"
        >
          {hinweis}
        </p>
      )}
    </article>
  );
}
