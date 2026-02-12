ALTER TYPE "public"."location_type" ADD VALUE 'other';--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "foods" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;