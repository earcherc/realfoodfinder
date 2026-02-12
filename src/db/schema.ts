import {
  doublePrecision,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const locationTypeEnum = pgEnum("location_type", [
  "farm",
  "home",
  "store",
  "dropoff",
  "other",
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
  foods: text("foods")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
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

export const linkSubmissions = pgTable("link_submissions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  url: text("url").notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  description: text("description"),
  products: text("products")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  submitterName: varchar("submitter_name", { length: 120 }),
  submitterEmail: varchar("submitter_email", { length: 255 }).notNull(),
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
export type LinkSubmissionRow = typeof linkSubmissions.$inferSelect;
export type NewLinkSubmissionRow = typeof linkSubmissions.$inferInsert;
