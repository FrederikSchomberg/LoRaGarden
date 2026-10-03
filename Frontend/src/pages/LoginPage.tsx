import { useState } from "react";
import type { FormEvent } from "react";
import { loginUser } from "../api";
import type { User } from "../types/auth";
import "./LoginPage.css";

type LoginPageProps = {
  onZurueck: () => void;
  onLoginErfolg?: (user: User) => void;
};

export function LoginPage({
  onZurueck,
  onLoginErfolg,
}: LoginPageProps) {
  const [benutzername, setBenutzername] = useState("");
  const [passwort, setPasswort] = useState("");

  const [fehler, setFehler] = useState("");
  const [erfolg, setErfolg] = useState("");
  const [laedt, setLaedt] = useState(false);

  const anmelden = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFehler("");
    setErfolg("");
    setLaedt(true);

    try {
      const antwort = await loginUser({
        username: benutzername.trim(),
        password: passwort,
      });

      setErfolg(`Willkommen, ${antwort.user.name}!`);

      if (onLoginErfolg) {
        setTimeout(() => {
          onLoginErfolg(antwort.user);
        }, 600);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setFehler(error.message);
      } else {
        setFehler("Ein unerwarteter Fehler ist aufgetreten.");
      }
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

          {erfolg && <p className="login-erfolg">{erfolg}</p>}

          <button type="submit" disabled={laedt}>
            {laedt ? "Wird angemeldet..." : "Anmelden"}
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