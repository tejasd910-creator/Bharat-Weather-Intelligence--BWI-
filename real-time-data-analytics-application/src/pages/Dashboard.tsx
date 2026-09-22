import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
  XCircle,
} from "lucide-react";
import { PageHeader, Shell, StatusChip } from "../components/Layout";
import { EventBadge } from "../components/WeatherGlyph";
import { useApp } from "../lib/context";
import { SEVERITY_META } from "../lib/data";
import { weatherShort } from "../lib/weather";
import type { ReportRow, VerificationStatus } from "../lib/types";

export default function Dashboard() {
  const { user, navigate, weather, login, reports, setReportStatus, pendingCitizenCount } = useApp();
  const session = user || { name: "Guest Analyst", email: "guest@nationalweather.in", role: "Analyst" as const };
  const canVerify = session.role === "Administrator" || session.role === "Analyst";

  const pending = reports.filter((r) => r.status !== "Verified");
  const citizenPending = pending.filter((r) => r.citizen);
  const recentlyVerified = reports.filter((r) => r.status === "Verified" && r.citizen).slice(0, 6);
  const [tab, setTab] = useState<"citizen" | "all">("citizen");
  const queue = tab === "citizen" ? citizenPending : pending;
  const [activeId, setActiveId] = useState<string | null>(queue[0]?.id ?? null);
  const active = reports.find((r) => r.id === activeId) || queue[0] || null;
  const [note, setNote] = useState("");

  const cities = weather.slice(0, 6);

  const kpis = useMemo(
    () => [
      { l: "Citizen queue", v: String(citizenPending.length), icon: UserRound, c: "text-emerald-600 bg-emerald-50" },
      { l: "All pending", v: String(pending.length), icon: ClipboardList, c: "text-amber-600 bg-amber-50" },
      { l: "Verified total", v: String(reports.filter((r) => r.status === "Verified").length), icon: ShieldCheck, c: "text-blue-600 bg-blue-50" },
      { l: "Alerts pushed", v: "42", icon: Bell, c: "text-violet-600 bg-violet-50" },
    ],
    [citizenPending.length, pending.length, reports]
  );

  const act = (status: VerificationStatus) => {
    if (!active) return;
    if (!user) {
      login({ name: "Priya Nair", email: "priya@nationalweather.in", role: "Administrator" });
    }
    setReportStatus(active.id, status, {
      note: note.trim() || undefined,
      reviewer: user?.name || "Priya Nair",
    });
    setNote("");
  };

  return (
    <Shell>
      <PageHeader
        title={`Welcome, ${session.name.split(" ")[0]}`}
        subtitle={`${session.role} · ${session.email}`}
        extra={
          !user ? (
            <button
              onClick={() =>
                login({ name: "Priya Nair", email: "priya@nationalweather.in", role: "Administrator" })
              }
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Enter as Administrator
            </button>
          ) : (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Signed in · {session.role}
            </span>
          )
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.l} className="card flex items-center gap-3 p-4">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${k.c}`}>
              <k.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500">{k.l}</div>
              <div className="font-display text-2xl font-bold">{k.v}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-blue-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">Verification desk</h2>
            {pendingCitizenCount > 0 && (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                {pendingCitizenCount} citizen
              </span>
            )}
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
            <button
              onClick={() => setTab("citizen")}
              className={`rounded-md px-3 py-1.5 ${tab === "citizen" ? "bg-blue-600 text-white" : "text-slate-600"}`}
            >
              Citizen reports
            </button>
            <button
              onClick={() => setTab("all")}
              className={`rounded-md px-3 py-1.5 ${tab === "all" ? "bg-blue-600 text-white" : "text-slate-600"}`}
            >
              All pending
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="card max-h-[640px] overflow-y-auto p-3">
            {queue.length === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-slate-500">
                {tab === "citizen"
                  ? "No citizen reports waiting. New submissions from “Report an Incident” will land here."
                  : "Verification queue is clear."}
              </div>
            ) : (
              <ul className="space-y-2">
                {queue.map((r) => (
                  <QueueItem key={r.id} r={r} active={active?.id === r.id} onClick={() => setActiveId(r.id)} />
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            {!active ? (
              <p className="text-sm text-slate-500">Select a report to review evidence and verify.</p>
            ) : (
              <VerifyPanel
                active={active}
                note={note}
                setNote={setNote}
                canVerify={canVerify}
                onVerify={() => act("Verified")}
                onReject={() => act("Unverified")}
                onHold={() => act("Under Review")}
              />
            )}
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recently verified citizen reports</h3>
            <button onClick={() => navigate("reports")} className="text-xs font-semibold text-blue-600">
              Open reports
            </button>
          </div>
          {recentlyVerified.length === 0 ? (
            <p className="text-sm text-slate-500">Verified citizen filings will appear here.</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentlyVerified.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <EventBadge type={r.event} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {r.city}, {r.state}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {r.reporterName} · {r.verifiedBy}
                    </div>
                  </div>
                  <StatusChip status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Live forecast snapshot</h3>
            <button onClick={() => navigate("forecast")} className="text-xs font-semibold text-blue-600">
              Full forecast
            </button>
          </div>
          <ul className="divide-y divide-slate-50">
            {cities.map((c) => (
              <li key={c.city.id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium">{c.city.name}</span>
                <span className="text-slate-500">{c.current ? weatherShort(c.current.weatherCode) : "…"}</span>
                <span className="font-display font-bold">
                  {c.current ? Math.round(c.current.temperature) : "--"}°
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate("pipeline")}
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600"
          >
            <Sparkles className="h-3.5 w-3.5" /> Inspect live pipeline
          </button>
        </div>
      </div>
    </Shell>
  );
}

function QueueItem({ r, active, onClick }: { r: ReportRow; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left ${
        active ? "border-blue-400 bg-blue-50/60" : "border-slate-100 hover:border-slate-200"
      }`}
    >
      <div className="flex items-start gap-2">
        <EventBadge type={r.event} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-800">
            {r.city}, {r.state}
          </div>
          <div className="truncate text-[11px] text-slate-500">{r.text}</div>
        </div>
        <StatusChip status={r.status} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {r.citizen ? `Citizen · ${r.reporterName}` : r.source} · AI {r.aiConfidence.toFixed(2)}
        </span>
        <span className={`rounded-full border px-1.5 py-0.5 font-semibold ${SEVERITY_META[r.severity]}`}>{r.severity}</span>
      </div>
    </button>
  );
}

