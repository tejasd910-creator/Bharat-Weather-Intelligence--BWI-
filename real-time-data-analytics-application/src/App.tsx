import type { ReactNode } from "react";
import { AppProvider, useApp } from "./lib/context";
import type { Page } from "./lib/types";
import Home from "./pages/Home";
import LiveMap from "./pages/LiveMap";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Ingestion from "./pages/Ingestion";
import Pipeline from "./pages/Pipeline";
import Forecast from "./pages/Forecast";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function Router() {
  const { page } = useApp();
  const map: Record<Page, ReactNode> = {
    home: <Home />,
    livemap: <LiveMap />,
    analytics: <Analytics />,
    reports: <Reports />,
    ingestion: <Ingestion />,
    pipeline: <Pipeline />,
    forecast: <Forecast />,
    about: <About />,
    contact: <Contact />,
    login: <Login />,
    dashboard: <Dashboard />,
  };
  return <>{map[page] ?? <Home />}</>;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
