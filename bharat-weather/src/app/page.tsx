"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CityWeatherCard } from "@/components/WeatherCard";
import { Card, ClassBadge, StatusBadge } from "@/components/ui";
import { useApp } from "@/lib/store";
import { EVENT_ICONS, timeAgo } from "@/lib/weather";

const CITY_IMAGES: Record<string, string> = {
  Mumbai:
    "https://images.pexels.com/photos/5414582/pexels-photo-5414582.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  Delhi:
    "https://images.pexels.com/photos/16952108/pexels-photo-16952108.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  Bangalore:
    "https://images.pexels.com/photos/36553966/pexels-photo-36553966.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

type ReportRow = {
  id: number;
  eventType: string;
  city: string;
  status: string;
  createdAt: string;
};

export default function HomePage() {
  const router = useRouter();
  const { posts } = useApp();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<ReportRow[]>([]);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((rows: ReportRow[]) => setRecent(rows.slice(0, 4)))
      .catch(() => {});
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/weather?city=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div>
      {/* Hero */}
      <section
        className="relative bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(5,15,35,0.78), rgba(5,15,35,0.55), rgba(5,15,35,0.85)), url(${CITY_IMAGES.Mumbai})`,
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
                Bharat Weather
                <br />
                Intelligence
              </h1>
              <p className="mt-4 text-lg font-semibold text-sky-200">
                Real-time weather. Real people. Real insights.
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
                Track live weather, report events, get informed and help build a
                safer, more resilient India.
              </p>
            </div>
            <div>
              <form
                onSubmit={onSearch}
                className="flex overflow-hidden rounded-xl bg-white shadow-xl"
              >
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search city (e.g. Mumbai, Delhi, Bangalore...)"
                  className="w-full px-4 py-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 px-5 text-white transition hover:bg-blue-700"
                  aria-label="Search"
                >
                  🔍
                </button>
              </form>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(["Mumbai", "Delhi", "Bangalore"] as const).map((c) => (
                  <CityWeatherCard key={c} city={c} image={CITY_IMAGES[c]} compact />
                ))}
              </div>
            </div>
          </div>

          {/* Feature cards */}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Link
              href="/report"
              className="group rounded-2xl bg-blue-600 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-500"
            >
              <span className="text-3xl">📝</span>
              <h3 className="mt-3 text-lg font-bold">Citizen Report Portal</h3>
              <p className="mt-1 text-sm text-blue-100">
                See something? Report it! Help your community by sharing real-time
                weather events.
              </p>
            </Link>
            <Link
              href="/map"
              className="group rounded-2xl bg-emerald-600 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:bg-emerald-500"
            >
              <span className="text-3xl">📍</span>
              <h3 className="mt-3 text-lg font-bold">Live Map</h3>
              <p className="mt-1 text-sm text-emerald-100">
                View current alerts and weather conditions across India — verified
                and unverified.
              </p>
            </Link>
            <Link
              href="/social"
              className="group rounded-2xl bg-violet-600 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:bg-violet-500"
            >
              <span className="text-3xl">⚠️</span>
              <h3 className="mt-3 text-lg font-bold">Social Media Ingestion</h3>
              <p className="mt-1 text-sm text-violet-100">
                Live processing of weather posts from social media, classified as
                real, fake, relevant.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent events + posts */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Recent Weather Events</h2>
              <Link href="/map" className="text-xs font-semibold text-blue-600">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {recent.length === 0 && (
                <p className="text-sm text-slate-500">No reports yet. Be the first to report!</p>
              )}
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-lg shadow-sm">
                      {EVENT_ICONS[r.eventType] ?? "🌦️"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {r.eventType} — {r.city}
                      </p>
                      <p className="text-xs text-slate-500">
                        Reported {timeAgo(r.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Latest Social Media Posts</h2>
              <Link href="/social" className="text-xs font-semibold text-blue-600">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {posts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: `hsl(${p.avatarHue} 70% 45%)` }}
                    >
                      {p.handle.charAt(1).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{p.handle}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{p.text}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{timeAgo(new Date(p.time))}</p>
                    </div>
                  </div>
                  <ClassBadge c={p.classification} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
