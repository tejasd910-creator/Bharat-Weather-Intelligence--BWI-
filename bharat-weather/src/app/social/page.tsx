"use client";

import { useState } from "react";
import { Card, ClassBadge } from "@/components/ui";
import { AiScoreCard } from "@/components/AiScoreCard";
import { useApp } from "@/lib/store";
import { timeAgo } from "@/lib/weather";

export default function SocialPage() {
  const { posts, totals } = useApp();
  const [filter, setFilter] = useState<"all" | "relevant" | "fake" | "other">("all");

  const pct = (n: number) =>
    totals.total ? `${((n / totals.total) * 100).toFixed(1)}%` : "0%";

  const stats = [
    { label: "Total Posts", value: totals.total, sub: "ingesting live · +1 / 5s", color: "border-blue-200 bg-blue-50 text-blue-700", icon: "📊" },
    { label: "Relevant", value: totals.relevant, sub: pct(totals.relevant), color: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: "✅" },
    { label: "Fake", value: totals.fake, sub: pct(totals.fake), color: "border-rose-200 bg-rose-50 text-rose-700", icon: "❌" },
    { label: "Others", value: totals.other, sub: pct(totals.other), color: "border-slate-200 bg-slate-50 text-slate-700", icon: "📎" },
  ];

  const filtered = posts.filter((p) =>
    filter === "all" ? true : p.classification === filter,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Live Social Media Weather Posts</h1>
          <p className="text-sm text-slate-500">
            Real-time ingestion and AI classification of weather-related posts (mock
            stream, new post every 5 seconds)
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 ring-1 ring-emerald-200">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Ingesting
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border p-5 shadow-sm ${s.color}`}
          >
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <span>{s.icon}</span> {s.label}
            </p>
            <p className="mt-2 text-3xl font-extrabold tabular-nums">
              {s.value.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] font-semibold opacity-70">{s.sub}</p>
          </div>
        ))}
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">Recent Posts</h2>
          <div className="flex rounded-full bg-slate-100 p-0.5 text-[11px] font-bold">
            {(["all", "relevant", "fake", "other"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1.5 capitalize ${
                  filter === f ? "bg-white text-blue-700 shadow" : "text-slate-500"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500">Waiting for posts…</p>
          )}
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className={`rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 ${
                i === 0 && filter === "all" ? "animate-pulse-once ring-1 ring-blue-200" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: `hsl(${p.avatarHue} 70% 45%)` }}
                  >
                    {p.handle.charAt(1).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      {p.handle}{" "}
                      <span className="font-medium text-slate-400">· {p.city}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">{p.text}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {timeAgo(new Date(p.time))}
                    </p>
                  </div>
                </div>
                <ClassBadge c={p.classification} />
              </div>
              <AiScoreCard ai={p.ai} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
