import "server-only";

import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { locations } from "@/db/schema";
import { geocodeAddress } from "@/lib/geocode";
import type { LocationRecord } from "@/lib/location-model";
import {
  FOOD_OPTIONS,
  LOCATION_STATUS_VALUES,
  LOCATION_TYPE_VALUES,
  TAG_OPTIONS,
  type LocationStatus,
  type LocationType,
} from "@/lib/location-types";

const optionalString = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalShortString = z
  .string()
  .trim()
  .max(120)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const locationTypeSchema = z.enum(
  LOCATION_TYPE_VALUES as [LocationType, ...LocationType[]],
);

const locationStatusSchema = z.enum(
  LOCATION_STATUS_VALUES as [LocationStatus, ...LocationStatus[]],
);

const foodOptionSchema = z.enum(FOOD_OPTIONS);
const tagOptionSchema = z.enum(TAG_OPTIONS);

export const locationSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: locationTypeSchema,
  description: optionalString,
  address: z.string().trim().min(5).max(255),
  foods: z
    .array(foodOptionSchema)
    .min(1, "Select at least one food item.")
    .max(16),
  tags: z.array(tagOptionSchema).max(16).default([]),
  submitterName: optionalShortString,
  submitterEmail: z.string().trim().email().max(255),
});

const updateStatusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: locationStatusSchema,
});

export type LocationSubmissionInput = z.infer<typeof locationSubmissionSchema>;

let localId = 1000;
const localStore: LocationRecord[] = [
  {
    id: 1,
    name: "Morning Dew Farm",
    type: "farm",
    description: "Pasture-raised eggs and seasonal vegetables.",
    address: "Dane County, Wisconsin",
    country: null,
    latitude: 43.1731,
    longitude: -89.4012,
    foods: ["Eggs", "Vegetables"],
    tags: ["Pasture-Raised", "No Spray"],
    submitterName: "Seed Data",
    submitterEmail: "seed@realfoodfinder.local",
    status: "approved",
    createdAt: new Date("2026-01-01T09:30:00.000Z"),
    updatedAt: new Date("2026-01-01T09:30:00.000Z"),
  },
  {
    id: 2,
    name: "El Bosque Community Drop",
    type: "dropoff",
    description: "Weekly produce pickup from nearby regenerative growers.",
    address: "San Jose, Costa Rica",
    country: null,
    latitude: 9.9281,
    longitude: -84.0907,
    foods: ["Vegetables", "Fruit", "Honey"],
    tags: ["Organic", "Regenerative"],
    submitterName: "Seed Data",
    submitterEmail: "seed@realfoodfinder.local",
    status: "approved",
    createdAt: new Date("2026-01-03T11:15:00.000Z"),
    updatedAt: new Date("2026-01-03T11:15:00.000Z"),
  },
  {
    id: 3,
    name: "Riverfront Whole Foods Collective",
    type: "store",
    description: "Local dairy, grain, and traditional ferments.",
    address: "Rotterdam, Netherlands",
    country: null,
    latitude: 51.9244,
    longitude: 4.4777,
    foods: ["Milk", "Butter", "Cheese"],
    tags: ["Unheated", "Unfiltered"],
    submitterName: "Seed Data",
    submitterEmail: "seed@realfoodfinder.local",
    status: "approved",
    createdAt: new Date("2026-01-08T14:20:00.000Z"),
    updatedAt: new Date("2026-01-08T14:20:00.000Z"),
  },
];

function toLocationRecord(value: {
  id: number;
  name: string;
  type: LocationType;
  description: string | null;
  address: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  foods: string[] | null;
  tags: string[] | null;
  submitterName: string | null;
  submitterEmail: string | null;
  status: LocationStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}): LocationRecord {
  return {
    ...value,
    foods: value.foods ?? [],
    tags: value.tags ?? [],
    createdAt:
      value.createdAt instanceof Date
        ? value.createdAt
        : new Date(value.createdAt),
    updatedAt:
      value.updatedAt instanceof Date
        ? value.updatedAt
        : new Date(value.updatedAt),
  };
}

export async function listApprovedLocations() {
  const db = getDb();

  if (!db) {
    return localStore.filter((location) => location.status === "approved");
  }

  const rows = await db
    .select()
    .from(locations)
    .where(eq(locations.status, "approved"))
    .orderBy(desc(locations.createdAt));

  return rows.map((row) => toLocationRecord(row as LocationRecord));
}

export async function listAllLocations() {
  const db = getDb();

  if (!db) {
    return [...localStore].sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );
  }

  const rows = await db.select().from(locations).orderBy(desc(locations.createdAt));

  return rows.map((row) => toLocationRecord(row as LocationRecord));
}

export async function createLocationSubmission(input: LocationSubmissionInput) {
  const parsed = locationSubmissionSchema.parse(input);
  const db = getDb();

  const coordinates = await geocodeAddress(parsed.address);

  if (!coordinates) {
    throw new Error(
      "Could not locate this place. Try a more specific street address or place name.",
    );
  }

  if (!db) {
    const now = new Date();

    const item: LocationRecord = {
      id: localId,
      name: parsed.name,
      type: parsed.type,
      description: parsed.description ?? null,
      address: parsed.address,
      country: null,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      foods: parsed.foods,
      tags: parsed.tags,
      submitterName: parsed.submitterName ?? null,
      submitterEmail: parsed.submitterEmail,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    localId += 1;
    localStore.push(item);

    return item;
  }

  const [created] = await db
    .insert(locations)
    .values({
      name: parsed.name,
      type: parsed.type,
      description: parsed.description,
      address: parsed.address,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      foods: parsed.foods,
      tags: parsed.tags,
      submitterName: parsed.submitterName,
      submitterEmail: parsed.submitterEmail,
      status: "pending",
      updatedAt: new Date(),
    })
    .returning();

  return toLocationRecord(created as LocationRecord);
}

export async function updateLocationStatus(input: {
  id: number;
  status: LocationStatus;
}) {
  const parsed = updateStatusSchema.parse(input);
  const db = getDb();

  if (!db) {
    const index = localStore.findIndex((item) => item.id === parsed.id);

    if (index === -1) {
      throw new Error("Location not found");
    }

    localStore[index] = {
      ...localStore[index],
      status: parsed.status,
      updatedAt: new Date(),
    };

    return localStore[index];
  }

  const [updated] = await db
    .update(locations)
    .set({
      status: parsed.status,
      updatedAt: new Date(),
    })
    .where(eq(locations.id, parsed.id))
    .returning();

  if (!updated) {
    throw new Error("Location not found");
  }

  return toLocationRecord(updated as LocationRecord);
}
