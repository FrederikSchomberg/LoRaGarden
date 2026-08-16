import { useState } from "react";

function GrafanaHistorischeDaten() {
  const [messwert, setMesswert] = useState("temperature");
  const [beet, setBeet] = useState("Beet 1");
  const [zeitraum, setZeitraum] = useState("7d");
  const [grafanaGeladen, setGrafanaGeladen] = useState(false);

  /*
   * Hier später die URL deines Grafana-Dashboards eintragen.
   *
   * Beispiel:
   * http://localhost:3000/d/abc123/loragarden
   */
  const grafanaBasisUrl = "";

  const grafanaUrl = grafanaBasisUrl
    ? `${grafanaBasisUrl}?orgId=1&kiosk` +
      `&var-messwert=${encodeURIComponent(messwert)}` +
      `&var-beet=${encodeURIComponent(beet)}` +
      `&from=now-${zeitraum}` +
      `&to=now`
    : "";

  return (
    <section className="historische-daten">
      <div className="historische-kontrollen">
        <div className="historische-auswahl">
          <label htmlFor="messwert">Messwert</label>

          <select
            id="messwert"
            value={messwert}
            onChange={(event) => {
              setMesswert(event.target.value);
              setGrafanaGeladen(false);
            }}
          >
            <option value="temperature">Temperatur</option>
            <option value="humidity">Luftfeuchtigkeit</option>
            <option value="soil_moisture">Bodenfeuchtigkeit</option>
          </select>
        </div>

        <div className="historische-auswahl">
          <label htmlFor="beet">Beet</label>

          <select
            id="beet"
            value={beet}
            onChange={(event) => {
              setBeet(event.target.value);
              setGrafanaGeladen(false);
            }}
          >
            <option value="Beet 1">Beet 1</option>
            <option value="Beet 2">Beet 2</option>
            <option value="Beet 3">Beet 3</option>
          </select>
        </div>

        <div className="historische-auswahl">
          <label htmlFor="zeitraum">Zeitraum</label>

          <select
            id="zeitraum"
            value={zeitraum}
            onChange={(event) => {
              setZeitraum(event.target.value);
              setGrafanaGeladen(false);
            }}
          >
            <option value="24h">Letzte 24 Stunden</option>
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="90d">Letzte 3 Monate</option>
          </select>
        </div>
      </div>

      {grafanaBasisUrl && grafanaUrl ? (
        <>
          {!grafanaGeladen && (
            <p>
              Hier werden später die historischen Sensordaten über Grafana
              angezeigt.
            </p>
          )}
          <iframe
            src={grafanaUrl}
            title="Historische Sensordaten"
            className="grafana-iframe"
            onLoad={() => setGrafanaGeladen(true)}
          />
        </>
      ) : (
        <p>
          Hier werden später die historischen Sensordaten über Grafana
          angezeigt.
        </p>
      )}
    </section>
  );
}

export { GrafanaHistorischeDaten };