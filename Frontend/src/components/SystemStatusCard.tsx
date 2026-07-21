// SystemStatusCard component is responsible for displaying the status of various system components 
// (MQTT, InfluxDB, API, Grafana) in a card format.

type SystemStatusCardProps = {
  mqtt: string;
  influxdb: string;
  api: string;
  grafana: string;
  mqttIsLive?: boolean;
  influxdbIsLive?: boolean;
  apiIsLive?: boolean;
  grafanaIsLive?: boolean;
};

export function SystemStatusCard({
  mqtt,
  influxdb,
  api,
  grafana,
  mqttIsLive = false,
  influxdbIsLive = false,
  apiIsLive = false,
  grafanaIsLive = false,
}: SystemStatusCardProps) {
  return (
    <article className="system-card">
      <p className="card-label">Systemstatus</p>

      <ul className="status-list">
        {/* mqtt ist aktuell live */}
        <li>
          MQTT:{" "}
          {mqttIsLive ? (
            <span className={getStatusClass(mqtt)}>{mqtt}</span>
          ) : (
            mqtt
          )}
        </li>

        {/* influxdb ist erstmal noch mock */}
        <li>
          InfluxDB:{" "}
          {influxdbIsLive ? (
            <span className={getStatusClass(influxdb)}>{influxdb}</span>
          ) : (
            influxdb
          )}
        </li>

        {/* api ist aktuell live */}
        <li>
          API:{" "}
          {apiIsLive ? (
            <span className={getStatusClass(api)}>{api}</span>
          ) : (
            api
          )}
        </li>

        {/* grafana ist erstmal noch mock */}
        <li>
          Grafana:{" "}
          {grafanaIsLive ? (
            <span className={getStatusClass(grafana)}>{grafana}</span>
          ) : (
            grafana
          )}
        </li>
      </ul>
    </article>
  );
}

// css klasse für online oder offline badge
function getStatusClass(status: string) {
  if (status === "online") {
    return "status-badge status-online";
  }

  return "status-badge status-offline";
}