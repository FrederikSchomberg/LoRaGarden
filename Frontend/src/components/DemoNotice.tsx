type DemoNoticeProps = {
  fehler: string;
};

export function DemoNotice({ fehler }: DemoNoticeProps) {
  return (
    <div className="hinweis">
      <strong>Demoansicht:</strong>{" "}
      {fehler || "Noch keine Live-Daten geladen."} Sobald die API erreichbar
      ist werden die Werte ersetzt.
    </div>
  );
}