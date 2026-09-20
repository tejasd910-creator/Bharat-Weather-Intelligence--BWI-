"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";

type Stage = {
  id: number;
  name: string;
  color: string;
  chip: string;
  icon: string;
  items: string[];
  detail: string;
};

const STAGES: Stage[] = [
  { id: 1, name: "Data Sources", color: "border-green-500", chip: "bg-green-600", icon: "🛰️", items: ["Social Media", "Weather APIs", "Websites / News", "Public Datasets", "Citizen App"], detail: "Raw signals enter the platform from social networks, official weather APIs (IMD / Open-Meteo), news portals, open public datasets and the citizen mobile/web app." },
  { id: 2, name: "Ingestion Services", color: "border-orange-500", chip: "bg-orange-500", icon: "📥", items: ["API Collectors", "Web Scrapers", "Citizen REST API", "Scheduled Data Collectors"], detail: "Dedicated collectors pull or receive data continuously — REST collectors for APIs, scrapers for websites and a public REST endpoint for citizen reports." },
  { id: 3, name: "Kafka (Message Broker)", color: "border-purple-600", chip: "bg-purple-600", icon: "🧵", items: ["raw-reports", "weather", "citizen", "news"], detail: "Apache Kafka buffers every incoming record into dedicated topics, decoupling producers from consumers and guaranteeing durable, ordered delivery at scale." },
  { id: 4, name: "Stream Processing", color: "border-blue-600", chip: "bg-blue-600", icon: "⚙️", items: ["Apache Flink", "Clean", "Normalize", "Enrich", "Extract Location"], detail: "Apache Flink jobs consume Kafka topics in real time: cleaning noisy text, normalizing schemas, enriching with weather context and extracting geo-locations." },
  { id: 5, name: "AI / ML Layer", color: "border-yellow-500", chip: "bg-yellow-500", icon: "🧠", items: ["Event Classification", "Fake / Misleading Detection", "Duplicate Detection", "Trust Score", "Severity Detection"], detail: "ML models classify each post as a weather event, detect fake/misleading content, deduplicate, assign a trust score and estimate event severity." },
  { id: 6, name: "Event Engine", color: "border-teal-600", chip: "bg-teal-600", icon: "🔄", items: ["Reports → Real Events"], detail: "Clusters of verified reports and high-trust posts are fused into canonical 'real events' with location, type, severity and confidence." },
  { id: 7, name: "Storage", color: "border-sky-700", chip: "bg-sky-700", icon: "🗄️", items: ["MongoDB", "Cassandra"], detail: "Events, reports and user data are persisted in MongoDB (documents) while high-volume time-series streams land in Cassandra." },
  { id: 8, name: "Backend APIs", color: "border-violet-600", chip: "bg-violet-600", icon: "🔌", items: ["Node.js / Express", "RESTful APIs"], detail: "A Node.js/Express layer exposes RESTful APIs consumed by the web application, dashboard and admin panel — with JWT authentication." },
  { id: 9, name: "Dashboard (React)", color: "border-blue-500", chip: "bg-blue-500", icon: "📈", items: ["Maps", "Charts", "Analytics"], detail: "The React dashboard renders live maps, charts and analytics for citizens — exactly what you see in this app's Live Map and Analytics pages." },
  { id: 10, name: "Admin Panel (React)", color: "border-green-600", chip: "bg-green-600", icon: "🛡️", items: ["Verification", "Management", "User Management"], detail: "Administrators verify or reject citizen reports and flagged posts, manage users and monitor system health from the admin panel." },
];

export default function PipelinePage() {
  const [active, setActive] = useState<Stage>(STAGES[0]);
  const [flowing, setFlowing] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setFlowing((f) => (f + 1) % STAGES.length),
      1200,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="text-2xl font-extrabold">Interactive Data Pipeline</h1>
      <p className="text-sm text-slate-500">
        How data flows through Bharat Weather Intelligence — from raw sources to
        verified alerts. Click any stage to inspect it.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(s)}
                className={`relative rounded-xl border-t-4 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${s.color} ${
                  active.id === s.id ? "ring-2 ring-blue-400" : ""
                }`}
              >
                {flowing === i && (
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" />
                  </span>
                )}
                <p className="text-lg">{s.icon}</p>
                <p className="mt-1 text-[11px] font-extrabold uppercase leading-tight text-slate-700">
                  {s.id}. {s.name}
                </p>
                <p className="mt-1 line-clamp-2 text-[10px] text-slate-400">
                  {s.items.slice(0, 3).join(" · ")}
                </p>
              </button>
            ))}
          </div>

          <Card className="mt-4">
            <div className="flex items-start gap-4">
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl text-white ${active.chip}`}
              >
                {active.icon}
              </span>
              <div>
                <h2 className="text-lg font-extrabold">
                  {active.id}. {active.name}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {active.detail}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {active.items.map((it) => (
                    <span
                      key={it}
                      className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="mt-4">
            <h2 className="text-base font-bold">Live Flow Simulation</h2>
            <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-2">
              {STAGES.slice(0, 8).map((s, i) => (
                <div key={s.id} className="flex shrink-0 items-center gap-1">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full text-lg transition-all ${
                      flowing === i
                        ? `${s.chip} scale-110 text-white shadow-lg`
                        : "bg-slate-100"
                    }`}
                    title={s.name}
                  >
                    {s.icon}
                  </div>
                  {i < 7 && <span className="text-slate-300">→</span>}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              A record is currently at:{" "}
              <span className="font-bold text-blue-600">
                {STAGES[Math.min(flowing, 7)].name}
              </span>
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-3">
            <h2 className="px-2 pt-1 text-base font-bold">Architecture Diagram</h2>
            <p className="px-2 text-[11px] text-slate-400">
              Full system architecture reference
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/architecture.png"
              alt="Bharat Weather Intelligence architecture diagram"
              className="mt-2 w-full rounded-xl border border-slate-100"
            />
          </Card>
          <Card>
            <h2 className="text-base font-bold">Notification &amp; Alerting</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {[
                ["🔔", "Real-Time Alerts"],
                ["🆘", "Emergency SOS Service"],
                ["📧", "Email / SMS Notifications"],
                ["🔐", "JWT Authentication"],
                ["📋", "Preparedness Tracking"],
              ].map(([i, t]) => (
                <li key={t} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <span>{i}</span>
                  <span className="text-xs font-semibold">{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
