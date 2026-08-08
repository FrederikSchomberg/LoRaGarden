import type {
  BeetDaten,
  Messwerte,
  SensorPosition,
} from "./types/dashboard";

export function mittelwert(beet: BeetDaten, feld: keyof Messwerte) {
  const werte = beet.sensors
    .map((sensor) => sensor.values[feld])
    .filter((wert): wert is number => typeof wert === "number");

  if (werte.length === 0) {
    return null;
  }

  return werte.reduce((summe, wert) => summe + wert, 0) / werte.length;
}

export function findeSensor(beet: BeetDaten, position: SensorPosition) {
  return beet.sensors.find(
    (sensor) => sensor.bed_position.toLowerCase() === position,
  );
}

export function einzelwert(
  beet: BeetDaten,
  position: SensorPosition,
  feld: keyof Messwerte,
) {
  const sensor = findeSensor(beet, position);
  return sensor ? sensor.values[feld] : null;
}

export function beetName(beet: BeetDaten) {
  if (beet.sensors[0]?.bed) {
    return beet.sensors[0].bed;
  }

  return beet.name.charAt(0).toUpperCase() + beet.name.slice(1);
}

export function formatiereZahl(
  wert: number | null | undefined,
  einheit: string,
  stellen: number,
) {
  if (wert === null || wert === undefined) {
    return "-";
  }

  return `${wert.toFixed(stellen).replace(".", ",")}${einheit}`;
}

export function letzteMessung(beete: BeetDaten[]) {
  const zeiten = beete
    .flatMap((beet) => beet.sensors.map((sensor) => sensor.updated_at))
    .filter((zeit): zeit is string => Boolean(zeit));

  zeiten.sort();
  return zeiten.at(-1) || null;
}

export function formatiereZeit(zeit: string | null) {
  if (!zeit) {
    return "keine Messung";
  }

  return new Date(zeit).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}