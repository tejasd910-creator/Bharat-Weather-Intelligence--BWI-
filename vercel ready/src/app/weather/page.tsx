import { Suspense } from "react";
import WeatherClient from "./WeatherClient";

export default function WeatherPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading weather…</div>}>
      <WeatherClient />
    </Suspense>
  );
}
