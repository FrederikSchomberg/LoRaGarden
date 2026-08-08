import { formatiereZeit } from "../dashboardUtils";

type DashboardHeaderProps = {
  demo: boolean;
  letzterStand: string | null;
  laedt: boolean;
  onNeuLaden: () => void;
};

export function DashboardHeader({
  demo,
  letzterStand,
  laedt,
  onNeuLaden,
}: DashboardHeaderProps) {
  return (
    <header className="kopf">
      <div className="kopf-text">
        
        <h1>Smart Gardening</h1>

        <p className="kopf-beschreibung">
          Carla, Berta und Ilse auf einen Blick. Die großen Werte sind immer
          der Durchschnitt aus oberem und unterem Sensor.
        </p>
      </div>

      <div className="kopf-rechts">
        <div className={demo ? "daten-status demo" : "daten-status live"}>
          <span />
          {demo ? "Beispieldaten" : "Live"}
        </div>

        <p>
          {demo
            ? ""
            : `Letzter Stand: ${formatiereZeit(letzterStand)}`}
        </p>

        <button type="button" onClick={onNeuLaden} disabled={laedt}>
          {laedt ? "wird geladen ..." : "Daten neu laden"}
        </button>
      </div>
    </header>
  );
}