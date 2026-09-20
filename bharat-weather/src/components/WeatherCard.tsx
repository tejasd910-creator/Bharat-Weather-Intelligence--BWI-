"use client";

import { useEffect, useState } from "react";
import type { WeatherInfo } from "@/lib/weather";

export function useWeather(city: string) {
  const [data, setData] = useState<WeatherInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const json = await res.json();
        if (!alive) return;
        if (!res.ok) {
          setError(json.error ?? "Failed to load weather");
          setData(null);
        } else {
          setData(json);
          setError(null);
        }
      } catch {
        if (alive) setError("Failed to load weather");
      } finally {
        if (alive) setLoading(false);
      }
    }
    setLoading(true);
    load();
    const id = window.setInterval(load, 120_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [city]);

  return { data, error, loading };
}

export function CityWeatherCard({
  city,
  image,
  compact = false,
}: {
  city: string;
  image?: string;
  compact?: boolean;
}) {
  const { data, loading } = useWeather(city);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-300 group-hover:opacity-20"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className={`relative ${compact ? "p-4" : "p-5"}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">{data?.city ?? city}</p>
            <p className="text-xs text-slate-500">
              {loading ? "Loading…" : data?.condition ?? "—"}
            </p>
          </div>
          <span className="text-2xl">{loading ? "⏳" : data?.icon ?? "🌤️"}</span>
        </div>
        <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
          {data ? `${data.temp}°C` : "--°C"}
        </p>
        <div className="mt-2 flex items-center gap-3 text-[11px] font-medium text-slate-500">
          <span>H: {data ? `${data.tmax}°` : "--"}</span>
          <span>L: {data ? `${data.tmin}°` : "--"}</span>
          <span>💧 {data ? `${data.humidity}%` : "--"}</span>
          <span>💨 {data ? `${data.wind} km/h` : "--"}</span>
        </div>
        {data?.isMock && (
          <p className="mt-2 text-[10px] text-amber-500">offline · showing typical values</p>
        )}
      </div>
    </div>
  );
}
