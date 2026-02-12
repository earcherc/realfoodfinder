import "server-only";

import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { linkSubmissions } from "@/db/schema";
import { matchCountry } from "@/lib/countries";
import type { LinkRecord } from "@/lib/link-model";
import { LOCATION_STATUS_VALUES, type LocationStatus } from "@/lib/location-types";

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

const statusSchema = z.enum(
  LOCATION_STATUS_VALUES as [LocationStatus, ...LocationStatus[]],
);

const listItemSchema = z.string().trim().min(1).max(60);

function normalizeArrayInput(list: string[]) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const item of list) {
    const value = item.trim();

    if (!value) {
      continue;
    }

    const key = value.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(value);
  }

  return normalized;
}

const countrySchema = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .refine((value) => Boolean(matchCountry(value)), {
    message: "Select a valid country from the list.",
  })
  .transform((value) => matchCountry(value) ?? value);

export const linkSubmissionSchema = z.object({
  title: z.string().trim().min(2).max(160),
  url: z.string().trim().url().max(2000),
  country: countrySchema,
  description: optionalString,
  products: z
    .array(listItemSchema)
    .transform((list) => normalizeArrayInput(list))
    .refine((list) => list.length > 0, {
      message: "Select at least one product type.",
    })
    .refine((list) => list.length <= 12, {
      message: "Select up to 12 product types.",
    }),
  tags: z
    .array(listItemSchema)
    .default([])
    .transform((list) => normalizeArrayInput(list))
    .refine((list) => list.length <= 12, {
      message: "Select up to 12 tags.",
    }),
  submitterName: optionalShortString,
  submitterEmail: z.string().trim().email().max(255),
});

const updateStatusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: statusSchema,
});

export type LinkSubmissionInput = z.infer<typeof linkSubmissionSchema>;

let localLinkId = 1000;
const localLinksStore: LinkRecord[] = [
  {
    id: 1,
    title: "Raw Mountain Honey",
    url: "https://example.com/raw-honey",
    country: "United States",
    description: "Small-batch raw honey from a local beekeeper network.",
    products: ["Honey"],
    tags: ["Raw", "Unfiltered"],
    submitterName: "Seed Data",
    submitterEmail: "seed@realfoodfinder.local",
    status: "approved",
    createdAt: new Date("2026-01-09T10:00:00.000Z"),
    updatedAt: new Date("2026-01-09T10:00:00.000Z"),
  },
];

function toLinkRecord(value: {
  id: number;
  title: string;
  url: string;
  country: string;
  description: string | null;
  products: string[] | null;
  tags: string[] | null;
  submitterName: string | null;
  submitterEmail: string;
  status: LocationStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}): LinkRecord {
  return {
    ...value,
    products: value.products ?? [],
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

export async function listApprovedLinks() {
  const db = getDb();

  if (!db) {
    return localLinksStore.filter((item) => item.status === "approved");
  }

  const rows = await db
    .select()
    .from(linkSubmissions)
    .where(eq(linkSubmissions.status, "approved"))
    .orderBy(desc(linkSubmissions.createdAt));

  return rows.map((row) => toLinkRecord(row as LinkRecord));
}

export async function listAllLinks() {
  const db = getDb();

  if (!db) {
    return [...localLinksStore].sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );
  }

  const rows = await db
    .select()
    .from(linkSubmissions)
    .orderBy(desc(linkSubmissions.createdAt));

  return rows.map((row) => toLinkRecord(row as LinkRecord));
}

export async function createLinkSubmission(input: LinkSubmissionInput) {
  const parsed = linkSubmissionSchema.parse(input);
  const db = getDb();

  if (!db) {
    const now = new Date();

    const item: LinkRecord = {
      id: localLinkId,
      title: parsed.title,
      url: parsed.url,
      country: parsed.country,
      description: parsed.description ?? null,
      products: parsed.products,
      tags: parsed.tags,
      submitterName: parsed.submitterName ?? null,
      submitterEmail: parsed.submitterEmail,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    localLinkId += 1;
    localLinksStore.push(item);
    return item;
  }

  const [created] = await db
    .insert(linkSubmissions)
    .values({
      title: parsed.title,
      url: parsed.url,
      country: parsed.country,
      description: parsed.description,
      products: parsed.products,
      tags: parsed.tags,
      submitterName: parsed.submitterName,
      submitterEmail: parsed.submitterEmail,
      status: "pending",
      updatedAt: new Date(),
    })
    .returning();

  return toLinkRecord(created as LinkRecord);
}

export async function updateLinkStatus(input: { id: number; status: LocationStatus }) {
  const parsed = updateStatusSchema.parse(input);
  const db = getDb();

  if (!db) {
    const index = localLinksStore.findIndex((item) => item.id === parsed.id);

    if (index === -1) {
      throw new Error("Link submission not found");
    }

    localLinksStore[index] = {
      ...localLinksStore[index],
      status: parsed.status,
      updatedAt: new Date(),
    };

    return localLinksStore[index];
  }

  const [updated] = await db
    .update(linkSubmissions)
    .set({
      status: parsed.status,
      updatedAt: new Date(),
    })
    .where(eq(linkSubmissions.id, parsed.id))
    .returning();

  if (!updated) {
    throw new Error("Link submission not found");
  }

  return toLinkRecord(updated as LinkRecord);
}
