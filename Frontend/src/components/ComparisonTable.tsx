import {
  beetName,
  einzelwert,
  formatiereZahl,
  mittelwert,
} from "../dashboardUtils";
import type { BeetDaten, Messwerte } from "../types/dashboard";
import "../styles/components/dashboard-card.css";
import "../styles/components/comparison-table.css";

type ComparisonTableProps = {
  beete: BeetDaten[];
  untertitel?: string;
  positionen?: { key: string; label: string }[];
};

type Vergleichszeile = {
  feld: keyof Messwerte;
  titel: string;
  einheit: string;
  stellen: number;
};

const zeilen: Vergleichszeile[] = [
  {
    feld: "soil_moisture",
    titel: "Bodenfeuchtigkeit",
    einheit: " %",
    stellen: 1,
  },
  {
    feld: "soil_temperature",
    titel: "Bodentemperatur",
    einheit: " °C",
    stellen: 1,
  },
  {
    feld: "soil_ec",
    titel: "Boden-EC",
    einheit: "",
    stellen: 0,
  },
  {
    feld: "battery_voltage",
    titel: "Batteriespannung",
    einheit: " V",
    stellen: 2,
  },
];

const standardPositionen = [
  { key: "oben", label: "oben" },
  { key: "unten", label: "unten" },
];

export function ComparisonTable({
  beete,
  untertitel = "Oben und unten getrennt",
  positionen = standardPositionen,
}: ComparisonTableProps) {
  return (
    <section className="vergleich dashboard-karte">
      <div className="vergleich-kopf">
        <div>
          <p className="karten-label">Direkter Vergleich</p>
          <h2>{untertitel}</h2>
        </div>

        <p>Ø = Durchschnitt der vorhandenen Messstellen</p>
      </div>

      <div className="tabelle-wrap">
        <table>
          <thead>
            <tr>
              <th>Messwert</th>

              {beete.map((beet) => (
                <th key={beet.name}>{beetName(beet)}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {zeilen.map((zeile) => (
              <tr key={zeile.feld}>
                <th>{zeile.titel}</th>

                {beete.map((beet) => (
                  <td key={`${beet.name}-${zeile.feld}`}>
                    <strong>
                      Ø{" "}
                      {formatiereZahl(
                        mittelwert(beet, zeile.feld),
                        zeile.einheit,
                        zeile.stellen,
                      )}
                    </strong>

                    {positionen.map((pos) => (
                      <span key={pos.key}>
                        {pos.label}:{" "}
                        {formatiereZahl(
                          einzelwert(beet, pos.key, zeile.feld),
                          zeile.einheit,
                          zeile.stellen,
                        )}
                      </span>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
