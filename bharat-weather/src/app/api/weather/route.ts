import { NextRequest, NextResponse } from "next/server";
import { CITY_COORDS, describeWmo, mockWeather } from "@/lib/weather";

export const dynamic = "force-dynamic";

async function fetchJson(url: string, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cityQ = (searchParams.get("city") ?? "").trim();
  if (!cityQ) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }

  let label = cityQ;
  let country: string | undefined;
  let lat: number | undefined;
  let lng: number | undefined;

  const known = CITY_COORDS[cityQ.toLowerCase()];
  if (known) {
    label = known.label;
    lat = known.lat;
    lng = known.lng;
    country = "India";
  } else {
    try {
      const geo = await fetchJson(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityQ,
        )}&count=1&language=en&format=json`,
      );
      const hit = geo?.results?.[0];
      if (!hit) {
        return NextResponse.json(
          { error: `City "${cityQ}" not found` },
          { status: 404 },
        );
      }
      label = hit.name;
      country = hit.country;
      lat = hit.latitude;
      lng = hit.longitude;
    } catch {
      return NextResponse.json(mockWeather(cityQ, 20.6, 78.9));
    }
  }

  try {
    const data = await fetchJson(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`,
    );
    const cur = data.current;
    const desc = describeWmo(cur.weather_code);
    return NextResponse.json({
      city: label,
      country,
      lat,
      lng,
      temp: Math.round(cur.temperature_2m),
      feelsLike: Math.round(cur.apparent_temperature),
      humidity: cur.relative_humidity_2m,
      wind: Math.round(cur.wind_speed_10m),
      code: cur.weather_code,
      condition: desc.condition,
      icon: desc.icon,
      tmax: Math.round(data.daily.temperature_2m_max[0]),
      tmin: Math.round(data.daily.temperature_2m_min[0]),
    });
  } catch {
    return NextResponse.json(mockWeather(label, lat ?? 20.6, lng ?? 78.9));
  }
}
