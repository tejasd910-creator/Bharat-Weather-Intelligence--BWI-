export type WeatherInfo = {
  city: string;
  country?: string;
  lat: number;
  lng: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  code: number;
  condition: string;
  icon: string;
  tmax: number;
  tmin: number;
  isMock?: boolean;
};

export const CITY_COORDS: Record<
  string,
  { lat: number; lng: number; label: string }
> = {
  mumbai: { lat: 19.076, lng: 72.8777, label: "Mumbai" },
  delhi: { lat: 28.6139, lng: 77.209, label: "Delhi" },
  bangalore: { lat: 12.9716, lng: 77.5946, label: "Bangalore" },
  chennai: { lat: 13.0827, lng: 80.2707, label: "Chennai" },
  kolkata: { lat: 22.5726, lng: 88.3639, label: "Kolkata" },
  hyderabad: { lat: 17.385, lng: 78.4867, label: "Hyderabad" },
  pune: { lat: 18.5204, lng: 73.8567, label: "Pune" },
  ahmedabad: { lat: 23.0225, lng: 72.5714, label: "Ahmedabad" },
  jaipur: { lat: 26.9124, lng: 75.7873, label: "Jaipur" },
  guwahati: { lat: 26.1445, lng: 91.7362, label: "Guwahati" },
};

export function describeWmo(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: "Clear", icon: "☀️" };
  if (code === 1) return { condition: "Mostly Clear", icon: "🌤️" };
  if (code === 2) return { condition: "Partly Cloudy", icon: "⛅" };
  if (code === 3) return { condition: "Overcast", icon: "☁️" };
  if (code === 45 || code === 48) return { condition: "Fog", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { condition: "Drizzle", icon: "🌦️" };
  if (code >= 61 && code <= 65) return { condition: "Rain", icon: "🌧️" };
  if (code >= 66 && code <= 67) return { condition: "Freezing Rain", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { condition: "Snow", icon: "🌨️" };
  if (code >= 80 && code <= 82) return { condition: "Rain Showers", icon: "🌧️" };
  if (code >= 85 && code <= 86) return { condition: "Snow Showers", icon: "🌨️" };
  if (code >= 95) return { condition: "Thunderstorm", icon: "⛈️" };
  return { condition: "Cloudy", icon: "☁️" };
}

const MOCK_BASE: Record<string, Partial<WeatherInfo>> = {
  mumbai: { temp: 28, code: 2, humidity: 78, wind: 12, tmax: 31, tmin: 26 },
  delhi: { temp: 34, code: 0, humidity: 45, wind: 8, tmax: 36, tmin: 26 },
  bangalore: { temp: 24, code: 61, humidity: 82, wind: 10, tmax: 27, tmin: 20 },
};

export function mockWeather(city: string, lat: number, lng: number): WeatherInfo {
  const base = MOCK_BASE[city.toLowerCase()] ?? {
    temp: 29,
    code: 2,
    humidity: 60,
    wind: 10,
    tmax: 33,
    tmin: 24,
  };
  const desc = describeWmo(base.code ?? 2);
  return {
    city,
    lat,
    lng,
    temp: base.temp ?? 29,
    feelsLike: (base.temp ?? 29) + 2,
    humidity: base.humidity ?? 60,
    wind: base.wind ?? 10,
    code: base.code ?? 2,
    condition: desc.condition,
    icon: desc.icon,
    tmax: base.tmax ?? 33,
    tmin: base.tmin ?? 24,
    isMock: true,
  };
}

export const EVENT_TYPES = [
  "Heavy Rainfall",
  "Flood",
  "Heatwave",
  "Thunderstorm",
  "Strong Winds",
  "Cyclone",
  "Hailstorm",
  "Other",
] as const;

export const EVENT_ICONS: Record<string, string> = {
  "Heavy Rainfall": "🌧️",
  Flood: "🌊",
  Heatwave: "🌡️",
  Thunderstorm: "⛈️",
  "Strong Winds": "💨",
  Cyclone: "🌀",
  Hailstorm: "🧊",
  Other: "🌦️",
};

export function timeAgo(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const days = Math.floor(h / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
