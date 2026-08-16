import type { BeetDaten, Messwerte, SensorPosition } from "./types/dashboard";

// berechnet mittelwert eines messfelds für ein beet
export function mittelwert(beet: BeetDaten, feld: keyof Messwerte) {
  // speichert summe aller gültigen messwerte
  let summe = 0;

  // zählt wie viele gültige messwerte gefunden wurden
  let anzahl = 0;

  // geht die sensoren im beet nacheinander durch
  for (const sensor of beet.sensors) {
    // liest das gewünschte messfeld vom aktuellen sensor
    const wert = sensor.values[feld];

    // wert überspringen wenn keine zahl
    if (typeof wert !== "number") {
      continue;
    }

    summe = summe + wert;
    anzahl = anzahl + 1;
  }

  if (anzahl === 0) {
    return null;
  }
  // Mittelwert
  return summe / anzahl;
}


// sucht sensor über seine position im beet
export function findeSensor(beet: BeetDaten, position: SensorPosition) {
  // geht sensoren im beet nachenander durch
  for (const sensor of beet.sensors) {
    const gespeichertePosition = sensor.bed_position.toLowerCase();

    // prüft ob die positionen übereinstimmen
    if (gespeichertePosition === position) {
      return sensor;
    }
  }

  // undefined bedeutet dass kein passender sensor gefunden wurde
  return undefined;
}


// liest einzelnen wert von einem bestimmten sensor aus
export function einzelwert(
  // enthält beet mit seinen sensoren
  beet: BeetDaten,
  // legt sensorposition fest
  position: SensorPosition,
  // legt messfeld fest
  feld: keyof Messwerte,
) {
  // sucht zuerst den sensor an gewünschter Position
  const sensor = findeSensor(beet, position);

  if (sensor === undefined) {
    return null;
  }

  // liest gewünschten messwert aus den gefundenen sensor
  const wert = sensor.values[feld];

  return wert;
}


// ermittelt den anzuzeigenden namen eines beets
export function beetName(beet: BeetDaten) {
  // prüft ob mindestens ein sensor vorhanden ist
  if (beet.sensors.length > 0) {
    // ersten sensor des beets speichern
    const ersterSensor = beet.sensors[0];

    // prüfen ob beim sensor ein beetname voranden ist
    if (ersterSensor.bed) {
      return ersterSensor.bed;
    }
  }

  // liest den ersten buchstaben des internen beetnamens
  const ersterBuchstabe = beet.name.charAt(0).toUpperCase();

  // liest restlichen teil des beetnamens
  const restlicherName = beet.name.slice(1);

  // setzt beide teile wieder zu einem namen zusammen
  return ersterBuchstabe + restlicherName;
}


// formatiert einen messwert für die ausgabe im frontend
export function formatiereZahl(
  // enthält zu formatierenden messwert
  wert: number | null | undefined,
  // enthält passende einheit
  einheit: string,
  // legt anzahl der nachkommastellen fest
  stellen: number,
) {

  if (wert === null || wert === undefined) {
    return "-";
  }

  // rundet wert auf die gewünschte anzahl an stellen
  const gerundeterWert = wert.toFixed(stellen);

  // ersetzt dezimalpunkt durch ein komma
  const formatierterWert = gerundeterWert.replace(".", ",");

  return formatierterWert + einheit;
}


// ermittelt den neuesten zeitstempel aus allen beeten
export function letzteMessung(beete: BeetDaten[]) {
  // speichert alle vorhandenen zeitstempel
  const zeiten: string[] = [];

  // geht alle beete nacheinander durch
  for (const beet of beete) {
    // geht alle sensoren des aktuellen beets durch
    for (const sensor of beet.sensors) {
      // liest zeitstempl des aktuellen sensors
      const zeit = sensor.updated_at;

      // prüft ob ein zeitstempel vorhanden ist
      if (zeit) {
        // fügt zeitstempel zum array hinzu
        zeiten.push(zeit);
      }
    }
  }

  // gibt null zurück wenn keine zeitstempel gefunden wurden
  if (zeiten.length === 0) {
    return null;
  }

  // sortiert die iso zeitstempel von alt nach neu
  zeiten.sort();

  // berechnet den index des letzten eintrags
  const letzterIndex = zeiten.length - 1;

  // gibt den neuesten zeitstempel zurück
  return zeiten[letzterIndex];
}

// formatiert einen zeitstempel für die deutsche anzeige
export function formatiereZeit(zeit: string | null) {
  // prüft ob ein zeitstempel vorhanden ist
  if (!zeit) {
    return "keine Messung";
  }

  // erzeugt aus dem zeitstempel ein Datum Objekt
  const datum = new Date(zeit);

  // legt die formatierung für dsa datum fest
  const optionen: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  // formatiert das datum in die deutsche darstellung
  const formatierteZeit = datum.toLocaleString("de-DE", optionen);

  return formatierteZeit;
}
