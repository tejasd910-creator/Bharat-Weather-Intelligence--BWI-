import { Brain, Database, MapPin, Radio, Shield, Users } from "lucide-react";
import { PageHeader, Shell } from "../components/Layout";
import { useApp } from "../lib/context";

export default function About() {
  const { navigate } = useApp();
  return (
    <Shell>
      <PageHeader
        icon={<Shield className="h-5 w-5" />}
        title="About Us"
        subtitle="Building a national weather intelligence fabric for India"
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="card p-6">
          <h2 className="font-display text-xl font-bold text-slate-900">Our mission</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The Bharat Weather Intelligence fuses official observations, Open-Meteo forecasts,
            news wires, social streams and citizen reports into a single, verifiable picture of weather risk
            across India. We help disaster managers, journalists and the public act minutes — not hours — earlier.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Incoming documents are collected by ingest services, published to Apache Kafka, cleaned and enriched
            with Apache Flink, scored by an AI/ML layer (classification, fake-news, duplicates, trust, severity)
            and materialised as real events in MongoDB and Cassandra. React dashboards and an admin verification
            desk sit on Node.js REST APIs.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { icon: Database, t: "Multi-source ingest", d: "IMD, Open-Meteo, social, news, citizen app" },
              { icon: Brain, t: "AI verification", d: "Trust scores, fake detection, event typing" },
              { icon: MapPin, t: "GIS live map", d: "Rainfall, flood and heat layers over India" },
              { icon: Radio, t: "Streaming fabric", d: "Kafka + Flink with sub-second lag" },
            ].map((x) => (
              <div key={x.t} className="rounded-xl bg-slate-50 p-4">
                <x.icon className="h-5 w-5 text-blue-600" />
                <div className="mt-2 text-sm font-semibold">{x.t}</div>
                <div className="text-xs text-slate-500">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl">
          <img
            src="https://images.pexels.com/photos/11783119/pexels-photo-11783119.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
            alt="Operations room"
            className="h-64 w-full object-cover lg:h-full"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { n: "28+", l: "States & UTs covered" },
          { n: "5", l: "AI models in the ensemble" },
          { n: "24/7", l: "Streaming operations" },
        ].map((s) => (
          <div key={s.l} className="card p-6 text-center">
            <div className="font-display text-3xl font-extrabold text-blue-600">{s.n}</div>
            <div className="mt-1 text-sm text-slate-500">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <div className="font-semibold">Want to partner or report on the ground?</div>
            <div className="text-sm text-slate-500">District control rooms, NDMA units and campus labs welcome.</div>
          </div>
        </div>
        <button
          onClick={() => navigate("contact")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Contact the team
        </button>
      </div>
    </Shell>
  );
}
