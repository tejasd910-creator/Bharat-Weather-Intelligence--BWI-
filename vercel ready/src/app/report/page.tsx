"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Card, StatusBadge } from "@/components/ui";
import { useApp } from "@/lib/store";
import { EVENT_ICONS, EVENT_TYPES, timeAgo } from "@/lib/weather";

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

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Ahmedabad", "Jaipur", "Guwahati", "Other",
];

export default function ReportPage() {
  const { userName } = useApp();
  const [eventType, setEventType] = useState<string>(EVENT_TYPES[0]);
  const [city, setCity] = useState("Mumbai");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [justSubmitted, setJustSubmitted] = useState<ReportRow | null>(null);

  const loadReports = useCallback(() => {
    fetch("/api/reports?images=1")
      .then((r) => r.json())
      .then((rows: ReportRow[]) => setReports(rows))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  function onFile(f: File | null) {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.set("reporterName", userName);
      fd.set("eventType", eventType);
      fd.set("city", city);
      fd.set("location", location);
      fd.set("description", description);
      if (file) fd.set("image", file);
      const res = await fetch("/api/reports", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error ?? "Failed to submit report");
      } else {
        setJustSubmitted(json);
        setMessage("✅ Report submitted! It is now pending admin verification.");
        setLocation("");
        setDescription("");
        onFile(null);
        loadReports();
      }
    } catch {
      setMessage("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <h1 className="text-2xl font-extrabold">Citizen Report Portal</h1>
      <p className="text-sm text-slate-500">
        Share what you see. Help others stay informed.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="lg:col-span-3">
          <h2 className="text-base font-bold">Report an Event</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-slate-600">
                Event Type
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {EVENT_ICONS[t]} {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                City
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      📍 {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-xs font-semibold text-slate-600">
              Exact Location
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Andheri Station, Western Line"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Description
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Waterlogging on main road near Andheri station. Traffic is slow and few vehicles are stuck."
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </label>
            <div>
              <p className="text-xs font-semibold text-slate-600">Upload Image</p>
              <div className="mt-1.5 flex items-center gap-4">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="preview"
                    className="h-20 w-28 rounded-lg border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-28 place-items-center rounded-lg border-2 border-dashed border-slate-200 text-2xl text-slate-300">
                    🖼️
                  </div>
                )}
                <label className="cursor-pointer rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                  📷 Choose Image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <span className="text-[11px] text-slate-400">PNG, JPG (Max 4MB)</span>
              </div>
            </div>
            {message && (
              <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                {message}
              </p>
            )}
            <button
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </form>

          {justSubmitted && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-bold text-emerald-700">Your submitted report</p>
              <div className="mt-2 flex items-start gap-3">
                {justSubmitted.imageData && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={justSubmitted.imageData}
                    alt="report"
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-bold">
                    {EVENT_ICONS[justSubmitted.eventType]} {justSubmitted.eventType} —{" "}
                    {justSubmitted.city}
                  </p>
                  <p className="text-xs text-slate-600">{justSubmitted.description}</p>
                  <div className="mt-1">
                    <StatusBadge status={justSubmitted.status} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* My Reports */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">My Reports</h2>
            <span className="text-xs font-semibold text-slate-400">
              {reports.length} total
            </span>
          </div>
          <div className="mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {reports.length === 0 && (
              <p className="text-sm text-slate-500">No reports yet.</p>
            )}
            {reports.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                {r.imageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.imageData}
                    alt={r.eventType}
                    className="h-14 w-20 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="grid h-14 w-20 shrink-0 place-items-center rounded-lg bg-white text-2xl shadow-sm">
                    {EVENT_ICONS[r.eventType] ?? "🌦️"}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold">
                      {r.eventType} — {r.city}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                    {r.description}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {r.location} · {timeAgo(r.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
