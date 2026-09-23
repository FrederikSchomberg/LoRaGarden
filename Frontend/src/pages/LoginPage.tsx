import { useState } from "react";
import type { FormEvent } from "react";
import "./LoginPage.css";

type LoginPageProps = {
  onZurueck: () => void;
};

export function LoginPage({ onZurueck }: LoginPageProps) {
  const [benutzername, setBenutzername] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");
  const [erfolg, setErfolg] = useState(false);

  const anmelden = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFehler("");
    setErfolg(false);

    // erstmal nur ein einfacher test-login bis die backend-schnittstelle fertig ist
    if (benutzername === "test" && passwort === "garten") {
      setErfolg(true);
      return;
    }

    setFehler("Benutzername oder Passwort ist falsch.");
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
            required
          />

          <label htmlFor="passwort">Passwort</label>

          <input
            id="passwort"
            type="password"
            value={passwort}
            onChange={(event) => setPasswort(event.target.value)}
            required
          />

          {fehler && (
            <p className="login-fehler">
              {fehler}
            </p>
          )}

          {erfolg && (
            <p className="login-erfolg">
              Anmeldung erfolgreich.
            </p>
          )}

          <button type="submit">
            Anmelden
          </button>
        </form>

        <button
          className="login-zurueck"
          type="button"
          onClick={onZurueck}
        >
          Zurück zur Startseite
        </button>
      </section>
    </main>
  );
}