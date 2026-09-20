import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { CITY_COORDS } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const rows = status
    ? await db
        .select()
        .from(reports)
        .where(eq(reports.status, status))
        .orderBy(desc(reports.createdAt))
    : await db.select().from(reports).orderBy(desc(reports.createdAt));

  // Never ship megabytes of base64 in list responses unless asked
  const withImages = searchParams.get("images") === "1";
  const data = rows.map((r) => ({
    ...r,
    imageData: withImages ? r.imageData : r.imageData ? "has-image" : null,
  }));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const reporterName = String(form.get("reporterName") ?? "Anonymous");
    const eventType = String(form.get("eventType") ?? "Other");
    const city = String(form.get("city") ?? "").trim();
    const location = String(form.get("location") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const latRaw = form.get("lat");
    const lngRaw = form.get("lng");

    if (!city || !location || !description) {
      return NextResponse.json(
        { error: "city, location and description are required" },
        { status: 400 },
      );
    }

    let lat = latRaw ? Number(latRaw) : NaN;
    let lng = lngRaw ? Number(lngRaw) : NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const known = CITY_COORDS[city.toLowerCase()];
      if (known) {
        lat = known.lat + (Math.random() - 0.5) * 0.3;
        lng = known.lng + (Math.random() - 0.5) * 0.3;
      } else {
        lat = 20.5937 + (Math.random() - 0.5) * 6;
        lng = 78.9629 + (Math.random() - 0.5) * 6;
      }
    }

    let imageData: string | null = null;
    const file = form.get("image");
    if (file && file instanceof File && file.size > 0) {
      // Keep under Vercel's 4.5MB serverless request body limit
      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image must be under 4MB" },
          { status: 400 },
        );
      }
      const buf = Buffer.from(await file.arrayBuffer());
      const mime = file.type || "image/jpeg";
      imageData = `data:${mime};base64,${buf.toString("base64")}`;
    }

    const [row] = await db
      .insert(reports)
      .values({
        reporterName,
        eventType,
        city,
        location,
        description,
        imageData,
        lat,
        lng,
        status: "pending",
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 },
    );
  }
}
