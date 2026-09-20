export type SocialClass = "relevant" | "fake" | "other";

export type Sentiment = "positive" | "neutral" | "negative" | "panic";

export type AiAnalysis = {
  relevance: number; // 0-100 weather relevance
  credibility: number; // 0-100 trust score
  severity: number; // 0-100 event severity
  confidence: number; // 0-100 model confidence in classification
  sentiment: Sentiment;
  isDuplicate: boolean;
  botLikelihood: number; // 0-100
  keywords: string[];
};

export type SocialPost = {
  id: number;
  handle: string;
  avatarHue: number;
  text: string;
  city: string;
  classification: SocialClass;
  time: number; // epoch ms
  ai: AiAnalysis;
};

const HANDLES = [
  "@weatherindia",
  "@mumbairains",
  "@delhiwalla",
  "@blrweather",
  "@indianweatherman",
  "@newsupdate24",
  "@monsoontracker",
  "@skywatcher_in",
  "@cityalerts",
  "@rainman_bombay",
  "@chennaiweather",
  "@imd_watch",
];

const RELEVANT_TEMPLATES = [
  "Heavy rains in {city} since morning. Roads are waterlogged near the main junction. #Monsoon",
  "Strong winds expected in {city} this evening. Secure loose objects. #WeatherAlert",
  "Visibility dropping fast in {city} due to dense clouds. Drive slow! #Weather",
  "Temperature touching {temp}°C in {city} today. Stay hydrated. #Heatwave",
  "Thunder and lightning over {city} right now. Spectacular but stay indoors! ⛈️",
  "Waterlogging reported at underpass in {city}. Traffic diverted. #TrafficAlert",
  "Light drizzle turning into steady rain in {city}. Carry umbrellas. ☔",
  "IMD issues orange alert for {city} district for next 24 hours. #IMDAlert",
  "Hailstorm reported in outskirts of {city}. Crops may be affected. #Weather",
  "Sea is rough at {city} coastline, fishermen advised not to venture out.",
];

const FAKE_TEMPLATES = [
  "BREAKING: Cyclone to hit {city} tomorrow, government hiding info!! Forward to all!!",
  "Fake news alert: No cyclone in Bay of Bengal despite viral posts. #FactCheck",
  "{city} will be submerged by tonight says viral WhatsApp forward. TOTALLY FALSE.",
  "Shocking!! Snowfall predicted in {city} this weekend!! Share now!!",
  "Alert!! Dams near {city} opened without warning — unverified viral claim.",
  "Meteor shower will cause storms in {city}?? Viral post is misleading. #Fake",
];

const OTHER_TEMPLATES = [
  "Beautiful sunset in {city} today 😍 #photography",
  "Perfect weather for chai and pakoras in {city} ☕",
  "Match day in {city}! Hope the rain stays away 🏏",
  "Morning walk vibes in {city} today. So pleasant!",
  "Anyone else loving this {city} breeze today? 🍃",
  "Cloudy skies over {city} make for great photos. #skygram",
];

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Pune",
  "Hyderabad",
  "Ahmedabad",
  "Guwahati",
  "Jaipur",
];

let counter = 1000;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const rand = (min: number, max: number) =>
  Math.round(min + Math.random() * (max - min));

const WEATHER_KEYWORDS = [
  "rain",
  "flood",
  "storm",
  "wind",
  "heatwave",
  "cyclone",
  "waterlogging",
  "thunder",
  "hail",
  "monsoon",
  "alert",
];

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found = WEATHER_KEYWORDS.filter((k) => lower.includes(k));
  return found.slice(0, 3);
}

function analyze(text: string, classification: SocialClass): AiAnalysis {
  const keywords = extractKeywords(text);
  if (classification === "relevant") {
    return {
      relevance: rand(78, 98),
      credibility: rand(70, 95),
      severity: rand(45, 90),
      confidence: rand(82, 97),
      sentiment: Math.random() < 0.6 ? "negative" : "neutral",
      isDuplicate: Math.random() < 0.15,
      botLikelihood: rand(2, 20),
      keywords: keywords.length ? keywords : ["weather"],
    };
  }
  if (classification === "fake") {
    return {
      relevance: rand(40, 75),
      credibility: rand(5, 30),
      severity: rand(20, 55),
      confidence: rand(80, 96),
      sentiment: "panic",
      isDuplicate: Math.random() < 0.5,
      botLikelihood: rand(55, 92),
      keywords: keywords.length ? keywords : ["misinformation"],
    };
  }
  return {
    relevance: rand(8, 35),
    credibility: rand(45, 80),
    severity: rand(2, 20),
    confidence: rand(70, 90),
    sentiment: Math.random() < 0.7 ? "positive" : "neutral",
    isDuplicate: Math.random() < 0.1,
    botLikelihood: rand(5, 30),
    keywords: keywords.length ? keywords : ["chit-chat"],
  };
}

export function generatePost(): SocialPost {
  const r = Math.random();
  const classification: SocialClass =
    r < 0.62 ? "relevant" : r < 0.8 ? "fake" : "other";
  const template =
    classification === "relevant"
      ? pick(RELEVANT_TEMPLATES)
      : classification === "fake"
        ? pick(FAKE_TEMPLATES)
        : pick(OTHER_TEMPLATES);
  const city = pick(CITIES);
  const text = template
    .replace(/\{city\}/g, city)
    .replace(/\{temp\}/g, String(34 + Math.floor(Math.random() * 8)));
  counter += 1;
  return {
    id: counter,
    handle: pick(HANDLES),
    avatarHue: Math.floor(Math.random() * 360),
    text,
    city,
    classification,
    time: Date.now(),
    ai: analyze(text, classification),
  };
}

export function seedPosts(n: number): SocialPost[] {
  const out: SocialPost[] = [];
  for (let i = 0; i < n; i++) {
    const p = generatePost();
    p.time = Date.now() - (n - i) * 1000 * (30 + Math.random() * 240);
    out.push(p);
  }
  return out.reverse();
}