function VerifyPanel({
  active,
  note,
  setNote,
  canVerify,
  onVerify,
  onReject,
  onHold,
}: {
  active: ReportRow;
  note: string;
  setNote: (v: string) => void;
  canVerify: boolean;
  onVerify: () => void;
  onReject: () => void;
  onHold: () => void;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <EventBadge type={active.event} />
            {active.citizen && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                CITIZEN
              </span>
            )}
          </div>
          <h3 className="mt-2 font-display text-lg font-bold text-slate-900">
            {active.city}, {active.state}
          </h3>
          <p className="text-xs text-slate-400">
            {active.datetime} · {active.id}
          </p>
        </div>
        <StatusChip status={active.status} />
      </div>

      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{active.text}</p>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <Field k="Reporter" v={active.reporterName || active.handle || "—"} />
        <Field k="Phone" v={active.reporterPhone || "—"} />
        <Field k="Source" v={active.source} />
        <Field k="AI confidence" v={active.aiConfidence.toFixed(2)} />
        <Field k="Fake-risk" v={(active.fakeScore ?? 0.08).toFixed(2)} />
        <Field
          k="Severity"
          v={
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${SEVERITY_META[active.severity]}`}>
              {active.severity}
            </span>
          }
        />
      </dl>

      {active.verifiedBy && (
        <p className="mt-3 text-xs text-emerald-700">
          Last action by {active.verifiedBy} at {active.verifiedAt}
          {active.adminNote ? ` — “${active.adminNote}”` : ""}
        </p>
      )}

      <label className="mt-4 block text-xs font-semibold text-slate-600">
        Verification notes
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Corroborated with IMD nowcast / duplicate of existing event / …"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onVerify}
          disabled={!canVerify}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" /> Verify
        </button>
        <button
          onClick={onHold}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
        >
          Keep under review
        </button>
        <button
          onClick={onReject}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
        >
          <XCircle className="h-4 w-4" /> Reject
        </button>
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        Verify publishes the event to Reports (Verified) and the live map. Reject marks it Unverified so it stays in
        the archive without triggering alerts.
      </p>
    </>
  );
}

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{k}</div>
      <div className="text-sm font-medium text-slate-800">{v}</div>
    </div>
  );
}
