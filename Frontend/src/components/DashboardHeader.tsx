import type { User } from "../types/auth";
import { formatiereZeit } from "../dashboardUtils";
import sproutIcon from "../assets/sprout.svg";

type DashboardHeaderProps = {
  demo: boolean;
  letzterStand: string | null;
  laedt: boolean;
  onNeuLaden: () => void;
  user?: User | null;
  onLogout?: () => void;
  onLoginOeffnen?: () => void;
  onStartseiteOeffnen?: () => void;
  onInternOeffnen?: () => void;
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
  onInternOeffnen,
}: DashboardHeaderProps) {
  return (
    <header className="kopf">
      <div className="kopf-text">
        <h1 className="kopf-marke">
          <img src={sproutIcon} alt="" aria-hidden="true" />
          <span>Dashboard</span>
        </h1>

        <p className="kopf-beschreibung">
          Carla, Berta und Ilse auf einen Blick. Die großen Werte sind immer der
          Durchschnitt aus oberem und unterem Sensor.
        </p>
      </div>

      <div className="kopf-rechts">
        <div className="kopf-status">
          <button type="button" onClick={onNeuLaden} disabled={laedt}>
            {laedt ? "wird geladen ..." : "Daten neu laden"}
          </button>

          <div className={demo ? "daten-status demo" : "daten-status live"}>
            <span />
            {demo ? "Beispieldaten" : "Live"}
          </div>
        </div>

        <p>{demo ? "" : `Letzter Stand: ${formatiereZeit(letzterStand)}`}</p>

        <div className="kopf-aktionen">
          {user ? (
            <div className="kopf-benutzer">
              <button
                type="button"
                className="kopf-benutzer-name"
                onClick={onInternOeffnen}
                title="Zur internen Seite"
                aria-label={`Angemeldet als ${user.name} – Zur internen Seite wechseln`}
              >
                👤 {user.name}
              </button>

              {onLogout && (
                <button
                  type="button"
                  className="btn-abmelden"
                  onClick={onLogout}
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
