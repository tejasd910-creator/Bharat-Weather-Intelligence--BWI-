"use client";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    verified: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    pending: "bg-amber-50 text-amber-600 ring-amber-200",
    rejected: "bg-rose-50 text-rose-600 ring-rose-200",
  };
  const label =
    status === "pending" ? "Unverified" : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${styles[status] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}
    >
      {label}
    </span>
  );
}

export function ClassBadge({ c }: { c: "relevant" | "fake" | "other" }) {
  const styles = {
    relevant: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    fake: "bg-rose-50 text-rose-600 ring-rose-200",
    other: "bg-slate-100 text-slate-600 ring-slate-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${styles[c]}`}
    >
      {c.charAt(0).toUpperCase() + c.slice(1)}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
