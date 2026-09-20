"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { MapAlert } from "@/components/LeafletMap";
import { Card, StatusBadge } from "@/components/ui";
import { EVENT_ICONS, timeAgo } from "@/lib/weather";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[560px] w-full place-items-center rounded-2xl border border-slate-200 bg-slate-100 text-sm text-slate-400">
      Loading interactive map…
    </div>
  ),
});

type ReportRow = MapAlert & { description: string; createdAt: string };

export default function MapPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const load = useCallback(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((rows: ReportRow[]) => {
        setReports(rows.filter((r) => r.status !== "rejected"));
        setRefreshedAt(new Date());
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 30_000);
    return () => window.clearInterval(id);
  }, [load]);

  const filtered = reports.filter((r) =>
    filter === "all" ? true : r.status === filter,
  );
  const selectedReport = reports.find((r) => r.id === selected) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Live Map</h1>
          <p className="text-sm text-slate-500">
            Current weather alerts and events across India
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 ring-1 ring-emerald-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live
          </span>
          <button
            onClick={load}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            ↻ Refresh
          </button>
          {refreshedAt && (
            <span className="text-[11px] text-slate-400">
              updated {refreshedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeafletMap
            alerts={filtered}
            selectedId={selected}
            onSelect={(id: number) => setSelected(id)}
          />
          {selectedReport && (
            <Card className="mt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xl">
                    {EVENT_ICONS[selectedReport.eventType] ?? "🌦️"}
                  </span>
                  <div>
                    <p className="text-sm font-bold">
                      {selectedReport.eventType} — {selectedReport.city}
                    </p>
                    <p className="text-xs text-slate-500">{selectedReport.location}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {selectedReport.description}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {timeAgo(selectedReport.createdAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={selectedReport.status} />
              </div>
            </Card>
          )}
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Active Alerts</h2>
            <div className="flex rounded-full bg-slate-100 p-0.5 text-[11px] font-bold">
              {(["all", "verified", "pending"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-2.5 py-1 capitalize ${
                    filter === f ? "bg-white text-blue-700 shadow" : "text-slate-500"
                  }`}
                >
                  {f === "pending" ? "Unverified" : f}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {filtered.length === 0 && (
              <p className="text-sm text-slate-500">No active alerts.</p>
            )}
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  selected === r.id
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        r.status === "verified" ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {r.eventType} — {r.city}
                  </p>
                  <span className="text-lg">{EVENT_ICONS[r.eventType] ?? "🌦️"}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {r.status === "verified" ? "Verified" : "Unverified"} ·{" "}
                  {timeAgo(r.createdAt)}
                </p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
