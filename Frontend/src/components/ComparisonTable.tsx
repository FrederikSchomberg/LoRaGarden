import {
  beetName,
  einzelwert,
  formatiereZahl,
  mittelwert,
} from "../dashboardUtils";
import type { BeetDaten, Messwerte } from "../types/dashboard";

type ComparisonTableProps = {
  beete: BeetDaten[];
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

export function ComparisonTable({ beete }: ComparisonTableProps) {
  return (
    <section className="vergleich">
      <div className="vergleich-kopf">
        <div>
          <p className="karten-label">Direkter Vergleich</p>
          <h2>Oben und unten getrennt</h2>
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

                    <span>
                      oben:{" "}
                      {formatiereZahl(
                        einzelwert(beet, "oben", zeile.feld),
                        zeile.einheit,
                        zeile.stellen,
                      )}
                    </span>

                    <span>
                      unten:{" "}
                      {formatiereZahl(
                        einzelwert(beet, "unten", zeile.feld),
                        zeile.einheit,
                        zeile.stellen,
                      )}
                    </span>
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