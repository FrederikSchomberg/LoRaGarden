import { useState } from "react";

type Beet = "Carla" | "Berta" | "Ilse";
type Messwert = "temperature" | "soil_moisture" | "conductivity";
type Zeitraum = "24h" | "7d" | "30d" | "90d";

type PanelIds = {
  [beet in Beet]: {
    [messwert in Messwert]: {
      oben: number;
      unten: number;
    };
  };
};

const panelIds : PanelIds = {
  Carla: {
    temperature: {
      oben: 1,
      unten: 2,
    },
    soil_moisture: {
      oben: 3,
      unten: 4,
    },
    conductivity: {
      oben: 5,
      unten: 6,
    },
  },

  Berta: {
    temperature: {
      oben: 7,
      unten: 8,
    },
    soil_moisture: {
      oben: 9,
      unten: 10,
    },
    conductivity: {
      oben: 11,
      unten: 12,
    },
  },

  Ilse: {
    temperature: {
      oben: 13,
      unten: 14,
    },
    soil_moisture: {
      oben: 15,
      unten: 16,
    },
    conductivity: {
      oben: 17,
      unten: 18,
    },
  },
};

function GrafanaHistorischeDaten() {
  const [messwert, setMesswert] = useState<Messwert>("temperature");
  const [beet, setBeet] = useState<Beet>("Carla");
  const [zeitraum, setZeitraum] = useState<Zeitraum>("7d");

  const grafanaUrl = import.meta.env.VITE_GRAFANA_URL;
  const dashboardId = import.meta.env.VITE_GRAFANA_DASHBOARD_ID;
  const dashboardSlug = import.meta.env.VITE_GRAFANA_DASHBOARD_SLUG;

  const panels = panelIds[beet][messwert];

  const createPanelUrl = (panelId: number) => {
    if (!grafanaUrl || !dashboardId || !dashboardSlug) {
      return "";
    }

    return (
      `${grafanaUrl}/d-solo/${dashboardId}/${dashboardSlug}` +
      `?orgId=1` +
      `&panelId=${panelId}` +
      `&from=now-${zeitraum}` +
      `&to=now` +
      `&timezone=browser`
    );
  };

  return (
    <section className="historische-daten">
      <div className="historische-kontrollen">
        <div className="historische-auswahl">
          <label htmlFor="messwert">Messwert</label>

          <select
            id="messwert"
            value={messwert}
            onChange={(event) => setMesswert(event.target.value)}
          >
            <option value="temperature">Temperatur</option>
            <option value="soil_moisture">Bodenfeuchtigkeit</option>
            <option value="conductivity">Leitwert</option>
          </select>
        </div>

        <div className="historische-auswahl">
          <label htmlFor="beet">Beet</label>

          <select
            id="beet"
            value={beet}
            onChange={(event) => setBeet(event.target.value)}
          >
            <option value="Carla">Carla 10 % Pflanzenkohle</option>
            <option value="Berta">Berta 5 % Pflanzenkohle</option>
            <option value="Ilse">Ilse Sand</option>
          </select>
        </div>

        <div className="historische-auswahl">
          <label htmlFor="zeitraum">Zeitraum</label>

          <select
            id="zeitraum"
            value={zeitraum}
            onChange={(event) => setZeitraum(event.target.value)}
          >
            <option value="24h">Letzte 24 Stunden</option>
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="90d">Letzte 3 Monate</option>
          </select>
        </div>
      </div>

      {panels ? (
        <div className="grafana-panels">
          <div className="grafana-panel">
            <h3>Oben</h3>

            <iframe
              src={createPanelUrl(panels.oben)}
              title={`${beet} ${messwert} Oben`}
              className="grafana-iframe"
            />
          </div>

          <div className="grafana-panel">
            <h3>Unten</h3>

            <iframe
              src={createPanelUrl(panels.unten)}
              title={`${beet} ${messwert} Unten`}
              className="grafana-iframe"
            />
          </div>
        </div>
      ) : (
        <p>Keine Grafana-Daten verfügbar.</p>
      )}
    </section>
  );
}

export { GrafanaHistorischeDaten };