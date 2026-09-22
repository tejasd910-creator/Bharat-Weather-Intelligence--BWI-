import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Brain,
  Copy,
  Newspaper,
  Radio,
  ShieldAlert,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { LivePill, PageHeader, Shell, StatusChip } from "../components/Layout";
import { EventGlyph } from "../components/WeatherGlyph";
import { formatAgo, makeSocialPost, seedSocialFeed } from "../lib/data";
import type { SocialPost } from "../lib/types";

const PLATFORM_STYLE: Record<SocialPost["platform"], string> = {
  X: "bg-slate-900 text-white",
  News: "bg-amber-100 text-amber-800",
  Citizen: "bg-emerald-100 text-emerald-800",
  API: "bg-indigo-100 text-indigo-800",
  Facebook: "bg-blue-100 text-blue-800",
  YouTube: "bg-rose-100 text-rose-800",
};

export default function Ingestion() {
  const [posts, setPosts] = useState<SocialPost[]>(() => seedSocialFeed(16));
  const [filter, setFilter] = useState<"All" | SocialPost["platform"]>("All");
  const [selected, setSelected] = useState<SocialPost | null>(null);
  const [ingested, setIngested] = useState(18420);
  const [rate, setRate] = useState(42);

  useEffect(() => {
    const id = setInterval(() => {
      const next = makeSocialPost(0);
      setPosts((p) => [next, ...p].slice(0, 40));
      setSelected((s) => s ?? next);
      setIngested((n) => n + Math.floor(1 + Math.random() * 4));
      setRate(28 + Math.floor(Math.random() * 40));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selected && posts[0]) setSelected(posts[0]);
  }, [posts, selected]);

  const visible = filter === "All" ? posts : posts.filter((p) => p.platform === filter);
  const avgTrust = useMemo(
    () => (posts.reduce((a, p) => a + p.trustScore, 0) / Math.max(1, posts.length)).toFixed(2),
    [posts]
  );
  const fakePct = useMemo(
    () => Math.round((posts.filter((p) => p.fakeScore > 0.4).length / Math.max(1, posts.length)) * 100),
    [posts]
  );

  const ticker = posts.slice(0, 12);

  return (
    <Shell>
      <PageHeader
        icon={<Radio className="h-5 w-5" />}
        title="Social Media Ingestion"
        subtitle="Live mock stream of social, news and citizen reports with AI scoring"
        extra={
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
              {rate} msgs/sec
            </span>
            <LivePill />
          </div>
        }
      />

      <div className="mb-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-900 py-2">
        <div className="ticker-track flex w-max gap-8 whitespace-nowrap px-4 text-xs text-sky-100">
          {[...ticker, ...ticker].map((p, i) => (
            <span key={p.id + i} className="inline-flex items-center gap-2">
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold">{p.platform}</span>
              <span className="text-sky-300">{p.location}</span>
              <span className="max-w-[360px] truncate text-slate-200">{p.text}</span>
              <span className="text-emerald-300">AI {p.aiScore.toFixed(2)}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Mini label="Documents ingested" value={ingested.toLocaleString()} hint="Kafka topic raw-reports" />
        <Mini label="Avg trust score" value={avgTrust} hint="Ensemble of 5 models" />
        <Mini label="Flagged misleading" value={`${fakePct}%`} hint="Fake / recycled media" />
        <Mini label="Live window" value={`${posts.length} posts`} hint="Last ~15 minutes" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["All", "X", "News", "Citizen", "API", "Facebook", "YouTube"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === p ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-2">
          {visible.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`card w-full p-4 text-left transition ${
                selected?.id === p.id ? "ring-2 ring-blue-400" : "hover:border-slate-200"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${PLATFORM_STYLE[p.platform]}`}>
                  {p.platform}
                </span>
                <span className="text-sm font-semibold text-slate-800">{p.author}</span>
                <span className="text-xs text-slate-400">{p.handle}</span>
                <span className="ml-auto text-[11px] text-slate-400">{formatAgo(p.timestamp)}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{p.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                  <EventGlyph type={p.eventType} className="h-3 w-3" /> {p.location}, {p.state}
                </span>
                <Score label="AI" v={p.aiScore} />
                <Score label="Trust" v={p.trustScore} />
                <Score label="Fake risk" v={p.fakeScore} invert />
                <StatusChip status={p.status} />
              </div>
            </button>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          {selected && <AiPanel post={selected} />}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-800">Ingestion connectors</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <Conn icon={<Newspaper className="h-4 w-4" />} name="News RSS / scrapers" ok="1.2k/min" />
              <Conn icon={<Activity className="h-4 w-4" />} name="X firehose (mock)" ok="860/min" />
              <Conn icon={<Smartphone className="h-4 w-4" />} name="Citizen REST API" ok="140/min" />
              <Conn icon={<Sparkles className="h-4 w-4" />} name="IMD / Open-Meteo APIs" ok="72/min" />
            </ul>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function Mini({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-display mt-1 text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-400">{hint}</div>
    </div>
  );
}

function Score({ label, v, invert }: { label: string; v: number; invert?: boolean }) {
  const good = invert ? v < 0.35 : v > 0.75;
  const warn = invert ? v < 0.55 : v > 0.6;
  const cls = good ? "text-emerald-600 bg-emerald-50" : warn ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {label} {v.toFixed(2)}
    </span>
  );
}

function Conn({ icon, name, ok }: { icon: React.ReactNode; name: string; ok: string }) {
  return (
    <li className="flex items-center gap-2 text-slate-600">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-50 text-slate-500">{icon}</span>
      <span className="flex-1">{name}</span>
      <span className="text-[11px] font-semibold text-emerald-600">{ok}</span>
    </li>
  );
}

function AiPanel({ post }: { post: SocialPost }) {
  const rows = [
    { icon: Brain, label: "Event classification", v: post.classified, score: post.aiScore },
    { icon: ShieldAlert, label: "Fake / misleading", v: post.fakeScore > 0.4 ? "Flagged" : "Clean", score: 1 - post.fakeScore },
    { icon: Copy, label: "Duplicate detection", v: post.duplicateScore > 0.5 ? "Possible dup" : "Unique", score: 1 - post.duplicateScore },
    { icon: Sparkles, label: "Trust score", v: post.trustScore.toFixed(2), score: post.trustScore },
    { icon: Activity, label: "Severity", v: post.severity, score: post.severity === "High" ? 0.9 : post.severity === "Medium" ? 0.6 : 0.3 },
  ];
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-slate-800">AI scoring · {post.id}</h3>
      <p className="mt-1 text-[11px] text-slate-400">
        Models: classifier · NLI fake-news · minhash dupes · trust ensemble · severity
      </p>
      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <r.icon className="h-3.5 w-3.5 text-blue-500" /> {r.label}
              </span>
              <span className="font-semibold text-slate-800">{r.v}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                style={{ width: `${Math.round(r.score * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        Sentiment <span className="font-semibold text-slate-800">{post.sentiment}</span>
        {" · "}
        Keywords {post.keywords.map((k) => `#${k}`).join(" ")}
      </div>
    </div>
  );
}
