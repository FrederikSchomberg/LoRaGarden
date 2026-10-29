

## Dashboard-CSS-Aufteilung

`src/styles/pages/dashboard-app.css` ist jetzt der zentrale Einstiegspunkt und importiert die aufgeteilten Dateien aus `src/styles/pages/dashboard/`:

- `dashboard-layout.css` – Grundlayout und allgemeine Dashboard-Bereiche.
- `dashboard-effects.css` – Hintergrundeffekte und Animationen.
- `dashboard-header.css` – Kopfbereich, Status und Aktionen.
- `dashboard-summary.css` – Kennzahlen und Zusammenfassungskarten.
- `dashboard-beds.css` – Beetkarten, Feuchtigkeit und Messwerte.
- `dashboard-comparison.css` – Vergleichsbereich und Tabellen.
- `dashboard-navigation.css` – Navigation und Tabs.
- `dashboard-responsive.css` – Responsive Regeln und Media Queries.

Responsive Regeln bleiben in einer eigenen Datei; die Komponenten-CSS-Dateien unter `src/styles/components/` bleiben erhalten und werden weiterhin von den jeweiligen React-Komponenten importiert.
