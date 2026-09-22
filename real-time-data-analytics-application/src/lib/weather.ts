import type { City, CityWeather, DailyForecast, HourlyForecast, WeatherCurrent } from "./types";

const FALLBACK_NOW: Record<string, { t: number; h: number; code: number }> = {
  delhi: { t: 28, h: 72, code: 61 },
  mumbai: { t: 29, h: 78, code: 2 },
  kolkata: { t: 27, h: 83, code: 63 },
  chennai: { t: 31, h: 65, code: 2 },
  guwahati: { t: 26, h: 87, code: 65 },
};

export function fallbackWeather(city: City): CityWeather {
  const fb = FALLBACK_NOW[city.id] ?? { t: 30, h: 70, code: 2 };
  const now = new Date();
  const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now.getTime() + i * 3600_000);
    return {
      time: t.toISOString(),
      temperature: fb.t + Math.sin(i / 3) * 3,
      precipProb: 20 + (i % 5) * 8,
      precip: i % 4 === 0 ? 0.4 : 0,
      weatherCode: fb.code,
      humidity: fb.h,
      windSpeed: 12,
      cloudCover: 60,
    };
  });
  const daily: DailyForecast[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() + i * 86400_000);
    return {
      date: d.toISOString().slice(0, 10),
      weatherCode: fb.code,
      tMax: fb.t + 4,
      tMin: fb.t - 5,
      precip: i % 2,
      precipProb: 40,
      uv: 7,
      windMax: 18,
      sunrise: d.toISOString(),
      sunset: d.toISOString(),
    };
  });
  return {
    city,
    current: {
      temperature: fb.t,
      humidity: fb.h,
      apparent: fb.t + 1,
      precipitation: fb.code >= 61 ? 1.2 : 0,
      weatherCode: fb.code,
      windSpeed: 12,
      windDir: 220,
      cloudCover: 55,
      pressure: 1008,
      isDay: true,
      time: now.toISOString(),
    },
    daily,
    hourly,
    loading: false,
    error: "fallback",
  };
}

const CURRENT =
  "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,pressure_msl,is_day";
const HOURLY =
  "temperature_2m,precipitation_probability,precipitation,weather_code,relative_humidity_2m,wind_speed_10m,cloud_cover";
const DAILY =
  "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_speed_10m_max";

function parseCurrent(c: Record<string, number | string>): WeatherCurrent {
  return {
    temperature: Number(c.temperature_2m),
    humidity: Number(c.relative_humidity_2m),
    apparent: Number(c.apparent_temperature),
    precipitation: Number(c.precipitation),
    weatherCode: Number(c.weather_code),
    windSpeed: Number(c.wind_speed_10m),
    windDir: Number(c.wind_direction_10m),
    cloudCover: Number(c.cloud_cover),
    pressure: Number(c.pressure_msl),
    isDay: Number(c.is_day) === 1,
    time: String(c.time),
  };
}

function parseDaily(d: Record<string, (number | string)[]>): DailyForecast[] {
  return (d.time || []).map((date, i) => ({
    date: String(date),
    weatherCode: Number(d.weather_code?.[i] ?? 0),
    tMax: Number(d.temperature_2m_max?.[i] ?? 0),
    tMin: Number(d.temperature_2m_min?.[i] ?? 0),
    precip: Number(d.precipitation_sum?.[i] ?? 0),
    precipProb: Number(d.precipitation_probability_max?.[i] ?? 0),
    uv: Number(d.uv_index_max?.[i] ?? 0),
    windMax: Number(d.wind_speed_10m_max?.[i] ?? 0),
    sunrise: String(d.sunrise?.[i] ?? ""),
    sunset: String(d.sunset?.[i] ?? ""),
  }));
}

function parseHourly(h: Record<string, (number | string)[]>): HourlyForecast[] {
  return (h.time || []).slice(0, 48).map((time, i) => ({
    time: String(time),
    temperature: Number(h.temperature_2m?.[i] ?? 0),
    precipProb: Number(h.precipitation_probability?.[i] ?? 0),
    precip: Number(h.precipitation?.[i] ?? 0),
    weatherCode: Number(h.weather_code?.[i] ?? 0),
    humidity: Number(h.relative_humidity_2m?.[i] ?? 0),
    windSpeed: Number(h.wind_speed_10m?.[i] ?? 0),
    cloudCover: Number(h.cloud_cover?.[i] ?? 0),
  }));
}

export function weatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 85 && code <= 86) return "Snow Showers";
  if (code === 95) return "Thunderstorm";
  if (code >= 96) return "Thunderstorm";
  return "Cloudy";
}

export function weatherShort(code: number): string {
  if (code === 0 || code === 1) return "Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Light Rain";
  if (code === 61 || code === 80) return "Light Rain";
  if (code === 63 || code === 81) return "Moderate Rain";
  if (code === 65 || code === 82) return "Heavy Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 95) return "Thunderstorm";
  return "Cloudy";
}

export async function fetchCityWeather(city: City): Promise<CityWeather> {
  const params = new URLSearchParams({
    latitude: String(city.lat),
    longitude: String(city.lon),
    current: CURRENT,
    hourly: HOURLY,
    daily: DAILY,
    timezone: "Asia/Kolkata",
    forecast_days: "7",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`);
  const data = await res.json();
  return {
    city,
    current: data.current ? parseCurrent(data.current) : null,
    daily: data.daily ? parseDaily(data.daily) : [],
    hourly: data.hourly ? parseHourly(data.hourly) : [],
    loading: false,
  };
}

export async function fetchManyCurrent(cities: City[]): Promise<CityWeather[]> {
  const chunkSize = 8;
  const chunks: City[][] = [];
  for (let i = 0; i < cities.length; i += chunkSize) chunks.push(cities.slice(i, i + chunkSize));

  const results: CityWeather[] = [];
  for (const group of chunks) {
    const params = new URLSearchParams({
      latitude: group.map((c) => c.lat).join(","),
      longitude: group.map((c) => c.lon).join(","),
      current: CURRENT,
      daily: DAILY,
      hourly: HOURLY,
      timezone: "Asia/Kolkata",
      forecast_days: "7",
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : [data];
    for (let i = 0; i < group.length; i++) {
      const block = list[i] ?? list[0];
      results.push({
        city: group[i],
        current: block?.current ? parseCurrent(block.current) : null,
        daily: block?.daily ? parseDaily(block.daily) : [],
        hourly: block?.hourly ? parseHourly(block.hourly) : [],
        loading: false,
      });
    }
  }
  return results;
}
