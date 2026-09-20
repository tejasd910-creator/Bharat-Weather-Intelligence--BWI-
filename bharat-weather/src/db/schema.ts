import {
  doublePrecision,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterName: text("reporter_name").notNull().default("Anonymous"),
  eventType: text("event_type").notNull(), // Heavy Rainfall | Flood | Heatwave | Thunderstorm | Strong Winds | Cyclone | Other
  city: text("city").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  imageData: text("image_data"), // base64 data URL
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  status: text("status").notNull().default("pending"), // pending | verified | rejected
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
