import { useState, type ReactNode } from "react";
import {
  Bell,
  CloudRain,
  LayoutDashboard,
  LogIn,
  MapPin,
  Menu,
  Radio,
  Sun,
  X,
} from "lucide-react";
import { useApp } from "../lib/context";
import type { Page } from "../lib/types";
import { ReportModal } from "./ReportModal";

const NAV: { id: Page; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "livemap", label: "Live Map" },
  { id: "analytics", label: "Analytics" },
  { id: "reports", label: "Reports" },
  { id: "ingestion", label: "Social Feed" },
  { id: "pipeline", label: "Pipeline" },
  { id: "forecast", label: "Forecast" },
  { id: "about", label: "About Us" },
  { id: "contact", label: "Contact" },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-blue-200">
        <CloudRain className="h-5 w-5 text-white" />
        <Sun className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 text-amber-300" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-display text-[15px] font-bold tracking-tight text-slate-900">
            National Weather
          </div>
          <div className="text-[11px] font-medium text-slate-500">Big Data Analytics Platform</div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const { page, navigate, user, pendingCitizenCount } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
        <button onClick={() => navigate("home")} className="shrink-0">
          <Logo />
        </button>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.id)}
              className={`relative rounded-lg px-2.5 py-2 text-[13px] font-medium transition xl:px-3 ${
                page === n.id ? "text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {n.label}
              {page === n.id && (
                <span className="absolute inset-x-3 -bottom-[18px] h-0.5 rounded-full bg-blue-600" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("livemap")}
            className="hidden h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 md:inline-flex"
            aria-label="Alerts"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate("login")}
            className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"
          >
            <LogIn className="h-3.5 w-3.5" />
            {user ? user.name.split(" ")[0] : "Login"}
          </button>
          <button
            onClick={() => navigate("dashboard")}
            className="relative inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-[13px] font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
            {pendingCitizenCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-400 px-1 text-[10px] font-bold text-slate-900">
                {pendingCitizenCount}
              </span>
            )}
          </button>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 xl:hidden">
          <div className="grid grid-cols-2 gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  navigate(n.id);
                  setOpen(false);
                }}
                className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                  page === n.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { navigate } = useApp();
  return (
    <footer className="mt-auto border-t border-slate-100 bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Real-time weather intelligence for India — fused from IMD, satellites, social streams and citizen
            reports.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">Platform</div>
          <div className="mt-3 space-y-2 text-sm text-slate-500">
            {NAV.slice(0, 6).map((n) => (
              <button key={n.id} onClick={() => navigate(n.id)} className="block hover:text-blue-600">
                {n.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">Sources</div>
          <div className="mt-3 space-y-2 text-sm text-slate-500">
            <p>Open-Meteo Forecast API</p>
            <p>IMD & public datasets</p>
            <p>Social & news ingest</p>
            <p>Citizen REST reports</p>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">Status</div>
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
            <Radio className="h-4 w-4" />
            All systems operational
          </div>
          <p className="mt-2 text-xs text-slate-400">Live weather via Open-Meteo · Asia/Kolkata</p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} National Weather Intelligence Platform · For public situational awareness
      </div>
    </footer>
  );
}

export function Shell({ children, flush = false }: { children: ReactNode; flush?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col map-bg">
      <Navbar />
      <main className={flush ? "flex-1" : "mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6"}>{children}</main>
      <Footer />
      <ReportModal />
    </div>
  );
}

export function PageHeader({
  icon,
  title,
  subtitle,
  extra,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">{icon}</div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {extra}
    </div>
  );
}

export function LivePill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Live
    </span>
  );
}

export function WsPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
      WebSocket Connected
    </span>
  );
}

export function StatusChip({ status }: { status: "Verified" | "Under Review" | "Unverified" }) {
  const cls =
    status === "Verified"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : status === "Under Review"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-rose-50 text-rose-700 border-rose-100";
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{status}</span>;
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
      <MapPin className="h-4 w-4" /> {children}
    </div>
  );
}
