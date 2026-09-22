import { useMemo, useState } from "react";
import { Clock, LocateFixed, Map as MapIcon, ShieldCheck, TriangleAlert } from "lucide-react";
import { LeafletMap } from "../components/LeafletMap";
import { LivePill, PageHeader, Shell, StatusChip, WsPill } from "../components/Layout";
import { EventGlyph } from "../components/WeatherGlyph";
import { useApp } from "../lib/context";
import { EVENT_META, STATES, minutesLabel } from "../lib/data";
import type { EventType, VerificationStatus } from "../lib/types";

const EVENT_TYPES: EventType[] = ["Heavy Rain", "Flood", "Cyclone", "Heatwave", "Active Incident"];
const STATUSES: VerificationStatus[] = ["Verified", "Under Review", "Unverified"];

export default function LiveMap() {
  const { incidents } = useApp();
  const [events, setEvents] = useState<EventType[]>([...EVENT_TYPES]);
  const [status, setStatus] = useState<VerificationStatus[]>([...STATUSES]);
  const [state, setState] = useState("All States");
  const [layer, setLayer] = useState<"rain" | "flood" | "heat">("heat");
  const [selected, setSelected] = useState<string | null>(incidents[0]?.id ?? null);

  const filtered = useMemo(
    () =>
      incidents.filter(
        (i) =>
          events.includes(i.type) &&
          status.includes(i.status) &&
          (state === "All States" || i.state === state)
      ),
    [events, status, state, incidents]
  );

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <Shell>
      <PageHeader
        icon={<MapIcon className="h-5 w-5" />}
        title="Live Map"
        subtitle="Real-time view of weather-related incidents across India"
        extra={
          <div className="flex items-center gap-2">
            <LivePill />
            <WsPill />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr_300px]">
        <aside className="card p-4">
          <h3 className="text-sm font-semibold text-slate-800">Filters</h3>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Event Type</p>
          <div className="mt-2 space-y-1.5">
            {EVENT_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={events.includes(t)}
                  onChange={() => toggle(events, t, setEvents)}
                  className="accent-blue-600"
                />
                <EventGlyph type={t} className="h-3.5 w-3.5" />
                {t === "Flood" ? "Flood Alerts" : t}
              </label>
            ))}
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">State / Region</p>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Date & Time</p>
          <input
            type="text"
            defaultValue="01 Apr 2025 – 30 Apr 2025"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option>00:00 – 23:59</option>
            <option>Last 6 hours</option>
            <option>Last 24 hours</option>
          </select>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Verification Status</p>
          <div className="mt-2 space-y-1.5">
            {STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={status.includes(s)}
                  onChange={() => toggle(status, s, setStatus)}
                  className="accent-blue-600"
                />
                {s}
              </label>
            ))}
          </div>

          <button
            onClick={() => {
              setEvents([...EVENT_TYPES]);
              setStatus([...STATUSES]);
              setState("All States");
            }}
            className="mt-5 w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setEvents([...EVENT_TYPES]);
              setStatus([...STATUSES]);
              setState("All States");
            }}
            className="mt-2 w-full text-center text-sm text-slate-500 hover:text-slate-700"
          >
            Reset
          </button>
        </aside>

        <section className="card relative overflow-hidden p-3">
          <div className="absolute left-4 top-4 z-10 flex gap-1 rounded-full bg-white/90 p-1 shadow-sm">
            {(
              [
                ["rain", "Rainfall"],
                ["flood", "Flood"],
                ["heat", "Heatmap"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setLayer(k)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  layer === k ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="relative z-0 h-[520px] overflow-hidden rounded-xl sm:h-[640px]">
            <LeafletMap incidents={filtered} selected={selected} onSelect={setSelected} layer={layer} />
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <p className="text-[11px] font-semibold text-slate-500">Incident Legend</p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600">
                {EVENT_TYPES.map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <EventGlyph type={t} className="h-3.5 w-3.5" /> {t}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">Rainfall intensity</p>
              <div className="mt-1 h-1.5 w-40 rounded-full bg-gradient-to-r from-sky-200 via-sky-500 to-blue-800" />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400">
              <div className="mb-1 flex gap-3">
                <span>0</span>
                <span>250</span>
                <span>500</span>
                <span>750 km</span>
              </div>
              <div className="h-1 w-40 bg-slate-300" />
            </div>
          </div>
        </section>

        <aside className="card flex max-h-[760px] flex-col p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Live Incident Feed</h3>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
              {filtered.length} now
            </span>
          </div>
          <div className="space-y-2 overflow-y-auto pr-1">
            {filtered.map((i) => (
              <button
                key={i.id}
                onClick={() => setSelected(i.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  selected === i.id ? "border-blue-300 bg-blue-50/50" : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 grid h-8 w-8 place-items-center rounded-lg ${EVENT_META[i.type].bg}`}>
                    <EventGlyph type={i.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800">
                      {i.type === "Flood" ? "Flood Alert" : i.type}
                    </div>
                    <div className="text-xs text-slate-500">
                      {i.city}, {i.state}
                    </div>
                    <div className="text-[11px] text-slate-400">{minutesLabel(i.minutesAgo)}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <StatusChip status={i.status} />
                  {i.citizen && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Citizen
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<TriangleAlert className="h-4 w-4 text-rose-500" />} label="Total Live Incidents" value="138" delta="-12% from last hour" />
        <Stat icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />} label="Verified Reports" value="102" delta="+8% from last hour" />
        <Stat icon={<LocateFixed className="h-4 w-4 text-blue-600" />} label="Active States" value="24" delta="out of 28" />
        <Stat icon={<Clock className="h-4 w-4 text-slate-500" />} label="Last Update" value="Live" delta={new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} live />
      </div>
    </Shell>
  );
}

function Stat({
  icon,
  label,
  value,
  delta,
  live,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  live?: boolean;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50">{icon}</div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-display text-2xl font-bold text-slate-900">{value}</div>
        <div className={`text-[11px] ${live ? "text-emerald-600" : "text-slate-400"}`}>{delta}</div>
      </div>
    </div>
  );
}
