import "server-only";

import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { locations } from "@/db/schema";
import type { LocationRecord } from "@/lib/location-model";
import {
  LOCATION_STATUS_VALUES,
  LOCATION_TYPE_VALUES,
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

const optionalAddressString = z
  .string()
  .trim()
  .max(255)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalEmailString = z
  .string()
  .trim()
  .email()
  .max(255)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const locationTypeSchema = z.enum(
  LOCATION_TYPE_VALUES as [LocationType, ...LocationType[]],
);

const locationStatusSchema = z.enum(
  LOCATION_STATUS_VALUES as [LocationStatus, ...LocationStatus[]],
);

export const locationSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: locationTypeSchema,
  description: optionalString,
  address: optionalAddressString,
  country: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  submitterName: optionalShortString,
  submitterEmail: optionalEmailString,
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
    address: "Dane County",
    country: "USA",
    latitude: 43.1731,
    longitude: -89.4012,
    submitterName: "Seed Data",
    submitterEmail: null,
    status: "approved",
    createdAt: new Date("2026-01-01T09:30:00.000Z"),
    updatedAt: new Date("2026-01-01T09:30:00.000Z"),
  },
  {
    id: 2,
    name: "El Bosque Community Drop",
    type: "dropoff",
    description: "Weekly produce pickup from nearby regenerative growers.",
    address: "San Jose",
    country: "Costa Rica",
    latitude: 9.9281,
    longitude: -84.0907,
    submitterName: "Seed Data",
    submitterEmail: null,
    status: "approved",
    createdAt: new Date("2026-01-03T11:15:00.000Z"),
    updatedAt: new Date("2026-01-03T11:15:00.000Z"),
  },
  {
    id: 3,
    name: "Riverfront Whole Foods Collective",
    type: "store",
    description: "Local dairy, grain, and traditional ferments.",
    address: "Rotterdam",
    country: "Netherlands",
    latitude: 51.9244,
    longitude: 4.4777,
    submitterName: "Seed Data",
    submitterEmail: null,
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
  submitterName: string | null;
  submitterEmail: string | null;
  status: LocationStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}): LocationRecord {
  return {
    ...value,
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

function isMissingTableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  return "code" in error && error.code === "42P01";
}

export async function listApprovedLocations() {
  const db = getDb();

  if (!db) {
    return localStore.filter((location) => location.status === "approved");
  }

  try {
    const rows = await db
      .select()
      .from(locations)
      .where(eq(locations.status, "approved"))
      .orderBy(desc(locations.createdAt));

    return rows.map((row) => toLocationRecord(row as LocationRecord));
  } catch (error) {
    if (isMissingTableError(error)) {
      return [];
    }

    throw error;
  }
}

export async function listAllLocations() {
  const db = getDb();

  if (!db) {
    return [...localStore].sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );
  }

  try {
    const rows = await db
      .select()
      .from(locations)
      .orderBy(desc(locations.createdAt));

    return rows.map((row) => toLocationRecord(row as LocationRecord));
  } catch (error) {
    if (isMissingTableError(error)) {
      return [];
    }

    throw error;
  }
}

export async function createLocationSubmission(input: LocationSubmissionInput) {
  const parsed = locationSubmissionSchema.parse(input);
  const db = getDb();

  if (!db) {
    const now = new Date();

    const item: LocationRecord = {
      id: localId,
      name: parsed.name,
      type: parsed.type,
      description: parsed.description ?? null,
      address: parsed.address ?? null,
      country: parsed.country ?? null,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      submitterName: parsed.submitterName ?? null,
      submitterEmail: parsed.submitterEmail ?? null,
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
      country: parsed.country,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
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
