import { useState } from "react";
import { beispielDaten } from "../data/mockData";
import radioTowerIcon from "../assets/radio-tower.svg";

// sensoren aus den bereits vorhandenen beispieldaten übernehmen
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
  const [hinweis, setHinweis] = useState("");

  const auswahlVorbereiten = () => {
    const sensor = sensoren.find((eintrag) => eintrag.id === sensorId);

    // erstmal nur die auswahl anzeigen, noch nichts an mqtt senden
    setHinweis(
      `${sensor?.name ?? sensorId}: ${intervall} Minuten ausgewählt. Noch kein Downlink gesendet.`,
    );
  };

  return (
    <article className="intern-karte intern-sensor-karte">
      <div className="intern-icon">
        <img src={radioTowerIcon} alt="" aria-hidden="true" />
      </div>

      <h3>Sensorsteuerung</h3>

      <p>
        Sendeintervall eines Sensors auswählen und für den Downlink vorbereiten.
      </p>

      <div className="intern-sensor-felder">
        <label htmlFor="intern-sensor">Sensor auswählen</label>

        <select
          id="intern-sensor"
          value={sensorId}
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

      <button type="button" onClick={auswahlVorbereiten}>
        Intervall vorbereiten
      </button>

      {hinweis && (
        <p className="intern-sensor-hinweis" role="status">
          {hinweis}
        </p>
      )}
    </article>
  );
}
