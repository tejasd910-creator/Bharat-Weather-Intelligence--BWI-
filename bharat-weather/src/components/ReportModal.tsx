import { useState } from "react";
import { CheckCircle2, MapPin, ShieldCheck, X } from "lucide-react";
import { useApp } from "../lib/context";
import { CITIES, STATES } from "../lib/data";
import type { EventType, Severity } from "../lib/types";

const TYPES: EventType[] = ["Heavy Rain", "Flood", "Cyclone", "Heatwave", "Active Incident"];
const SEVERITIES: Severity[] = ["High", "Medium", "Low"];

export function ReportModal() {
  const { reportOpen, setReportOpen, addCitizenReport, navigate } = useApp();
  const [sentId, setSentId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "Jaipur",
    state: "Rajasthan",
    type: "Heavy Rain" as EventType,
    severity: "Medium" as Severity,
    desc: "",
  });

  if (!reportOpen) return null;

  const close = () => {
    setReportOpen(false);
    setSentId(null);
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Report an Incident</h3>
          <button onClick={close} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>
        {sentId ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <p className="mt-3 font-semibold text-slate-800">Report filed</p>
            <p className="mt-1 text-sm text-slate-500">
              ID <span className="font-mono text-slate-700">{sentId}</span> is now on the Reports page and in the
              administrator verification queue (status: Under Review).
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => {
                  close();
                  navigate("reports");
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                View on Reports
              </button>
              <button
                onClick={() => {
                  close();
                  navigate("dashboard");
                }}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Open verification desk
              </button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const row = addCitizenReport({
                name: form.name,
                phone: form.phone,
                city: form.city,
                state: form.state,
                type: form.type,
                severity: form.severity,
                desc: form.desc,
              });
              setSentId(row.id);
              setForm({ ...form, name: "", phone: "", desc: "" });
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate-600">
                Your name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Phone (optional)
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate-600">
                City
                <select
                  value={form.city}
                  onChange={(e) => {
                    const city = CITIES.find((c) => c.name === e.target.value);
                    setForm({ ...form, city: e.target.value, state: city?.state || form.state });
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                >
                  {CITIES.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                State
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                >
                  {STATES.filter((s) => s !== "All States").map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate-600">
                Event type
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                >
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Severity
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value as Severity })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                >
                  {SEVERITIES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-xs font-semibold text-slate-600">
              Description
              <textarea
                required
                rows={3}
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="What are you seeing on the ground?"
              />
            </label>
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Submitted reports appear immediately on Reports and wait in the admin verification queue until an
              analyst verifies or rejects them.
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" /> Location will be geocoded by the Flink enricher.
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Submit report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
