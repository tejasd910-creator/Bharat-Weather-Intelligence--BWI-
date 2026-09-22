import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { EVENT_META } from "../lib/data";
import type { Incident } from "../lib/types";

type Layer = "rain" | "flood" | "heat";

function markerHtml(hex: string, count: number, active: boolean, citizen?: boolean) {
  return `
    <div style="position:relative;display:grid;place-items:center;">
      <span style="position:absolute;width:34px;height:34px;border-radius:9999px;background:${hex};opacity:0.22;${
        active ? "animation:pulse-ring 2s ease-out infinite;" : ""
      }"></span>
      <span style="position:relative;display:grid;place-items:center;width:${active ? 30 : 26}px;height:${
        active ? 30 : 26
      }px;border-radius:9999px;background:white;border:2.5px solid ${hex};color:${hex};font:700 12px Inter,sans-serif;box-shadow:0 2px 6px rgba(15,23,42,.25);">${count}</span>
      ${
        citizen
          ? `<span style="position:absolute;top:-4px;right:-4px;width:10px;height:10px;border-radius:9999px;background:#10b981;border:2px solid white;"></span>`
          : ""
      }
    </div>`;
}

export function LeafletMap({
  incidents,
  selected,
  onSelect,
  layer,
}: {
  incidents: Incident[];
  selected?: string | null;
  onSelect?: (id: string) => void;
  layer: Layer;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circlesRef = useRef<L.Circle[]>([]);
  const tileRef = useRef<L.TileLayer | null>(null);

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [22.9, 80.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
      worldCopyJump: true,
    });
    // OpenStreetMap standard tiles — free, no API key, no watermark.
    tileRef.current = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);
    mapRef.current = map;
    // fix tile sizing after mount
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // draw markers + heat circles when data/layer/selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    circlesRef.current.forEach((c) => c.remove());
    circlesRef.current = [];

    const visible = incidents.filter((i) => {
      if (layer === "rain") return i.type === "Heavy Rain" || i.type === "Flood";
      if (layer === "flood") return i.type === "Flood";
      return true;
    });

    // heat halos
    if (layer === "heat") {
      for (const i of incidents) {
        const hex =
          i.type === "Heatwave"
            ? "#fb923c"
            : i.type === "Flood"
              ? "#22d3ee"
              : i.type === "Cyclone"
                ? "#a78bfa"
                : "#38bdf8";
        const circle = L.circle([i.lat, i.lon], {
          radius: 40000 + (i.rainfallMm || 20) * 900,
          color: hex,
          weight: 0,
          fillColor: hex,
          fillOpacity: 0.18,
        }).addTo(map);
        circlesRef.current.push(circle);
      }
    }

    // cluster by city
    const clusters = new Map<
      string,
      { lat: number; lon: number; n: number; type: Incident["type"]; ids: string[]; citizen?: boolean }
    >();
    for (const i of visible) {
      const prev = clusters.get(i.city);
      if (prev) {
        prev.n += 1;
        prev.ids.push(i.id);
        prev.citizen = prev.citizen || i.citizen;
      } else {
        clusters.set(i.city, { lat: i.lat, lon: i.lon, n: 1, type: i.type, ids: [i.id], citizen: i.citizen });
      }
    }

    for (const c of clusters.values()) {
      const meta = EVENT_META[c.type];
      const active = c.ids.includes(selected || "");
      const icon = L.divIcon({
        html: markerHtml(meta.hex, c.n, active, c.citizen),
        className: "nw-marker",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const marker = L.marker([c.lat, c.lon], { icon, zIndexOffset: active ? 1000 : 0 }).addTo(map);
      const first = visible.find((i) => i.id === c.ids[0]);
      if (first) {
        marker.bindTooltip(
          `<strong>${first.city}, ${first.state}</strong><br/>${
            first.type === "Flood" ? "Flood Alert" : first.type
          } · ${first.status}<br/>AI ${first.aiConfidence.toFixed(2)}${
            first.citizen ? " · Citizen" : ""
          }`,
          { direction: "top", offset: [0, -14], className: "nw-tip" }
        );
      }
      marker.on("click", () => onSelect?.(c.ids[0]));
      markersRef.current.push(marker);
    }
  }, [incidents, layer, selected, onSelect]);

  // pan to selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;
    const hit = incidents.find((i) => i.id === selected);
    if (hit) map.panTo([hit.lat, hit.lon], { animate: true });
  }, [selected, incidents]);

  return <div ref={containerRef} className="h-full w-full" />;
}
