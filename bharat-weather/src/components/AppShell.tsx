"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useApp } from "@/lib/store";

const USER_NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/weather", label: "Live Weather", icon: "🌤️" },
  { href: "/report", label: "Report Event", icon: "📝" },
  { href: "/map", label: "Live Map", icon: "🗺️" },
  { href: "/social", label: "Social Media", icon: "💬" },
  { href: "/pipeline", label: "Data Pipeline", icon: "🔀" },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Admin Dashboard", icon: "📊" },
  { href: "/admin/verify", label: "Verification Panel", icon: "✅" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole, userName } = useApp();
  const pathname = usePathname();

  const nav = role === "admin" ? [...USER_NAV, ...ADMIN_NAV] : USER_NAV;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-[#0b1524] text-slate-300 md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-lg shadow-lg shadow-blue-900/40">
            🌦️
          </span>
          <span className="text-sm font-bold leading-tight text-white">
            Bharat Weather
            <br />
            <span className="font-medium text-sky-300">Intelligence</span>
          </span>
        </Link>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href + "/")) ||
                  (item.href === "/admin" && pathname === "/admin");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white ${
                role === "admin" ? "bg-rose-600" : "bg-blue-600"
              }`}
            >
              {userName.charAt(0)}
            </span>
            <div className="text-xs">
              <p className="font-semibold text-white">{userName}</p>
              <p className="capitalize text-slate-400">
                {role === "admin" ? "Administrator" : "User"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen w-full flex-col md:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-base">
              🌦️
            </span>
            <span className="text-sm font-bold">Bharat Weather Intelligence</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Live — real-time weather &amp; citizen intelligence
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setRole("user")}
                className={`rounded-full px-4 py-1.5 transition ${
                  role === "user"
                    ? "bg-white text-blue-700 shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                User
              </button>
              <button
                onClick={() => setRole("admin")}
                className={`rounded-full px-4 py-1.5 transition ${
                  role === "admin"
                    ? "bg-white text-rose-600 shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Admin
              </button>
            </div>
            <span className="hidden rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white sm:block">
              {userName}
            </span>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
