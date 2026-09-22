export type Page =
  | "home"
  | "livemap"
  | "analytics"
  | "reports"
  | "ingestion"
  | "pipeline"
  | "forecast"
  | "about"
  | "contact"
  | "login"
  | "dashboard";

export type EventType =
  | "Heavy Rain"
  | "Flood"
  | "Cyclone"
  | "Heatwave"
  | "Active Incident";

export type VerificationStatus = "Verified" | "Under Review" | "Unverified";

export type SourceType = "Social Media" | "News" | "APIs" | "Citizen Reports";

export type Severity = "High" | "Medium" | "Low";

export interface City {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  x: number;
  y: number;
}

export interface Incident {
  id: string;
  type: EventType;
  city: string;
  state: string;
  minutesAgo: number;
  status: VerificationStatus;
  severity: Severity;
  source: string;
  aiConfidence: number;
  frequency: number;
  lat: number;
  lon: number;
  description: string;
  rainfallMm?: number;
  citizen?: boolean;
  reportId?: string;
}

export interface ReportRow {
  id: string;
  datetime: string;
  location: string;
  city: string;
  state: string;
  event: EventType;
  source: string;
  aiConfidence: number;
  status: VerificationStatus;
  frequency: number;
  severity: Severity;
  text: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  handle?: string;
  citizen?: boolean;
  reporterName?: string;
  reporterPhone?: string;
  adminNote?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt?: number;
  fakeScore?: number;
  lat?: number;
  lon?: number;
}

export interface CitizenReportInput {
  name: string;
  phone?: string;
  city: string;
  state: string;
  type: EventType;
  severity: Severity;
  desc: string;
}

export interface SocialPost {
  id: string;
  platform: "X" | "News" | "Citizen" | "API" | "Facebook" | "YouTube";
  author: string;
  handle: string;
  text: string;
  location: string;
  state: string;
  eventType: EventType;
  aiScore: number;
  fakeScore: number;
  duplicateScore: number;
  trustScore: number;
  sentiment: "Negative" | "Neutral" | "Positive" | "Urgent";
  severity: Severity;
  status: VerificationStatus;
  timestamp: number;
  keywords: string[];
  classified: string;
}

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  apparent: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  windDir: number;
  cloudCover: number;
  pressure: number;
  isDay: boolean;
  time: string;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  tMax: number;
  tMin: number;
  precip: number;
  precipProb: number;
  uv: number;
  windMax: number;
  sunrise: string;
  sunset: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipProb: number;
  precip: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
}

export interface CityWeather {
  city: City;
  current: WeatherCurrent | null;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  loading: boolean;
  error?: string;
}

export interface User {
  name: string;
  email: string;
  role: "Administrator" | "Analyst" | "Citizen";
}
