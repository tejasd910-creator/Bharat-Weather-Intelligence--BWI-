import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Brain,
  CloudRain,
  ShieldCheck,
  ThermometerSun,
  TriangleAlert,
  Waves,
  Wind,
} from "lucide-react";
import { LivePill, PageHeader, Shell } from "../components/Layout";
import { STATE_ACTIVITY, jitter } from "../lib/data";

const DAYS = ["Apr 24", "Apr 25", "Apr 26", "Apr 27", "Apr 28", "Apr 29", "Apr 30"];
const EVENT_COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b", "#94a3b8"];
const VERIFY_COLORS = ["#3b82f6", "#f59e0b", "#f43f5e"];

function seed() {
  return {
    verified: 1248,
    active: 186,
    confidence: 0.87,
    sources: { social: 62, news: 18, apis: 12, citizen: 8 },
    events: [
      { name: "Heavy Rain", value: 42 },
      { name: "Flood", value: 24 },
      { name: "Cyclone", value: 12 },
      { name: "Heatwave", value: 8 },
      { name: "Other", value: 14 },
    ],
    verify: [
      { name: "Verified", value: 72 },
      { name: "Under Review", value: 18 },
      { name: "Unverified", value: 10 },
    ],
    series: DAYS.map((d, i) => ({
      d,
      total: 48 + i * 6 + Math.round(Math.random() * 8),
      verified: 30 + i * 4 + Math.round(Math.random() * 6),
      unverified: 12 + Math.round(Math.random() * 6),
    })),
    states: STATE_ACTIVITY.map((s) => ({ ...s })),
    tick: Date.now(),
  };
}

