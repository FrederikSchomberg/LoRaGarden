import {
  beetName,
  findeSensor,
  formatiereZahl,
  mittelwert,
} from "../dashboardUtils";
import type { BeetDaten, SensorPosition } from "../types/dashboard";

type BedCardProps = {
  beet: BeetDaten;
  demo: boolean;
};

const positionen: SensorPosition[] = ["oben", "unten"];

export function BedCard({ beet, demo }: BedCardProps) {
  const feuchte = mittelwert(beet, "soil_moisture");
  const temperatur = mittelwert(beet, "soil_temperature");
  const ec = mittelwert(beet, "soil_ec");
  const batterie = mittelwert(beet, "battery_voltage");

  const balken =
    feuchte === null ? 0 : Math.min(100, Math.max(0, feuchte));

  return (
    <article className="beet-karte">
      <div className="beet-kopf">
        <div>
          <p className="karten-label">Beet</p>
          <h2>{beetName(beet)}</h2>
        </div>

        <span>{beet.substrate}</span>
      </div>

      <div className="feuchte-block">
        <p>Bodenfeuchtigkeit</p>
        <strong>{formatiereZahl(feuchte, " %", 1)}</strong>

        <div className="feuchte-balken">
          <span style={{ width: `${balken}%` }} />
        </div>
      </div>

      <div className="mini-werte">
        <div>
          <span>Temperatur</span>
          <strong>{formatiereZahl(temperatur, " °C", 1)}</strong>
        </div>

        <div>
          <span>Boden-EC</span>
          <strong>{formatiereZahl(ec, "", 0)}</strong>
        </div>

        <div>
          <span>Batterie</span>
          <strong>{formatiereZahl(batterie, " V", 2)}</strong>
        </div>
      </div>

      <div className="messstellen">
        {positionen.map((position) => {
          const sensor = findeSensor(beet, position);

          return (
            <div className="messstelle" key={position}>
              <div>
                <strong>{position}</strong>
                <code>{sensor ? sensor.sensor_id : "kein Sensor"}</code>
              </div>

              <small>
                {demo
                  ? "Beispieldaten"
                  : new Date().toLocaleString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
              </small>
            </div>
          );
        })}
      </div>
    </article>
  );
}