type DashboardHeaderProps = {
  beetName: string;
  lastMeasurement: string;
};

export function DashboardHeader({
  beetName,
  lastMeasurement,
}: DashboardHeaderProps) {
  return (
    <section className="dashboard-header">
      {/* titelbereich oben */}
      <div>
        <p className="dashboard-label">Smart Gardening Dashboard</p>
        <h1>{beetName}</h1>
        <p>Mockup Beet.</p>
      </div>

      {/* letzte messung oben rechts */}
      <div className="last-measurement">
        Letzte Messung: {lastMeasurement}
      </div>
    </section>
  );
}