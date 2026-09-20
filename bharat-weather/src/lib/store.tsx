"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { generatePost, seedPosts, type SocialPost } from "@/lib/social";

export type Role = "user" | "admin";

type AppState = {
  role: Role;
  setRole: (r: Role) => void;
  userName: string;
  posts: SocialPost[];
  totals: { total: number; relevant: number; fake: number; other: number };
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("user");
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [totals, setTotals] = useState({
    total: 1248,
    relevant: 842,
    fake: 156,
    other: 250,
  });
  const started = useRef(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (window.localStorage.getItem("bwi-role") as Role | null)
        : null;
    if (saved === "admin" || saved === "user") setRoleState(saved);
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    try {
      window.localStorage.setItem("bwi-role", r);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    setPosts(seedPosts(12));
    const id = window.setInterval(() => {
      const p = generatePost();
      setPosts((prev) => [p, ...prev].slice(0, 60));
      setTotals((t) => ({
        total: t.total + 1,
        relevant: t.relevant + (p.classification === "relevant" ? 1 : 0),
        fake: t.fake + (p.classification === "fake" ? 1 : 0),
        other: t.other + (p.classification === "other" ? 1 : 0),
      }));
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const userName = role === "admin" ? "Admin" : "Rohit Sharma";

  return (
    <AppContext.Provider value={{ role, setRole, userName, posts, totals }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
