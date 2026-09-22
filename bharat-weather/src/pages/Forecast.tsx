import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CloudRain,
  Droplets,
  Gauge,
  RefreshCw,
  Sun,
  Sunrise,
  Sunset,
  Wind,
} from "lucide-react";
import { LivePill, PageHeader, Shell } from "../components/Layout";
import { WeatherGlyph } from "../components/WeatherGlyph";
import { useApp } from "../lib/context";
import { CITIES } from "../lib/data";
import { fetchCityWeather, weatherLabel, weatherShort } from "../lib/weather";
import type { CityWeather } from "../lib/types";

export default function Forecast() {
  const { weather, weatherLoading, weatherError, refreshWeather } = useApp();
  const [cityId, setCityId] = useState("delhi");
  const [detail, setDetail] = useState<CityWeather | null>(null);
  const [loading, setLoading] = useState(false);

  const fromCtx = weather.find((w) => w.city.id === cityId) || null;

  useEffect(() => {
    const city = CITIES.find((c) => c.id === cityId);
    if (!city) return;
    setLoading(true);
    fetchCityWeather(city)
      .then(setDetail)
      .catch(() => setDetail(fromCtx))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId]);

  const w = detail || fromCtx;
  const current = w?.current;
  const hourly = useMemo(() => {
    const now = Date.now();
    return (w?.hourly || [])
      .filter((h) => new Date(h.time).getTime() >= now - 60 * 60 * 1000)
      .slice(0, 24)
      .map((h) => ({
        ...h,
        label: new Date(h.time).toLocaleTimeString("en-IN", { hour: "2-digit" }),
      }));
  }, [w]);

  return (
    <Shell>
      <PageHeader
        icon={<Sun className="h-5 w-5" />}
        title="Live Weather Forecast"
        subtitle="Powered by the Open-Meteo Forecast API · Asia/Kolkata"
        extra={
          <div className="flex items-center gap-2">
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.state}
                </option>
              ))}
            </select>
            <button
              onClick={refreshWeather}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${weatherLoading || loading ? "animate-spin" : ""}`} />
            </button>
            <LivePill />
          </div>
        }
      />

      {weatherError && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Open-Meteo request failed ({weatherError}). Showing cached or last known values when available.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="card relative overflow-hidden p-6">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sky-100" />
          <div className="relative">
            <div className="text-sm font-medium text-slate-500">
              {w?.city.name}, {w?.city.state}
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <WeatherGlyph code={current?.weatherCode ?? 2} className="h-16 w-16" isDay={current?.isDay} />
              <div className="font-display text-6xl font-extrabold tracking-tight text-slate-900">
                {current ? Math.round(current.temperature) : "--"}°
              </div>
              <div className="pb-2">
                <div className="text-lg font-semibold text-slate-700">
                  {current ? weatherLabel(current.weatherCode) : "Loading"}
                </div>
                <div className="text-sm text-slate-500">
                  Feels like {current ? Math.round(current.apparent) : "--"}°C
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Chip icon={<Droplets className="h-4 w-4 text-sky-500" />} k="Humidity" v={`${current ? Math.round(current.humidity) : "--"}%`} />
              <Chip icon={<Wind className="h-4 w-4 text-slate-500" />} k="Wind" v={`${current ? Math.round(current.windSpeed) : "--"} km/h`} />
              <Chip icon={<CloudRain className="h-4 w-4 text-blue-500" />} k="Precip" v={`${current ? current.precipitation : "--"} mm`} />
              <Chip icon={<Gauge className="h-4 w-4 text-violet-500" />} k="Pressure" v={`${current ? Math.round(current.pressure) : "--"} hPa`} />
            </div>
            {w?.daily[0] && (
              <div className="mt-4 flex gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Sunrise className="h-3.5 w-3.5 text-amber-500" />
                  {new Date(w.daily[0].sunrise).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Sunset className="h-3.5 w-3.5 text-orange-500" />
                  {new Date(w.daily[0].sunset).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span>UV {w.daily[0].uv.toFixed(1)}</span>
                <span>Cloud {current ? Math.round(current.cloudCover) : "--"}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-800">7-day outlook</h3>
          <div className="mt-2 divide-y divide-slate-50">
            {(w?.daily || []).map((d) => (
              <div key={d.date} className="flex items-center gap-3 py-2">
                <div className="w-16 text-xs font-medium text-slate-500">
                  {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" })}
                </div>
                <WeatherGlyph code={d.weatherCode} className="h-6 w-6" />
                <div className="flex-1 text-xs text-slate-500">{weatherShort(d.weatherCode)}</div>
                <div className="text-xs text-sky-600">{Math.round(d.precipProb)}%</div>
                <div className="w-16 text-right text-sm font-semibold text-slate-800">
                  {Math.round(d.tMax)}° / {Math.round(d.tMin)}°
                </div>
              </div>
            ))}
            {!w?.daily.length && <div className="shimmer h-48 rounded-xl" />}
          </div>
        </div>
      </div>

      <div className="mt-4 card p-4">
        <h3 className="text-sm font-semibold text-slate-800">Next 24 hours · temperature & rain chance</h3>
        <div className="mt-3 h-56">
          {hourly.length ? (
            <ResponsiveContainer>
              <AreaChart data={hourly}>
                <defs>
                  <linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="t" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="p" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area yAxisId="t" type="monotone" dataKey="temperature" name="Temp °C" stroke="#f59e0b" fill="url(#t)" strokeWidth={2} />
                <Area yAxisId="p" type="monotone" dataKey="precipProb" name="Rain %" stroke="#3b82f6" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="shimmer h-full rounded-xl" />
          )}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Cities across India · live</h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {weather.map((cw) => (
            <button
              key={cw.city.id}
              onClick={() => setCityId(cw.city.id)}
              className={`card p-3 text-left hover:border-blue-200 ${
                cityId === cw.city.id ? "ring-2 ring-blue-400" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{cw.city.name}</div>
                  <div className="text-[11px] text-slate-400">{cw.city.state}</div>
                </div>
                <WeatherGlyph code={cw.current?.weatherCode ?? 2} className="h-7 w-7" />
              </div>
              <div className="mt-2 font-display text-2xl font-bold">
                {cw.current ? Math.round(cw.current.temperature) : "--"}°
              </div>
              <div className="text-[11px] text-slate-500">
                {cw.current ? weatherShort(cw.current.weatherCode) : "…"} · {cw.current ? Math.round(cw.current.humidity) : "--"}%
              </div>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Chip({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        {icon} {k}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-slate-800">{v}</div>
    </div>
  );
}
