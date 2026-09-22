import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Filter,
  Heart,
  MessageCircle,
  Repeat2,
  Search,
  X,
} from "lucide-react";
import { PageHeader, Shell, StatusChip } from "../components/Layout";
import { EventBadge } from "../components/WeatherGlyph";
import { useApp } from "../lib/context";
import { REPORT_IMAGES, SEVERITY_META, STATES } from "../lib/data";
import type { EventType, ReportRow, VerificationStatus } from "../lib/types";

const EVENTS: EventType[] = ["Heavy Rain", "Flood", "Cyclone", "Heatwave", "Active Incident"];

export default function Reports() {
  const { reports, pendingCitizenCount, navigate } = useApp();
  const [q, setQ] = useState("");
  const [event, setEvent] = useState("All Events");
  const [state, setState] = useState("All States");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ReportRow>(reports[0]);
  /** Single selection only — one checkbox at a time is allowed. */
  const [checked, setChecked] = useState<string | null>(null);
  /** Rotation index for the detail photo, advances on every click. */
  const [imgIdx, setImgIdx] = useState(0);

  const advanceImage = () => setImgIdx((i) => (i + 1) % REPORT_IMAGES.length);
  const selectRow = (r: ReportRow) => {
    setSelected(r);
    advanceImage();
  };

  useEffect(() => {
    const still = reports.find((r) => r.id === selected.id);
    if (still) setSelected(still);
    else if (reports[0]) setSelected(reports[0]);
  }, [reports, selected.id]);

  const filtered = useMemo(
    () =>
      reports.filter((r) => {
        const qq = q.toLowerCase();
        const matchQ =
          !q || `${r.location} ${r.event} ${r.source} ${r.text} ${r.reporterName || ""}`.toLowerCase().includes(qq);
        const matchE = event === "All Events" || r.event === event;
        const matchS = state === "All States" || r.state === state;
        const matchSt = status === "All" || r.status === status;
        return matchQ && matchE && matchS && matchSt;
      }),
    [q, event, state, status, reports]
  );

  const per = 10;
  const pages = Math.max(1, Math.ceil(filtered.length / per));
  const slice = filtered.slice((page - 1) * per, page * per);

  const exportCsv = () => {
    const header = "Date,Location,Event,Source,AI,Status,Severity\n";
    const body = filtered
      .map((r) => `${r.datetime},${r.location},${r.event},${r.source},${r.aiConfidence},${r.status},${r.severity}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "weather-reports.csv";
    a.click();
  };

  return (
    <Shell>
      <PageHeader
        icon={<FileSpreadsheet className="h-5 w-5" />}
        title="Reports"
        subtitle="View, search and manage weather incident reports"
        extra={
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white">
              Generate Report
            </button>
          </div>
        }
      />

      {pendingCitizenCount > 0 && (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span>
            <strong>{pendingCitizenCount}</strong> citizen report{pendingCitizenCount > 1 ? "s" : ""} awaiting
            administrator verification.
          </span>
          <button
            onClick={() => navigate("dashboard")}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Open verification desk
          </button>
        </div>
      )}

      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by location, event, source, etc."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:bg-white"
            />
          </div>
          <button className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600">
            <Filter className="h-4 w-4" /> Advanced Filters
          </button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <select value={event} onChange={(e) => setEvent(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm">
            <option>All Events</option>
            {EVENTS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select value={state} onChange={(e) => setState(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm">
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select className="h-9 rounded-lg border border-slate-200 px-2 text-sm">
            <option>Last 7 Days</option>
            <option>Last 24 Hours</option>
            <option>Last 30 Days</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm">
            <option>All</option>
            <option>Verified</option>
            <option>Under Review</option>
            <option>Unverified</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th
                  className="w-12 px-4 py-3"
                  title="Single selection — only one report can be selected at a time"
                >
                  <span
                    aria-hidden
                    className="block h-4 w-4 rounded-full border-2 border-slate-300"
                  />
                </th>
                <th className="px-3 py-3">Date & Time</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Event</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">AI Confidence</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Freq.</th>
                <th className="px-3 py-3">Severity</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => selectRow(r)}
                  className={`cursor-pointer border-t border-slate-50 hover:bg-slate-50/80 ${
                    selected.id === r.id
                      ? "bg-blue-50/50"
                      : checked === r.id
                        ? "bg-indigo-50/70"
                        : r.citizen
                          ? "bg-emerald-50/40"
                          : ""
                  }`}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={checked === r.id}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => {
                        setChecked((prev) => (prev === r.id ? null : r.id));
                        advanceImage();
                      }}
                      className="h-4 w-4 cursor-pointer accent-blue-600"
                      aria-label={`Select report for ${r.location} (one at a time)`}
                    />
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600">{r.datetime}</td>
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium text-slate-800">{r.city}</div>
                    <div className="text-[11px] text-slate-400">{r.state}</div>
                  </td>
                  <td className="px-3 py-3">
                    <EventBadge type={r.event} />
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {r.source}
                    {r.citizen && (
                      <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        NEW
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-700">{r.aiConfidence.toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <StatusChip status={r.status as VerificationStatus} />
                  </td>
                  <td className="px-3 py-3 text-slate-600">{r.frequency}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${SEVERITY_META[r.severity]}`}>
                      {r.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>
            Showing {(page - 1) * per + 1}–{Math.min(page * per, filtered.length)} of {filtered.length} reports
            {checked && (
              <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-600">
                1 selected · only one at a time
              </span>
            )}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 rounded-md text-xs font-semibold ${
                  p === page ? "bg-blue-600 text-white" : "hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="grid h-6 w-6 place-items-center rounded bg-slate-900 text-[10px] text-white">X</span>
            {selected.handle || "@weather_updates"}
          </div>
          <p className="text-sm leading-relaxed text-slate-700">{selected.text}</p>
          <img
            key={`${selected.id}-${imgIdx}`}
            src={REPORT_IMAGES[imgIdx]}
            alt={`${selected.event} — illustrative photo`}
            className="nw-img-swap mt-3 h-44 w-full rounded-xl object-cover"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Photo {imgIdx + 1} of {REPORT_IMAGES.length} · changes on every click
            </span>
            <span className="font-medium">{selected.event}</span>
          </div>
          <div className="mt-3 flex gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> {selected.comments}
            </span>
            <span className="inline-flex items-center gap-1">
              <Repeat2 className="h-3.5 w-3.5" /> {selected.shares}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> {selected.likes}
            </span>
          </div>
        </div>

        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Incident Details</h3>
            <button className="text-slate-400">
              <X className="h-4 w-4" />
            </button>
          </div>
          <dl className="space-y-2 text-sm">
            <Row k="Location" v={selected.location} />
            <Row k="Event Type" v={selected.event} />
            <Row k="Source" v={selected.source} />
            {selected.reporterName && <Row k="Reported by" v={selected.reporterName} />}
            {selected.reporterPhone && <Row k="Phone" v={selected.reporterPhone} />}
            <Row k="AI Confidence" v={selected.aiConfidence.toFixed(2)} />
            <Row k="Verification Status" v={<StatusChip status={selected.status} />} />
            {selected.verifiedBy && <Row k="Verified by" v={`${selected.verifiedBy} · ${selected.verifiedAt}`} />}
            {selected.adminNote && <Row k="Admin note" v={selected.adminNote} />}
            <Row k="Frequency" v={String(selected.frequency)} />
            <Row
              k="Severity"
              v={
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${SEVERITY_META[selected.severity]}`}>
                  {selected.severity}
                </span>
              }
            />
          </dl>
        </div>
      </div>
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-50 py-1.5">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-medium text-slate-800">{v}</dd>
    </div>
  );
}
