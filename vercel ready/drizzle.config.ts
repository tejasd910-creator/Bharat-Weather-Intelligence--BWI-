import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Reads DATABASE_URL from the shell or .env, so the same config works for
// local Postgres and for a hosted DB (Neon / Supabase / Vercel Marketplace).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
