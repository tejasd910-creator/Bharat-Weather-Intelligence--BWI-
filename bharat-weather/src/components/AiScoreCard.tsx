"use client";

import type { AiAnalysis, Sentiment } from "@/lib/social";

function barColor(v: number, invert = false) {
  const good = invert ? v < 40 : v >= 70;
  const mid = v >= 40 && v < 70;
  if (good) return "bg-emerald-500";
  if (mid) return "bg-amber-500";
  return "bg-rose-500";
}

function Metric({
  label,
  value,
  invert = false,
}: {
  label: string;
  value: number;
  invert?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
        <span>{label}</span>
        <span className="tabular-nums text-slate-700">{value}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${barColor(value, invert)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const SENTIMENT_STYLE: Record<Sentiment, { label: string; cls: string }> = {
  positive: { label: "😊 Positive", cls: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
  neutral: { label: "😐 Neutral", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
  negative: { label: "☹️ Negative", cls: "bg-amber-50 text-amber-600 ring-amber-200" },
  panic: { label: "😱 Panic / Alarmist", cls: "bg-rose-50 text-rose-600 ring-rose-200" },
};

export function AiScoreCard({ ai }: { ai: AiAnalysis }) {
  const sent = SENTIMENT_STYLE[ai.sentiment];
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-indigo-600">
          <span>🧠</span> AI Analysis
        </p>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 ring-1 ring-indigo-200">
          {ai.confidence}% confidence
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
        <Metric label="Relevance" value={ai.relevance} />
        <Metric label="Credibility" value={ai.credibility} />
        <Metric label="Severity" value={ai.severity} />
        <Metric label="Bot Likelihood" value={ai.botLikelihood} invert />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${sent.cls}`}>
          {sent.label}
        </span>
        {ai.isDuplicate && (
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-600 ring-1 ring-violet-200">
            ♻️ Duplicate
          </span>
        )}
        {ai.keywords.map((k) => (
          <span
            key={k}
            className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 ring-1 ring-blue-200"
          >
            #{k}
          </span>
        ))}
      </div>
    </div>
  );
}
