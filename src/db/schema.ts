import {
  doublePrecision,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const locationTypeEnum = pgEnum("location_type", [
  "farm",
  "home",
  "store",
  "dropoff",
]);

export const locationStatusEnum = pgEnum("location_status", [
  "pending",
  "approved",
  "rejected",
]);

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  type: locationTypeEnum("type").notNull(),
  description: text("description"),
  address: text("address"),
  country: varchar("country", { length: 100 }),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  submitterName: varchar("submitter_name", { length: 120 }),
  submitterEmail: varchar("submitter_email", { length: 255 }),
  status: locationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type LocationRow = typeof locations.$inferSelect;
export type NewLocationRow = typeof locations.$inferInsert;
