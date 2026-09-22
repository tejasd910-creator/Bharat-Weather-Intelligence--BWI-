import { useEffect, useState } from "react";
import {
  Bell,
  Brain,
  Cloud,
  Cog,
  Database,
  Globe,
  LayoutDashboard,
  Radio,
  Server,
  Shield,
  Smartphone,
  Users,
  Workflow,
} from "lucide-react";
import { LivePill, PageHeader, Shell } from "../components/Layout";

interface Metrics {
  sources: number;
  ingest: number;
  kafka: number;
  flinkLag: number;
  aiQps: number;
  events: number;
  mongo: number;
  cass: number;
  api: number;
}

function tick(m: Metrics): Metrics {
  const n = (base: number, spread: number) => Math.max(0, Math.round(base + (Math.random() - 0.45) * spread));
  return {
    sources: n(m.sources + 18, 12),
    ingest: n(840 + Math.random() * 80, 40),
    kafka: n(1200 + Math.random() * 200, 80),
    flinkLag: n(24 + Math.random() * 40, 20),
    aiQps: n(90 + Math.random() * 40, 20),
    events: n(m.events + 3, 4),
    mongo: n(420 + Math.random() * 80, 30),
    cass: n(610 + Math.random() * 90, 40),
    api: n(310 + Math.random() * 70, 25),
  };
}

