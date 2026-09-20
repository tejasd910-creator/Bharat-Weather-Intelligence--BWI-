"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { CityWeatherCard } from "@/components/WeatherCard";
import { Card } from "@/components/ui";
import type { WeatherInfo } from "@/lib/weather";

const POPULAR = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad"];

export default function WeatherClient() {
  const params = useSearchParams();
  const initial = params.get("city") ?? "";
  const [query, setQuery] = useState(initial);
  const [result, setResult] = useState<WeatherInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(city: string) {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city.trim())}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "City not found");
        setResult(null);
      } else {
        setResult(json);
      }
    } catch {
      setError("Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initial) search(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    search(query);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Live Weather</h1>
          <p className="text-sm text-slate-500">
            Real-time weather updates for your favorite cities — powered by Open-Meteo
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any city…"
            className="w-64 px-4 py-2.5 text-sm outline-none"
          />
          <button className="bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
            Search
          </button>
        </form>
      </div>

      {/* Search result */}
      {(loading || error || result) && (
        <Card className="mt-6">
          {loading && <p className="text-sm text-slate-500">Fetching live weather…</p>}
          {error && <p className="text-sm font-semibold text-rose-500">⚠️ {error}</p>}
          {result && !loading && (
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <span className="text-6xl">{result.icon}</span>
                <div>
                  <h2 className="text-2xl font-extrabold">
                    {result.city}
                    {result.country ? `, ${result.country}` : ""}
                  </h2>
                  <p className="text-sm font-semibold text-slate-500">{result.condition}</p>
                  {result.isMock && (
                    <p className="text-xs text-amber-500">offline mode · typical values shown</p>
                  )}
                </div>
              </div>
              <p className="text-6xl font-extrabold tracking-tight">{result.temp}°C</p>
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                {[
                  ["Feels Like", `${result.feelsLike}°C`],
                  ["Humidity", `${result.humidity}%`],
                  ["Wind", `${result.wind} km/h`],
                  ["High / Low", `${result.tmax}° / ${result.tmin}°`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{k}</p>
                    <p className="mt-1 text-base font-bold">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <h2 className="mt-8 text-base font-bold">Popular Indian Cities</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {POPULAR.map((c) => (
          <CityWeatherCard key={c} city={c} />
        ))}
      </div>
    </div>
  );
}
