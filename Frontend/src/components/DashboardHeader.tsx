import type { User } from "../types/auth";
import { formatiereZeit } from "../dashboardUtils";

type DashboardHeaderProps = {
  demo: boolean;
  letzterStand: string | null;
  laedt: boolean;
  onNeuLaden: () => void;
  user?: User | null;
  onLogout?: () => void;
  onLoginOeffnen?: () => void;
  onStartseiteOeffnen?: () => void;
};

export function DashboardHeader({
  demo,
  letzterStand,
  laedt,
  onNeuLaden,
  user,
  onLogout,
  onLoginOeffnen,
  onStartseiteOeffnen,
}: DashboardHeaderProps) {
  return (
    <header className="kopf">
      <div className="kopf-text">
        <h1>Smart Gardening</h1>

        <p className="kopf-beschreibung">
          Carla, Berta und Ilse auf einen Blick. Die großen Werte sind immer der
          Durchschnitt aus oberem und unterem Sensor.
        </p>
      </div>

      <div className="kopf-rechts">
        <div className={demo ? "daten-status demo" : "daten-status live"}>
          <span />
          {demo ? "Beispieldaten" : "Live"}
        </div>

        <p>{demo ? "" : `Letzter Stand: ${formatiereZeit(letzterStand)}`}</p>

        <div className="kopf-aktionen">
          <button type="button" onClick={onNeuLaden} disabled={laedt}>
            {laedt ? "wird geladen ..." : "Daten neu laden"}
          </button>

          {user ? (
            <div className="kopf-benutzer">
              <span className="kopf-benutzer-name">👤 {user.name}</span>
              {onLogout && (
                <button
                  type="button"
                  className="btn-abmelden"
                  onClick={onLogout}
                  title="Abmelden"
                >
                  Abmelden
                </button>
              )}
            </div>
          ) : (
            onLoginOeffnen && (
              <button
                type="button"
                className="btn-abmelden"
                onClick={onLoginOeffnen}
              >
                Anmelden
              </button>
            )
          )}

          {onStartseiteOeffnen && (
            <button
              type="button"
              className="btn-abmelden"
              onClick={onStartseiteOeffnen}
            >
              Startseite
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
