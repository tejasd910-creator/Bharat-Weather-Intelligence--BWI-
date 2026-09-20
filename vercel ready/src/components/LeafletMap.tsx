"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { EVENT_ICONS, timeAgo } from "@/lib/weather";

export type MapAlert = {
  id: number;
  eventType: string;
  city: string;
  location: string;
  description?: string;
  status: string;
  lat: number;
  lng: number;
  createdAt?: string;
};

function statusColor(status: string) {
  return status === "verified"
    ? "#10b981"
    : status === "rejected"
      ? "#94a3b8"
      : "#f43f5e";
}

function makeIcon(alert: MapAlert, selected: boolean) {
  const color = statusColor(alert.status);
  const size = selected ? 42 : 34;
  const emoji = EVENT_ICONS[alert.eventType] ?? "🌦️";
  return L.divIcon({
    className: "bwi-marker",
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;transform:translate(-50%,-100%);">
        <span style="position:absolute;left:50%;top:0;transform:translate(-50%,0);width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${color};transform-origin:center;rotate:-45deg;box-shadow:0 3px 8px rgba(0,0,0,.35);border:2px solid #fff;"></span>
        <span style="position:absolute;left:50%;top:${size * 0.32}px;transform:translate(-50%,-50%);font-size:${size * 0.42}px;line-height:1;">${emoji}</span>
        ${
          selected
            ? `<span style="position:absolute;left:50%;top:0;transform:translate(-50%,0);width:${size}px;height:${size}px;border-radius:50%;background:${color};opacity:.25;animation:bwi-ping 1.6s ease-out infinite;"></span>`
            : ""
        }
      </div>`,
    iconSize: [size, size],
    iconAnchor: [0, 0],
  });
}

function FlyTo({ target }: { target: MapAlert | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 8), {
        duration: 0.8,
      });
    }
  }, [target, map]);
  return null;
}

export default function LeafletMap({
  alerts,
  selectedId,
  onSelect,
}: {
  alerts: MapAlert[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
}) {
  const selected = useMemo(
    () => alerts.find((a) => a.id === selectedId) ?? null,
    [alerts, selectedId],
  );

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <MapContainer
        center={[22.35, 79]}
        zoom={5}
        minZoom={3}
        maxZoom={18}
        scrollWheelZoom
        zoomControl
        className="h-full w-full"
        style={{ background: "#dbeafe" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo target={selected} />
        {alerts.map((a) => (
          <Marker
            key={a.id}
            position={[a.lat, a.lng]}
            icon={makeIcon(a, selectedId === a.id)}
            eventHandlers={{ click: () => onSelect?.(a.id) }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="text-sm font-bold">
                  {EVENT_ICONS[a.eventType] ?? "🌦️"} {a.eventType} — {a.city}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{a.location}</p>
                {a.description && (
                  <p className="mt-1 text-xs text-slate-600">{a.description}</p>
                )}
                <p className="mt-1 text-[11px] font-semibold" style={{ color: statusColor(a.status) }}>
                  {a.status === "verified"
                    ? "✓ Verified"
                    : a.status === "rejected"
                      ? "Rejected"
                      : "Unverified"}
                  {a.createdAt ? ` · ${timeAgo(a.createdAt)}` : ""}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] space-y-1.5 rounded-xl bg-white/90 p-3 text-[11px] font-semibold text-slate-600 shadow backdrop-blur">
        <p className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Verified Alert
        </p>
        <p className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Unverified Alert
        </p>
        <p className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Rejected / Archived
        </p>
      </div>
    </div>
  );
}
