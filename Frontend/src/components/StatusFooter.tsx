type StatusFooterProps = {
  demo: boolean;
  datenbankVerbunden: boolean;
};

export function StatusFooter({
  demo,
  datenbankVerbunden,
}: StatusFooterProps) {
  return (
    <footer className="fuss">
      <div>
        <span className={demo ? "punkt aus" : "punkt an"} />
        API: {demo ? "offline" : "online"}
      </div>

      <div>
        <span className={datenbankVerbunden ? "punkt an" : "punkt aus"} />
        InfluxDB: {datenbankVerbunden ? "online" : "offline"}
      </div>

      <div>Aktualisierung alle 30 Sekunden</div>
    </footer>
  );
}