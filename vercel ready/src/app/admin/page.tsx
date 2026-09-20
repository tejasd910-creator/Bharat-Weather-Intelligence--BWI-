"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { CityBar, TrendChart, TypeDonut } from "@/components/Charts";
import { useWeather } from "@/components/WeatherCard";
import { useApp } from "@/lib/store";

type Stats = {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  byType: Record<string, number>;
  byCity: Record<string, number>;
  trend: { label: string; count: number }[];
};

function WeatherRow({ city }: { city: string }) {
  const { data } = useWeather(city);
  return (
    <tr className="border-t border-slate-100 text-sm">
      <td className="py-2.5 font-bold">{city}</td>
      <td>{data ? `${data.temp}°C` : "--"}</td>
      <td>{data ? `${data.humidity}%` : "--"}</td>
      <td>{data ? `${data.wind} km/h` : "--"}</td>
      <td className="text-slate-500">
        {data ? `${data.icon} ${data.condition}` : "--"}
      </td>
    </tr>
  );
}

export default function AdminDashboard() {
  const { role, setRole, totals } = useApp();
  const [stats, setStats] = useState<Stats | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const load = () =>
      fetch("/api/stats")
        .then((r) => r.json())
        .then((s: Stats) => {
          setStats(s);
          setUpdatedAt(new Date());
        })
        .catch(() => {});
    load();
    const id = window.setInterval(load, 15_000);
    return () => window.clearInterval(id);
  }, []);

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-xl font-extrabold">Admin access required</h1>
        <p className="mt-2 text-sm text-slate-500">
          Switch to the Admin role to open the analytics dashboard and
          verification panel.
        </p>
        <button
          onClick={() => setRole("admin")}
          className="mt-5 rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
        >
          Switch to Admin
        </button>
      </div>
    );
  }

  const kpis = [
    { label: "Total Reports", value: stats?.total ?? 0, icon: "📊", color: "text-blue-600 bg-blue-50 ring-blue-200" },
    { label: "Verified Reports", value: stats?.verified ?? 0, icon: "✅", color: "text-emerald-600 bg-emerald-50 ring-emerald-200" },
    { label: "Unverified Reports", value: stats?.pending ?? 0, icon: "🕓", color: "text-amber-600 bg-amber-50 ring-amber-200" },
    { label: "Rejected / Fake", value: stats?.rejected ?? 0, icon: "❌", color: "text-rose-600 bg-rose-50 ring-rose-200" },
  ];

  const typeData = Object.entries(stats?.byType ?? {}).map(([name, value]) => ({ name, value }));
  const cityData = Object.entries(stats?.byCity ?? {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const socialData = [
    { name: "Relevant", value: totals.relevant },
    { name: "Fake", value: totals.fake },
    { name: "Others", value: totals.other },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Real-time insights and system overview</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 ring-1 ring-emerald-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live
          </span>
          {updatedAt && (
            <span className="text-[11px] text-slate-400">
              Last updated: {updatedAt.toLocaleTimeString()}
            </span>
          )}
          <Link
            href="/admin/verify"
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
          >
            Open Verification Panel →
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <p className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${k.color}`}>
              {k.icon} {k.label}
            </p>
            <p className="mt-3 text-3xl font-extrabold tabular-nums">{k.value}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-400">
              {stats && stats.total > 0
                ? `${((k.value / stats.total) * 100).toFixed(0)}% of total`
                : "—"}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-bold">Weather Events Trend (24h)</h2>
          <p className="text-[11px] text-slate-400">Citizen reports in 4-hour buckets</p>
          <div className="mt-3">
            <TrendChart data={stats?.trend ?? []} />
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-bold">Event Distribution</h2>
          <p className="text-[11px] text-slate-400">Reports by event type</p>
          <TypeDonut data={typeData} centerLabel={String(stats?.total ?? 0)} />
        </Card>
        <Card>
          <h2 className="text-base font-bold">Reports by City</h2>
          <p className="text-[11px] text-slate-400">Top reporting cities</p>
          <div className="mt-3">
            <CityBar data={cityData} />
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-bold">Social Media Classification</h2>
          <p className="text-[11px] text-slate-400">
            Live ingested posts ({totals.total.toLocaleString()} total)
          </p>
          <TypeDonut data={socialData} centerLabel={totals.total.toLocaleString()} />
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-base font-bold">Real-time Weather Data Table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <th className="pb-2">City</th>
                <th className="pb-2">Temp (°C)</th>
                <th className="pb-2">Humidity (%)</th>
                <th className="pb-2">Wind (km/h)</th>
                <th className="pb-2">Condition</th>
              </tr>
            </thead>
            <tbody>
              {["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"].map((c) => (
                <WeatherRow key={c} city={c} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