export default function Pipeline() {
  const [m, setM] = useState<Metrics>({
    sources: 18420,
    ingest: 860,
    kafka: 1280,
    flinkLag: 32,
    aiQps: 96,
    events: 1248,
    mongo: 440,
    cass: 630,
    api: 320,
  });
  const [pulse, setPulse] = useState(0);
  const [active, setActive] = useState("kafka");

  useEffect(() => {
    const id = setInterval(() => {
      setM((x) => tick(x));
      setPulse((p) => p + 1);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <Shell>
      <PageHeader
        icon={<Workflow className="h-5 w-5" />}
        title="Data Pipeline"
        subtitle="Live flow through the National Weather big-data architecture"
        extra={
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
              Kafka {m.kafka} msg/s
            </span>
            <LivePill />
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Ingest rate" value={`${m.ingest}/s`} sub="collectors + scrapers" />
        <Metric label="Kafka throughput" value={`${m.kafka}/s`} sub="4 topics" />
        <Metric label="Flink lag" value={`${m.flinkLag} ms`} sub="clean · normalize · enrich" />
        <Metric label="AI inferences" value={`${m.aiQps}/s`} sub="5 model ensemble" />
        <Metric label="Events materialized" value={m.events.toLocaleString()} sub="Mongo + Cassandra" />
      </div>

      <div className="card overflow-x-auto p-4 sm:p-6">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-5 gap-3">
            <Stage
              id="src"
              active={active}
              onClick={setActive}
              step="1"
              color="bg-emerald-600"
              title="Data Sources"
              icon={<Globe className="h-4 w-4" />}
              items={["Social Media", "Weather APIs", "Websites / News", "Public Datasets", "Citizen App"]}
            />
            <Stage
              id="ing"
              active={active}
              onClick={setActive}
              step="2"
              color="bg-orange-500"
              title="Ingestion Services"
              icon={<Cloud className="h-4 w-4" />}
              items={["API Collectors", "Web Scrapers", "Citizen REST API", "Scheduled Collectors"]}
            />
            <Stage
              id="kafka"
              active={active}
              onClick={setActive}
              step="3"
              color="bg-violet-600"
              title="Kafka Broker"
              icon={<Radio className="h-4 w-4" />}
              items={[`raw-reports · ${m.kafka}/s`, "weather", "citizen", "news"]}
            />
            <Stage
              id="flink"
              active={active}
              onClick={setActive}
              step="4"
              color="bg-sky-600"
              title="Stream Processing"
              icon={<Cog className="h-4 w-4" />}
              items={["Apache Flink", "Clean", "Normalize", "Enrich", "Extract Location"]}
            />
            <Stage
              id="ai"
              active={active}
              onClick={setActive}
              step="5"
              color="bg-amber-500"
              title="AI / ML Layer"
              icon={<Brain className="h-4 w-4" />}
              items={["Event Classification", "Fake Detection", "Duplicate Detection", "Trust Score", "Severity"]}
            />
          </div>

          <FlowBar pulse={pulse} />

          <div className="mt-3 grid grid-cols-5 gap-3">
            <Stage
              id="notify"
              active={active}
              onClick={setActive}
              step="N"
              color="bg-rose-600"
              title="Notification & Alerting"
              icon={<Bell className="h-4 w-4" />}
              items={["Real-Time Alerts", "Emergency SOS", "Email / SMS", "JWT Auth", "Preparedness"]}
            />
            <Stage
              id="web"
              active={active}
              onClick={setActive}
              step="W"
              color="bg-blue-600"
              title="Web Application"
              icon={<Smartphone className="h-4 w-4" />}
              items={["React + Vite", "Administrator", "Citizens / Students"]}
            />
            <Stage
              id="event"
              active={active}
              onClick={setActive}
              step="6"
              color="bg-teal-600"
              title="Event Engine"
              icon={<Server className="h-4 w-4" />}
              items={["Reports", "Correlation", "Real Events"]}
            />
            <Stage
              id="store"
              active={active}
              onClick={setActive}
              step="7"
              color="bg-slate-700"
              title="Storage"
              icon={<Database className="h-4 w-4" />}
              items={[`MongoDB · ${m.mongo}/s`, `Cassandra · ${m.cass}/s`]}
            />
            <Stage
              id="api"
              active={active}
              onClick={setActive}
              step="8"
              color="bg-indigo-600"
              title="Backend APIs"
              icon={<Cloud className="h-4 w-4" />}
              items={["Node.js / Express", `REST ${m.api}/s`]}
            />
          </div>

          <FlowBar pulse={pulse} reverse />

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stage
              id="dash"
              active={active}
              onClick={setActive}
              step="9"
              color="bg-blue-700"
              title="Dashboard (React)"
              icon={<LayoutDashboard className="h-4 w-4" />}
              items={["Maps", "Charts", "Analytics", "Live Forecast (Open-Meteo)"]}
            />
            <Stage
              id="admin"
              active={active}
              onClick={setActive}
              step="10"
              color="bg-emerald-700"
              title="Admin Panel (React)"
              icon={<Shield className="h-4 w-4" />}
              items={["Verification", "User Management", "Source Management"]}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800">Kafka topics · live offsets</h3>
          <Topic name="raw-reports" rate={Math.round(m.kafka * 0.42)} lag={m.flinkLag} color="bg-violet-500" />
          <Topic name="weather" rate={Math.round(m.kafka * 0.28)} lag={Math.round(m.flinkLag * 0.6)} color="bg-sky-500" />
          <Topic name="citizen" rate={Math.round(m.kafka * 0.16)} lag={Math.round(m.flinkLag * 1.1)} color="bg-emerald-500" />
          <Topic name="news" rate={Math.round(m.kafka * 0.14)} lag={Math.round(m.flinkLag * 0.8)} color="bg-amber-500" />
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-800">Who consumes this</h3>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> Administrators verify events
            </p>
            <p className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-500" /> Citizens receive SOS & alerts
            </p>
            <p className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-violet-500" /> Analysts watch the live map
            </p>
            <p className="mt-4 text-xs text-slate-400">
              Packet pulse #{pulse} · architecture matches the platform reference (ingest → Kafka → Flink → AI →
              Event Engine → Storage → APIs → React).
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-display mt-1 text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-400">{sub}</div>
    </div>
  );
}

function Stage({
  id,
  step,
  color,
  title,
  items,
  icon,
  active,
  onClick,
}: {
  id: string;
  step: string;
  color: string;
  title: string;
  items: string[];
  icon: React.ReactNode;
  active: string;
  onClick: (id: string) => void;
}) {
  const on = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`rounded-2xl border p-3 text-left transition ${
        on ? "border-blue-400 bg-blue-50/40 shadow-md" : "border-slate-100 bg-white hover:border-slate-200"
      }`}
    >
      <div className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${color}`}>
        {step}. {title}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
        {icon} {title}
      </div>
      <ul className="mt-2 space-y-1 text-[11px] text-slate-500">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-slate-300" /> {it}
          </li>
        ))}
      </ul>
    </button>
  );
}

function FlowBar({ reverse }: { pulse?: number; reverse?: boolean }) {
  return (
    <div className="relative my-2 h-8 overflow-hidden">
      <div className="absolute inset-x-6 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-emerald-300 via-violet-400 to-amber-300" />
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="flow-packet absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-blue-500 shadow"
          style={{
            animationDelay: `${i * 0.45}s`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        />
      ))}
    </div>
  );
}

function Topic({ name, rate, lag, color }: { name: string; rate: number; lag: number; color: string }) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{name}</span>
        <span className="text-slate-400">
          {rate}/s · lag {lag} ms
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${Math.min(96, 30 + rate / 20)}%` }} />
      </div>
    </div>
  );
}
