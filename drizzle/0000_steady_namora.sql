CREATE TYPE "public"."location_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."location_type" AS ENUM('farm', 'home', 'store', 'dropoff');--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"type" "location_type" NOT NULL,
	"description" text,
	"address" text,
	"country" varchar(100),
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"submitter_name" varchar(120),
	"submitter_email" varchar(255),
	"status" "location_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