export default function Analytics() {
  const [data, setData] = useState(seed);
  const [range, setRange] = useState("Last 7 Days");

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => ({
        verified: Math.round(jitter(prev.verified, 0.015)),
        active: Math.round(jitter(prev.active, 0.04)),
        confidence: Number(jitter(prev.confidence, 0.02).toFixed(2)),
        sources: {
          social: Math.round(jitter(prev.sources.social, 0.03)),
          news: Math.round(jitter(prev.sources.news, 0.05)),
          apis: Math.round(jitter(prev.sources.apis, 0.06)),
          citizen: Math.round(jitter(prev.sources.citizen, 0.08)),
        },
        events: prev.events.map((e) => ({ ...e, value: Math.max(4, Math.round(jitter(e.value, 0.06))) })),
        verify: prev.verify.map((e) => ({ ...e, value: Math.max(4, Math.round(jitter(e.value, 0.04))) })),
        series: prev.series.map((s) => ({
          ...s,
          total: Math.max(20, Math.round(jitter(s.total, 0.08))),
          verified: Math.max(10, Math.round(jitter(s.verified, 0.08))),
          unverified: Math.max(4, Math.round(jitter(s.unverified, 0.1))),
        })),
        states: prev.states.map((s) => ({
          ...s,
          total: Math.max(20, Math.round(jitter(s.total, 0.05))),
          pct: Math.max(2, Math.round(jitter(s.pct, 0.04))),
        })),
        tick: Date.now(),
      }));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const srcTotal = data.sources.social + data.sources.news + data.sources.apis + data.sources.citizen;
  const srcPie = useMemo(
    () => [
      { name: "Social Media", value: data.sources.social, color: "#3b82f6" },
      { name: "News", value: data.sources.news, color: "#38bdf8" },
      { name: "APIs", value: data.sources.apis, color: "#818cf8" },
      { name: "Citizen Reports", value: data.sources.citizen, color: "#94a3b8" },
    ],
    [data.sources]
  );

  const maxState = Math.max(...data.states.map((s) => s.total));

  return (
    <Shell>
      <PageHeader
        icon={<Activity className="h-5 w-5" />}
        title="Analytics"
        subtitle="Real-time insights and trends from weather data"
        extra={
          <div className="flex items-center gap-2">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm"
            >
              <option>Last 7 Days</option>
              <option>Last 24 Hours</option>
              <option>Last 30 Days</option>
            </select>
            <LivePill />
          </div>
        }
      />

      <p className="mb-4 text-[11px] text-slate-400">
        Mock stream refreshing every 3 seconds · last tick {new Date(data.tick).toLocaleTimeString("en-IN")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={<ShieldCheck className="h-4 w-4 text-blue-600" />}
          label="Verified Reports"
          value={data.verified.toLocaleString()}
          delta="+12%"
          up
        />
        <Kpi
          icon={<TriangleAlert className="h-4 w-4 text-rose-500" />}
          label="Active Incidents"
          value={String(data.active)}
          delta="+8%"
          up
        />
        <div className="card p-4">
          <div className="text-xs font-medium text-slate-500">Source Distribution</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-20 w-20">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={srcPie} dataKey="value" innerRadius={22} outerRadius={36} paddingAngle={2} stroke="none">
                    {srcPie.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-1 text-[11px] text-slate-500">
              {srcPie.map((s) => (
                <li key={s.name} className="flex justify-between">
                  <span>{s.name}</span>
                  <span className="font-semibold text-slate-700">{Math.round((s.value / srcTotal) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Kpi
          icon={<Brain className="h-4 w-4 text-violet-600" />}
          label="Avg. AI Confidence"
          value={data.confidence.toFixed(2)}
          delta="+6%"
          up
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="card p-4 lg:col-span-3">
          <h3 className="text-sm font-semibold text-slate-800">Incidents Over Time</h3>
          <div className="mt-2 flex gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <i className="h-2 w-2 rounded-full bg-blue-500" /> Total
            </span>
            <span className="flex items-center gap-1">
              <i className="h-2 w-2 rounded-full bg-sky-300" /> Verified
            </span>
            <span className="flex items-center gap-1">
              <i className="h-2 w-2 rounded-full bg-indigo-200" /> Unverified
            </span>
          </div>
          <div className="mt-2 h-56">
            <ResponsiveContainer>
              <AreaChart data={data.series}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="#2563eb" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="verified" stroke="#7dd3fc" fill="none" strokeWidth={2} />
                <Area type="monotone" dataKey="unverified" stroke="#c7d2fe" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800">Event Distribution</h3>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-44 w-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.events}
                    dataKey="value"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {data.events.map((_, i) => (
                      <Cell key={i} fill={EVENT_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 text-xs text-slate-600">
              {data.events.map((e, i) => (
                <li key={e.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <i className="h-2 w-2 rounded-full" style={{ background: EVENT_COLORS[i] }} />
                    {e.name}
                  </span>
                  <span className="font-semibold">{e.value}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-6 text-center text-[11px] text-slate-400">
            <div className="font-display text-lg font-bold text-slate-800">{data.verified.toLocaleString()}</div>
            Total Incidents
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-800">State-wise Activity</h3>
          <div className="mt-3 space-y-2.5">
            {data.states.map((s) => (
              <div key={s.state} className="grid grid-cols-[120px_1fr_40px_40px] items-center gap-2 text-xs">
                <span className="truncate text-slate-600">{s.state}</span>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                    style={{ width: `${(s.total / maxState) * 100}%` }}
                  />
                </div>
                <span className="text-right text-slate-400">{s.pct}%</span>
                <span className="text-right font-semibold text-slate-700">{s.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-800">Verification Outcomes</h3>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-44 w-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.verify} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="none">
                    {data.verify.map((_, i) => (
                      <Cell key={i} fill={VERIFY_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 text-xs">
              {data.verify.map((v, i) => (
                <li key={v.name} className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-2">
                    <i className="h-2 w-2 rounded-full" style={{ background: VERIFY_COLORS[i] }} />
                    {v.name}
                  </span>
                  <span className="font-semibold">{v.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Trend Analysis</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Trend icon={<CloudRain className="h-4 w-4 text-sky-600" />} title="Heavy Rain" text="Incidents increased by 45% compared to last week." />
          <Trend icon={<Waves className="h-4 w-4 text-cyan-600" />} title="Flood Alerts" text="Highest activity in Uttar Pradesh & Bihar." />
          <Trend icon={<ThermometerSun className="h-4 w-4 text-amber-500" />} title="Heatwave" text="Rising trend in central and western regions." />
          <Trend icon={<Wind className="h-4 w-4 text-violet-600" />} title="Cyclone" text="No new cyclone activity in the last 7 days." />
        </div>
      </div>
    </Shell>
  );
}

function Kpi({
  icon,
  label,
  value,
  delta,
  up,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  up?: boolean;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </div>
      <div key={value} className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-900 flash-num">
        {value}
      </div>
      <div className={`mt-1 text-[11px] font-semibold ${up ? "text-emerald-600" : "text-rose-500"}`}>
        {delta} <span className="font-normal text-slate-400">vs. previous 7 days</span>
      </div>
    </div>
  );
}

function Trend({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{text}</p>
    </div>
  );
}
