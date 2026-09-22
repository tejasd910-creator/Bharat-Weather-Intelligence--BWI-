import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CITIES, HOME_CITIES, INCIDENTS, REPORTS } from "./data";
import type {
  CitizenReportInput,
  CityWeather,
  EventType,
  Incident,
  Page,
  ReportRow,
  Severity,
  User,
  VerificationStatus,
} from "./types";
import { fallbackWeather, fetchManyCurrent } from "./weather";

interface AppState {
  page: Page;
  navigate: (p: Page) => void;
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  weather: CityWeather[];
  weatherLoading: boolean;
  weatherError: string | null;
  refreshWeather: () => void;
  reportOpen: boolean;
  setReportOpen: (v: boolean) => void;
  reports: ReportRow[];
  incidents: Incident[];
  addCitizenReport: (input: CitizenReportInput) => ReportRow;
  setReportStatus: (
    id: string,
    status: VerificationStatus,
    extra?: { note?: string; reviewer?: string }
  ) => void;
  pendingCitizenCount: number;
}

const Ctx = createContext<AppState | null>(null);

const VALID: Page[] = [
  "home",
  "livemap",
  "analytics",
  "reports",
  "ingestion",
  "pipeline",
  "forecast",
  "about",
  "contact",
  "login",
  "dashboard",
];

function pageFromHash(): Page {
  const h = window.location.hash.replace("#", "").replace("/", "") as Page;
  return VALID.includes(h) ? h : "home";
}

function formatReportTime(d = new Date()) {
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function uid() {
  return "cr-" + Math.random().toString(36).slice(2, 10);
}

function inferAi(type: EventType, desc: string) {
  let score = 0.62 + Math.random() * 0.22;
  if (desc.length > 80) score += 0.06;
  if (type === "Flood" || type === "Cyclone") score += 0.04;
  return Number(Math.min(0.97, score).toFixed(2));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [user, setUser] = useState<User | null>(null);
  const [weather, setWeather] = useState<CityWeather[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reports, setReports] = useState<ReportRow[]>(REPORTS);
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);

  const navigate = useCallback((p: Page) => {
    window.location.hash = p === "home" ? "" : p;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const refreshWeather = useCallback(() => {
    const targets = CITIES.filter((c) => (HOME_CITIES as readonly string[]).includes(c.id)).concat(
      CITIES.filter((c) => !HOME_CITIES.includes(c.id as (typeof HOME_CITIES)[number])).slice(0, 10)
    );
    const unique = Array.from(new Map(targets.map((c) => [c.id, c])).values());
    setWeatherLoading(true);
    fetchManyCurrent(unique)
      .then((rows) => {
        setWeather(rows);
        setWeatherError(null);
      })
      .catch((e) => {
        setWeatherError(e.message || "Failed to load Open-Meteo weather");
        setWeather(unique.map(fallbackWeather));
      })
      .finally(() => setWeatherLoading(false));
  }, []);

  useEffect(() => {
    refreshWeather();
    const id = setInterval(refreshWeather, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [refreshWeather]);

  const addCitizenReport = useCallback((input: CitizenReportInput) => {
    const city = CITIES.find((c) => c.name === input.city);
    const now = new Date();
    const id = uid();
    const ai = inferAi(input.type, input.desc);
    const severity: Severity =
      input.severity ||
      (input.type === "Flood" || input.type === "Cyclone" || input.type === "Active Incident" ? "High" : "Medium");
    const row: ReportRow = {
      id,
      datetime: formatReportTime(now),
      location: `${input.city}, ${input.state}`,
      city: input.city,
      state: input.state,
      event: input.type,
      source: "Citizen Report",
      aiConfidence: ai,
      status: "Under Review",
      frequency: 1,
      severity,
      text: input.desc,
      likes: 0,
      comments: 0,
      shares: 0,
      handle: `@${input.name.replace(/\s+/g, "_").toLowerCase()}`,
      citizen: true,
      reporterName: input.name,
      reporterPhone: input.phone,
      createdAt: now.getTime(),
      fakeScore: Number((Math.random() * 0.18).toFixed(2)),
      lat: city?.lat,
      lon: city?.lon,
    };
    const incident: Incident = {
      id: "inc-" + id,
      type: input.type,
      city: input.city,
      state: input.state,
      minutesAgo: 0,
      status: "Under Review",
      severity,
      source: "Citizen Report",
      aiConfidence: ai,
      frequency: 1,
      lat: city?.lat ?? 22.97,
      lon: city?.lon ?? 78.65,
      description: input.desc,
      citizen: true,
      reportId: id,
    };
    setReports((prev) => [row, ...prev]);
    setIncidents((prev) => [incident, ...prev]);
    return row;
  }, []);

  const setReportStatus = useCallback(
    (id: string, status: VerificationStatus, extra?: { note?: string; reviewer?: string }) => {
      const when = formatReportTime();
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                adminNote: extra?.note ?? r.adminNote,
                verifiedBy: extra?.reviewer ?? r.verifiedBy,
                verifiedAt: status === "Under Review" ? r.verifiedAt : when,
              }
            : r
        )
      );
      setIncidents((prev) =>
        prev.map((i) => (i.reportId === id || i.id === id || i.id === "inc-" + id ? { ...i, status } : i))
      );
    },
    []
  );

  const pendingCitizenCount = reports.filter((r) => r.citizen && r.status !== "Verified").length;

  const value = useMemo(
    () => ({
      page,
      navigate,
      user,
      login: setUser,
      logout: () => setUser(null),
      weather,
      weatherLoading,
      weatherError,
      refreshWeather,
      reportOpen,
      setReportOpen,
      reports,
      incidents,
      addCitizenReport,
      setReportStatus,
      pendingCitizenCount,
    }),
    [
      page,
      navigate,
      user,
      weather,
      weatherLoading,
      weatherError,
      refreshWeather,
      reportOpen,
      reports,
      incidents,
      addCitizenReport,
      setReportStatus,
      pendingCitizenCount,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}
