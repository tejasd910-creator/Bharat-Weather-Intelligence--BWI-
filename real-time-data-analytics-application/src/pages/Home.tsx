import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  CloudRain,
  Database,
  MapPin,
  ThermometerSun,
  TriangleAlert,
  Users,
  Waves,
  Wind,
} from "lucide-react";
import { HERO_MAP } from "../assets/media";
import { Shell } from "../components/Layout";
import { EventGlyph, WeatherGlyph } from "../components/WeatherGlyph";
import { useApp } from "../lib/context";
import { HOME_CITIES } from "../lib/data";
import { weatherShort } from "../lib/weather";

const FEATURES = [
  {
    icon: Database,
    color: "text-emerald-600 bg-emerald-50",
    title: "Multi-Source Data",
    text: "Collecting data from IMD, APIs, social media, news, satellites and citizen reports.",
  },
  {
    icon: Brain,
    color: "text-violet-600 bg-violet-50",
    title: "AI-Powered Analysis",
    text: "Advanced AI models detect events, predict impacts and generate accurate insights.",
  },
  {
    icon: MapPin,
    color: "text-sky-600 bg-sky-50",
    title: "Interactive GIS Maps",
    text: "Explore real-time weather conditions with interactive maps and layers.",
  },
  {
    icon: Bell,
    color: "text-amber-600 bg-amber-50",
    title: "Real-Time Alerts",
    text: "Instant alerts and notifications for severe weather and disaster events.",
  },
  {
    icon: BarChart3,
    color: "text-cyan-600 bg-cyan-50",
    title: "Analytics & Reports",
    text: "In-depth analytics, trends and reports for data-driven decision making.",
  },
  {
    icon: Users,
    color: "text-rose-600 bg-rose-50",
    title: "Citizen Participation",
    text: "Empower citizens to report incidents and contribute to weather intelligence.",
  },
];

export default function Home() {
  const { navigate, weather, weatherLoading, setReportOpen } = useApp();
  const snapshot = HOME_CITIES.map((id) => weather.find((w) => w.city.id === id)).filter(Boolean);

  return (
    <Shell>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-sky-50/60 px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_1fr_280px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
              <span className="text-blue-600">AI Powered</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              Real Time
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              Reliable
            </div>
            <h1 className="font-display mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              National Weather
              <br />
              <span className="text-blue-600">Intelligence Platform</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-500">
              Real-time data from multiple sources, AI-powered analytics and interactive maps for accurate
              weather intelligence and early alerts.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("livemap")}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
              >
                <MapPin className="h-4 w-4" />
                Explore Live Map
              </button>
              <button
                onClick={() => setReportOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Activity className="h-4 w-4" />
                Report an Incident
              </button>
            </div>
          </div>

          <div className="relative mx-auto h-[340px] w-full max-w-[420px] sm:h-[400px]">
            <img
              src={HERO_MAP}
              alt="Map of India"
              className="absolute inset-0 h-full w-full object-contain opacity-90"
            />
            <span className="float-y absolute left-[38%] top-[22%] grid h-9 w-9 place-items-center rounded-full bg-sky-500 text-white shadow-lg">
              <CloudRain className="h-4 w-4" />
            </span>
            <span className="float-y absolute left-[58%] top-[36%] grid h-9 w-9 place-items-center rounded-full bg-rose-500 text-white shadow-lg" style={{ animationDelay: "0.6s" }}>
              <TriangleAlert className="h-4 w-4" />
            </span>
            <span className="float-y absolute left-[28%] top-[48%] grid h-9 w-9 place-items-center rounded-full bg-amber-400 text-white shadow-lg" style={{ animationDelay: "1.1s" }}>
              <ThermometerSun className="h-4 w-4" />
            </span>
            <span className="float-y absolute left-[48%] top-[62%] grid h-9 w-9 place-items-center rounded-full bg-cyan-500 text-white shadow-lg" style={{ animationDelay: "0.3s" }}>
              <Waves className="h-4 w-4" />
            </span>
            <span className="float-y absolute left-[42%] top-[12%] grid h-9 w-9 place-items-center rounded-full bg-violet-500 text-white shadow-lg" style={{ animationDelay: "1.4s" }}>
              <Wind className="h-4 w-4" />
            </span>
          </div>

          <aside className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800">Today's Overview</h3>
            <ul className="mt-3 divide-y divide-slate-100">
              <OverviewRow icon={<CloudRain className="h-4 w-4 text-sky-600" />} label="Heavy Rain" value="17" unit="States" />
              <OverviewRow icon={<Waves className="h-4 w-4 text-cyan-600" />} label="Flood Alerts" value="42" unit="Districts" />
              <OverviewRow icon={<Wind className="h-4 w-4 text-violet-600" />} label="Cyclone" value="2" unit="Active" />
              <OverviewRow icon={<ThermometerSun className="h-4 w-4 text-amber-500" />} label="Heatwave" value="5" unit="Regions" />
              <OverviewRow icon={<TriangleAlert className="h-4 w-4 text-rose-500" />} label="Active Incidents" value="138" unit="Total" />
            </ul>
          </aside>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${f.color}`}>
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-800">{f.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">Live Weather Snapshot</h2>
            <button onClick={() => navigate("forecast")} className="text-sm font-semibold text-blue-600">
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {weatherLoading && snapshot.length === 0
              ? HOME_CITIES.map((id) => <div key={id} className="shimmer h-36 rounded-2xl" />)
              : snapshot.map((w) =>
                  w ? (
                    <button
                      key={w.city.id}
                      onClick={() => navigate("forecast")}
                      className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-center hover:border-blue-200 hover:bg-white"
                    >
                      <div className="text-sm font-semibold text-slate-800">{w.city.name}</div>
                      <div className="mx-auto mt-2 grid h-10 place-items-center">
                        <WeatherGlyph code={w.current?.weatherCode ?? 2} className="h-8 w-8" />
                      </div>
                      <div className="mt-1 font-display text-2xl font-bold text-slate-900">
                        {w.current ? Math.round(w.current.temperature) : "--"}°C
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {w.current ? weatherShort(w.current.weatherCode) : "Loading"}
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-sky-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                        Humidity: {w.current ? Math.round(w.current.humidity) : "--"}%
                      </div>
                    </button>
                  ) : null
                )}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">Live conditions from Open-Meteo · refreshed every 10 minutes</p>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">Recent Alerts</h2>
            <button onClick={() => navigate("reports")} className="text-sm font-semibold text-blue-600">
              View All
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {[
              { t: "Heavy Rain Alert", p: "Kanpur, Uttar Pradesh", time: "10:45 AM", type: "Active Incident" as const },
              { t: "Flood Warning", p: "Cachar, Assam", time: "10:30 AM", type: "Flood" as const },
              { t: "Cyclone Watch", p: "Puri, Odisha", time: "09:50 AM", type: "Cyclone" as const },
            ].map((a) => (
              <li key={a.t} className="flex items-center gap-3 py-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-50">
                  <EventGlyph type={a.type} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-800">{a.t}</div>
                  <div className="text-xs text-slate-500">{a.p}</div>
                </div>
                <div className="text-xs text-slate-400">{a.time}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Shell>
  );
}

function OverviewRow({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-50">{icon}</div>
      <span className="flex-1 text-sm text-slate-600">{label}</span>
      <div className="text-right">
        <div className="font-display text-lg font-bold leading-none text-slate-900">{value}</div>
        <div className="text-[10px] text-slate-400">{unit}</div>
      </div>
    </li>
  );
}
