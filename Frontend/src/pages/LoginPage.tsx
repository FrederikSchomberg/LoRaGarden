import { useState } from "react";
import type { FormEvent } from "react";
import { loginUser, registerUser } from "../api";
import type { User } from "../types/auth";
import "./LoginPage.css";

type LoginPageProps = {
  onZurueck: () => void;
  onLoginErfolg?: (user: User) => void;
};

type Modus = "anmelden" | "registrieren";

export function LoginPage({ onZurueck, onLoginErfolg }: LoginPageProps) {
  const [modus, setModus] = useState<Modus>("anmelden");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");

  const [fehler, setFehler] = useState("");
  const [erfolg, setErfolg] = useState("");
  const [laedt, setLaedt] = useState(false);

  const wechsleModus = (neuerModus: Modus) => {
    setModus(neuerModus);
    setFehler("");
    setErfolg("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFehler("");
    setErfolg("");
    setLaedt(true);

    try {
      if (modus === "anmelden") {
        const antwort = await loginUser({
          email: email.trim(),
          password: passwort,
        });

        setErfolg(`Willkommen zurück, ${antwort.user.name}!`);

        if (onLoginErfolg) {
          setTimeout(() => {
            onLoginErfolg(antwort.user);
          }, 600);
        }
      } else {
        const antwort = await registerUser({
          name: name.trim(),
          email: email.trim(),
          password: passwort,
        });

        setErfolg(`Konto erfolgreich erstellt! Willkommen, ${antwort.user.name}.`);

        if (onLoginErfolg) {
          setTimeout(() => {
            onLoginErfolg(antwort.user);
          }, 600);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFehler(err.message);
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

        <h1>{modus === "anmelden" ? "Anmelden" : "Konto erstellen"}</h1>

        <div className="login-tabs">
          <button
            type="button"
            className={modus === "anmelden" ? "login-tab-btn aktiv" : "login-tab-btn"}
            onClick={() => wechsleModus("anmelden")}
          >
            Anmelden
          </button>
          <button
            type="button"
            className={modus === "registrieren" ? "login-tab-btn aktiv" : "login-tab-btn"}
            onClick={() => wechsleModus("registrieren")}
          >
            Registrieren
          </button>
        </div>

        <p className="login-text">
          {modus === "anmelden"
            ? "Bitte mit E-Mail und Passwort anmelden."
            : "Erstelle ein neues Benutzerkonto für LoRaGarden."}
        </p>

        <form onSubmit={handleSubmit}>
          {modus === "registrieren" && (
            <>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Max Mustermann"
                required
              />
            </>
          )}

          <label htmlFor="email">E-Mail-Adresse</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@beispiel.de"
            required
          />

          <label htmlFor="passwort">Passwort</label>
          <input
            id="passwort"
            type="password"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            placeholder={modus === "registrieren" ? "Mindestens 6 Zeichen" : ""}
            minLength={modus === "registrieren" ? 6 : undefined}
            required
          />
          {modus === "registrieren" && (
            <p className="login-hinweis">Das Passwort muss mindestens 6 Zeichen lang sein.</p>
          )}

          {fehler && <p className="login-fehler">{fehler}</p>}

          {erfolg && <p className="login-erfolg">{erfolg}</p>}

          <button type="submit" disabled={laedt}>
            {laedt
              ? modus === "anmelden"
                ? "Wird angemeldet..."
                : "Wird registriert..."
              : modus === "anmelden"
                ? "Anmelden"
                : "Registrieren"}
          </button>
        </form>

        <div className="login-wechsel-abschnitt">
          <button
            type="button"
            className="login-wechsel-btn"
            onClick={() => wechsleModus(modus === "anmelden" ? "registrieren" : "anmelden")}
          >
            {modus === "anmelden"
              ? "Noch kein Konto? Jetzt registrieren"
              : "Bereits registriert? Hier anmelden"}
          </button>
        </div>

        <button className="login-zurueck" type="button" onClick={onZurueck}>
          Zurück zur Startseite
        </button>
      </section>
    </main>
  );
}