import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader, Shell } from "../components/Layout";

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <Shell>
      <PageHeader title="Contact" subtitle="Reach the National Weather operations desk" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          <Info icon={<Mail className="h-4 w-4" />} t="Email" d="ops@nationalweather.in" />
          <Info icon={<Phone className="h-4 w-4" />} t="24×7 desk" d="+91 11 2345 6789" />
          <Info icon={<MapPin className="h-4 w-4" />} t="HQ" d="India Meteorological Campus, New Delhi" />
          <div className="overflow-hidden rounded-2xl">
            <img
              src="https://images.pexels.com/photos/32529341/pexels-photo-32529341.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
              alt="Control room"
              className="h-56 w-full object-cover"
            />
          </div>
        </div>
        <form
          className="card space-y-3 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          {sent ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <p className="mt-3 font-semibold">Message sent</p>
              <p className="text-sm text-slate-500">An analyst will get back within one working day.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" />
                <Field label="Email" type="email" />
              </div>
              <Field label="Organisation" />
              <label className="block text-xs font-semibold text-slate-600">
                Message
                <textarea required rows={5} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </label>
              <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white">Send message</button>
            </>
          )}
        </form>
      </div>
    </Shell>
  );
}

function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="block text-xs font-semibold text-slate-600">
      {label}
      <input required type={type} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
    </label>
  );
}

function Info({ icon, t, d }: { icon: React.ReactNode; t: string; d: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">{icon}</div>
      <div>
        <div className="text-xs text-slate-400">{t}</div>
        <div className="text-sm font-semibold">{d}</div>
      </div>
    </div>
  );
}
