import { useState } from "react";
import { Logo } from "../components/Layout";
import { useApp } from "../lib/context";

export default function Login() {
  const { login, navigate } = useApp();
  const [email, setEmail] = useState("analyst@nationalweather.in");
  const [role, setRole] = useState<"Administrator" | "Analyst" | "Citizen">("Analyst");

  return (
    <div className="map-bg grid min-h-screen place-items-center px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <Logo />
        <h1 className="font-display mt-6 text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Demo authentication — no password leaves the browser.</p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            login({
              name: role === "Administrator" ? "Priya Nair" : role === "Analyst" ? "Arjun Das" : "Citizen User",
              email,
              role,
            });
            navigate("dashboard");
          }}
        >
          <label className="block text-xs font-semibold text-slate-600">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option>Administrator</option>
              <option>Analyst</option>
              <option>Citizen</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Password
            <input type="password" defaultValue="weather" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white">Continue to dashboard</button>
        </form>
        <button onClick={() => navigate("home")} className="mt-4 w-full text-center text-sm text-slate-500">
          Back to home
        </button>
      </div>
    </div>
  );
}
