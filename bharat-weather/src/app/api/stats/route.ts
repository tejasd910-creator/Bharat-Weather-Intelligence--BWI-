import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { reports } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      status: reports.status,
      eventType: reports.eventType,
      city: reports.city,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .orderBy(sql`${reports.createdAt} desc`)
    .limit(500);

  const total = rows.length;
  const verified = rows.filter((r) => r.status === "verified").length;
  const pending = rows.filter((r) => r.status === "pending").length;
  const rejected = rows.filter((r) => r.status === "rejected").length;

  const byType: Record<string, number> = {};
  const byCity: Record<string, number> = {};
  for (const r of rows) {
    byType[r.eventType] = (byType[r.eventType] ?? 0) + 1;
    byCity[r.city] = (byCity[r.city] ?? 0) + 1;
  }

  // 24h trend in 4-hour buckets
  const now = Date.now();
  const buckets = Array.from({ length: 6 }, (_, i) => ({
    label: `${String(new Date(now - (5 - i) * 4 * 3600_000).getHours()).padStart(2, "0")}:00`,
    count: 0,
  }));
  for (const r of rows) {
    const age = now - new Date(r.createdAt).getTime();
    if (age < 24 * 3600_000) {
      const idx = 5 - Math.min(5, Math.floor(age / (4 * 3600_000)));
      buckets[idx].count += 1;
    }
  }

  return NextResponse.json({
    total,
    verified,
    pending,
    rejected,
    byType,
    byCity,
    trend: buckets,
  });
}
