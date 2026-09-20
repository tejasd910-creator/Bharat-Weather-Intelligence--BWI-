"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, StatusBadge } from "@/components/ui";
import { useApp } from "@/lib/store";
import { EVENT_ICONS, timeAgo } from "@/lib/weather";

type ReportRow = {
  id: number;
  reporterName: string;
  eventType: string;
  city: string;
  location: string;
  description: string;
  imageData: string | null;
  status: string;
  createdAt: string;
};

export default function VerifyPage() {
  const { role, setRole } = useApp();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [tab, setTab] = useState<"pending" | "verified" | "rejected">("pending");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetch("/api/reports?images=1")
      .then((r) => r.json())
      .then((rows: ReportRow[]) => setReports(rows))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: number, status: "verified" | "rejected" | "pending") {
    setBusyId(id);
    try {
      await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    } finally {
      setBusyId(null);
    }
  }

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-xl font-extrabold">Admin access required</h1>
        <p className="mt-2 text-sm text-slate-500">
          Switch to the Admin role to review and verify citizen reports.
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

  const counts = {
    pending: reports.filter((r) => r.status === "pending").length,
    verified: reports.filter((r) => r.status === "verified").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  };

  const visible = reports.filter(
    (r) =>
      r.status === tab &&
      (query.trim() === "" ||
        `${r.eventType} ${r.city} ${r.location} ${r.description} ${r.reporterName}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Verification Panel</h1>
          <p className="text-sm text-slate-500">
            Review and verify citizen reports and flagged posts
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search reports…"
          className="w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div className="mt-5 flex gap-2">
        {(["pending", "verified", "rejected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
              tab === t
                ? t === "pending"
                  ? "bg-amber-500 text-white"
                  : t === "verified"
                    ? "bg-emerald-600 text-white"
                    : "bg-rose-600 text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      <Card className="mt-4 p-0">
        {visible.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            No {tab} reports{query ? " matching your search" : ""}.
          </p>
        )}
        <ul className="divide-y divide-slate-100">
          {visible.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              {r.imageData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.imageData}
                  alt={r.eventType}
                  className="h-16 w-24 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="grid h-16 w-24 shrink-0 place-items-center rounded-lg bg-slate-100 text-3xl">
                  {EVENT_ICONS[r.eventType] ?? "🌦️"}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold">{r.description.slice(0, 70)}{r.description.length > 70 ? "…" : ""}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  📍 {r.location}, {r.city} · <span className="font-semibold">{r.eventType}</span> ·
                  by {r.reporterName} · {timeAgo(r.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {r.status !== "verified" && (
                  <button
                    disabled={busyId === r.id}
                    onClick={() => updateStatus(r.id, "verified")}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    ✓ Verify
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    disabled={busyId === r.id}
                    onClick={() => updateStatus(r.id, "rejected")}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    ✕ Reject
                  </button>
                )}
                {r.status !== "pending" && (
                  <button
                    disabled={busyId === r.id}
                    onClick={() => updateStatus(r.id, "pending")}
                    className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-300 disabled:opacity-50"
                  >
                    ↩ Re-queue
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
