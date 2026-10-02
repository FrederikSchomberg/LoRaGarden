import { useState } from "react";
import type { FormEvent } from "react";
import { login } from "../api";
import "./LoginPage.css";

type LoginPageProps = {
  onZurueck: () => void;
};

export function LoginPage({ onZurueck }: LoginPageProps) {
  const [benutzername, setBenutzername] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");
  const [erfolg, setErfolg] = useState(false);
  const [laedt, setLaedt] = useState(false);

  const anmelden = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFehler("");
    setErfolg(false);
    setLaedt(true);

    try {
      const erfolgreich = await login(benutzername, passwort);

      if (!erfolgreich) {
        setFehler("Benutzername oder Passwort ist falsch.");
        return;
      }

      setErfolg(true);
    } catch {
      setFehler("Verbindung zum Backend fehlgeschlagen.");
    } finally {
      setLaedt(false);
    }
  };

  return (
    <main className="login-seite">
      <section className="login-box">
        <p className="login-klein">Smart Gardening</p>

        <h1>Anmelden</h1>

        <p className="login-text">
          Bitte mit Benutzername und Passwort anmelden.
        </p>

        <form onSubmit={anmelden}>
          <label htmlFor="benutzername">Benutzername</label>

          <input
            id="benutzername"
            type="text"
            value={benutzername}
            onChange={(event) => setBenutzername(event.target.value)}
            disabled={laedt}
            required
          />

          <label htmlFor="passwort">Passwort</label>

          <input
            id="passwort"
            type="password"
            value={passwort}
            onChange={(event) => setPasswort(event.target.value)}
            disabled={laedt}
            required
          />

          {fehler && <p className="login-fehler">{fehler}</p>}

          {erfolg && <p className="login-erfolg">Anmeldung erfolgreich.</p>}

          <button type="submit" disabled={laedt}>
            {laedt ? "Anmeldung läuft..." : "Anmelden"}
          </button>
        </form>

        <button className="login-zurueck" type="button" onClick={onZurueck}>
          Zurück zur Startseite
        </button>
      </section>
    </main>
  );
}
