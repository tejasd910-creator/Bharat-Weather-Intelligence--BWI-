import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SAMPLE = [
  ["Rohit Sharma", "Heavy Rainfall", "Mumbai", "Andheri Station, Western Line", "Waterlogging on main road near Andheri station. Traffic is slow and few vehicles are stuck.", 19.12, 72.85, "verified", 2],
  ["Priya Patel", "Heatwave", "Delhi", "Connaught Place", "Very hot weather in Delhi today, temperature feels above 44C. Avoid outdoor work in afternoon.", 28.63, 77.22, "verified", 5],
  ["Arjun Rao", "Thunderstorm", "Bangalore", "Koramangala 5th Block", "Strong thunder and lightning over Bangalore with heavy evening showers.", 12.93, 77.62, "pending", 1],
  ["Meena Das", "Flood", "Guwahati", "Fancy Bazaar", "Brahmaputra water level rising, low lying areas near market flooded.", 26.18, 91.74, "verified", 3],
  ["Vikram Singh", "Strong Winds", "Ahmedabad", "SG Highway", "Very strong dusty winds across the city, hoardings shaking. Drive carefully.", 23.05, 72.5, "pending", 4],
  ["Sneha Iyer", "Heavy Rainfall", "Chennai", "T Nagar", "Continuous rain since morning, streets waterlogged near Panagal park.", 13.04, 80.23, "pending", 6],
  ["Amit Kumar", "Thunderstorm", "Kolkata", "Salt Lake Sector V", "Nor'wester type storm with gusty winds and lightning in evening.", 22.58, 88.42, "verified", 8],
  ["Rahul Verma", "Strong Winds", "Pune", "Hinjewadi Phase 1", "Strong winds uprooted a small tree near IT park gate. No injuries reported.", 18.59, 73.73, "verified", 10],
  ["Kavya Nair", "Heatwave", "Jaipur", "MI Road", "Severe heat and hot winds (loo) in afternoon. Streets nearly empty.", 26.91, 75.8, "pending", 12],
  ["Deepak Joshi", "Cyclone", "Chennai", "Marina Beach", "Fake cyclone news circulating on WhatsApp about landfall tonight. No IMD alert exists.", 13.05, 80.28, "rejected", 9],
  ["Nisha Gupta", "Flood", "Mumbai", "Sion Circle", "Knee-deep water at Sion circle underpass, BEST buses diverted.", 19.04, 72.86, "verified", 14],
  ["Sanjay Mehta", "Hailstorm", "Hyderabad", "Gachibowli", "Small hailstones for about 10 minutes with heavy rain.", 17.44, 78.35, "pending", 18],
] as const;

async function main() {
  const { rows } = await pool.query("select count(*)::int as c from reports");
  if (rows[0].c > 0) {
    console.log(`reports table already has ${rows[0].c} rows — skipping seed.`);
    await pool.end();
    return;
  }
  for (const [name, type, city, loc, desc, lat, lng, status, hoursAgo] of SAMPLE) {
    await pool.query(
      `insert into reports (reporter_name, event_type, city, location, description, lat, lng, status, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8, now() - ($9 || ' hours')::interval)`,
      [name, type, city, loc, desc, lat, lng, status, String(hoursAgo)],
    );
  }
  console.log(`Seeded ${SAMPLE.length} sample reports.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
