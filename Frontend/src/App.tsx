import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { getCurrentUser, holeDashboard, logoutUser } from "./api";
import { BedCard } from "./components/BedCard";
import { ComparisonTable } from "./components/ComparisonTable";
import { DashboardHeader } from "./components/DashboardHeader";
import { DemoNotice } from "./components/DemoNotice";
import { StatusFooter } from "./components/StatusFooter";
import { SummaryCards } from "./components/SummaryCards";
import { letzteMessung } from "./dashboardUtils";
import { beispielDaten } from "./data/mockData";
import { GrafanaHistorischeDaten } from "./components/GrafanaHistorischeDaten";
import type { DashboardResponse } from "./types/dashboard";
import type { User } from "./types/auth";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { InternalPage } from "./pages/InternalPage";
import { NeleDashboard } from "./pages/NeleDashboard";

type DashboardProps = {
  user: User | null;
  onLogout: () => void;
  onLoginOeffnen: () => void;
  onStartseiteOeffnen: () => void;
};

function Dashboard({
  user,
  onLogout,
  onLoginOeffnen,
  onStartseiteOeffnen,
}: DashboardProps) {
  // damit wir wieder oben landen wenn wir das dashboard über den link öffnen
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);
  // ohne vpn stehen hier zuerst beispieldaten drin
  const [daten, setDaten] = useState<DashboardResponse>(beispielDaten);
  const [demo, setDemo] = useState(true);
  const [fehler, setFehler] = useState("");
  const [laedt, setLaedt] = useState(false);

  // Aktiver Tab
  const [aktiverTab, setAktiverTab] = useState<"aktuell" | "historisch">(
    "aktuell",
  );

  const holeDaten = useCallback(async () => {
    setLaedt(true);

    try {
      const neu = await holeDashboard();
      console.log("Neue Daten:", neu);

      setDaten(neu);
      setDemo(false);
      setFehler("");
    } catch {
      setDaten(beispielDaten);
      setDemo(true);
      setFehler(
        "Backend nicht erreichbar – es werden Beispieldaten angezeigt.",
      );
    } finally {
      setLaedt(false);
    }
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => void holeDaten(), 0);

    // im 2min intervall wird die seite neu geladen
    const timer = window.setInterval(() => void holeDaten(), 120000);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [holeDaten]);

  const letzterStand = letzteMessung(daten.beds);

  return (
    <main className="app">
      <DashboardHeader
        demo={demo}
        letzterStand={letzterStand}
        laedt={laedt}
        onNeuLaden={holeDaten}
        user={user}
        onLogout={onLogout}
        onLoginOeffnen={onLoginOeffnen}
        onStartseiteOeffnen={onStartseiteOeffnen}
      />

      {/* Navigation zwischen aktuellem und historischem Dashboard */}
      <nav className="tabs" aria-label="Dashboard Navigation">
        <button
          type="button"
          className={aktiverTab === "aktuell" ? "tab aktiv" : "tab"}
          onClick={() => setAktiverTab("aktuell")}
        >
          Aktuelle Daten
        </button>

        <button
          type="button"
          className={aktiverTab === "historisch" ? "tab aktiv" : "tab"}
          onClick={() => {
            setAktiverTab("historisch");
          }}
        >
          Historische Daten
        </button>
      </nav>

      {/* Aktuelle Daten */}
      {aktiverTab === "aktuell" && (
        <>
          {demo && <DemoNotice fehler={fehler} />}

          <SummaryCards beete={daten.beds} />

          <section className="beet-grid" aria-label="Beete">
            {daten.beds.map((beet) => (
              <BedCard key={beet.name} beet={beet} demo={demo} />
            ))}
          </section>

          <ComparisonTable beete={daten.beds} />

          <StatusFooter
            demo={demo}
            datenbankVerbunden={daten.database.connected}
          />
        </>
      )}

      {/* Historische Daten */}
      {aktiverTab === "historisch" && <GrafanaHistorischeDaten />}
    </main>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  const seiteAusUrl = () => {
    const hash = window.location.hash;
    if (hash === "#/dashboard" || hash === "#dashboard") {
      return "dashboard";
    }

    if (hash === "#/login" || hash === "#login") {
      return "login";
    }

    if (window.location.hash === "#/intern") {
      return "intern";
    }

    if (window.location.hash === "#/nele") {
      return "nele";
    }

    return "landingpage";
  };

  const [seite, setSeite] = useState<
    "landingpage" | "dashboard" | "login" | "intern" | "nele"
  >(seiteAusUrl);

  // Beim Start prüfen, ob der User bereits eingeloggt ist (Cookie prüfen)
  useEffect(() => {
    let aktiv = true;
    getCurrentUser().then((currentUser) => {
      if (aktiv && currentUser) {
        setUser(currentUser);
      }
    });

    return () => {
      aktiv = false;
    };
  }, []);

  useEffect(() => {
    const reagiereAufUrlAenderung = () => {
      setSeite(seiteAusUrl());
    };

    window.addEventListener("hashchange", reagiereAufUrlAenderung);

    return () => {
      window.removeEventListener("hashchange", reagiereAufUrlAenderung);
    };
  }, []);

  const dashboardOeffnen = () => {
    window.location.hash = "/dashboard";
    setSeite("dashboard");
  };

  const startseiteOeffnen = () => {
    window.location.hash = "/";
    setSeite("landingpage");
  };

  const loginOeffnen = () => {
    window.location.hash = "/login";
    setSeite("login");
  };

  const abmelden = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout Fehler:", error);
    } finally {
      setUser(null);
    }
  };

  const internOeffnen = () => {
    window.location.hash = "/intern";
    setSeite("intern");
  };

  const neleOeffnen = () => {
    window.location.hash = "/nele";
    setSeite("nele");
  };

  if (seite === "login") {
    return (
      <LoginPage
        onZurueck={startseiteOeffnen}
        onLoginErfolg={(eingeloggterUser) => {
          setUser(eingeloggterUser);
          dashboardOeffnen();
        }}
      />
    );
  }

  if (seite === "intern") {
    return (
      <InternalPage
        onDashboardOeffnen={dashboardOeffnen}
        onNeleOeffnen={neleOeffnen}
      />
    );
  }

  if (seite === "nele") {
    return <NeleDashboard onZurueck={internOeffnen} />;
  }

  if (seite === "landingpage") {
    return (
      <LandingPage
        onDashboardOeffnen={dashboardOeffnen}
        user={user}
        onLoginOeffnen={loginOeffnen}
        onLogout={abmelden}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={abmelden}
      onLoginOeffnen={loginOeffnen}
      onStartseiteOeffnen={startseiteOeffnen}
    />
  );
}

export default App;

