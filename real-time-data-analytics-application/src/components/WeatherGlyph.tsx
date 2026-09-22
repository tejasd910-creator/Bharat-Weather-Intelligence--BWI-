import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Sunset,
  Waves,
  Wind,
  Droplets,
  ThermometerSun,
  TriangleAlert,
} from "lucide-react";
import type { EventType } from "../lib/types";

export function WeatherGlyph({
  code,
  className = "h-8 w-8",
  isDay = true,
}: {
  code: number;
  className?: string;
  isDay?: boolean;
}) {
  const cls = className;
  if (code === 0) return isDay ? <Sun className={`${cls} text-amber-500`} /> : <Sunset className={`${cls} text-indigo-400`} />;
  if (code === 1 || code === 2) return <CloudSun className={`${cls} text-sky-500`} />;
  if (code === 3) return <Cloud className={`${cls} text-slate-400`} />;
  if (code === 45 || code === 48) return <CloudFog className={`${cls} text-slate-400`} />;
  if (code >= 51 && code <= 57) return <CloudDrizzle className={`${cls} text-sky-500`} />;
  if (code >= 61 && code <= 67) return <CloudRain className={`${cls} text-sky-600`} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={`${cls} text-sky-400`} />;
  if (code >= 80 && code <= 82) return <CloudRain className={`${cls} text-blue-600`} />;
  if (code >= 95) return <CloudLightning className={`${cls} text-violet-600`} />;
  return <Cloud className={`${cls} text-slate-400`} />;
}

export function EventGlyph({
  type,
  className = "h-4 w-4",
}: {
  type: EventType;
  className?: string;
}) {
  if (type === "Heavy Rain") return <Droplets className={`${className} text-sky-600`} />;
  if (type === "Flood") return <Waves className={`${className} text-cyan-600`} />;
  if (type === "Cyclone") return <Wind className={`${className} text-violet-600`} />;
  if (type === "Heatwave") return <ThermometerSun className={`${className} text-amber-500`} />;
  return <TriangleAlert className={`${className} text-rose-500`} />;
}

export function EventBadge({ type }: { type: EventType }) {
  const map: Record<EventType, string> = {
    "Heavy Rain": "bg-sky-50 text-sky-700",
    Flood: "bg-cyan-50 text-cyan-700",
    Cyclone: "bg-violet-50 text-violet-700",
    Heatwave: "bg-amber-50 text-amber-700",
    "Active Incident": "bg-rose-50 text-rose-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${map[type]}`}>
      <EventGlyph type={type} className="h-3.5 w-3.5" />
      {type === "Flood" ? "Flood Alert" : type}
    </span>
  );
}
