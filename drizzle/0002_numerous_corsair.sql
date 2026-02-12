CREATE TABLE "link_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(160) NOT NULL,
	"url" text NOT NULL,
	"country" varchar(100) NOT NULL,
	"description" text,
	"products" text[] DEFAULT '{}'::text[] NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"submitter_name" varchar(120),
	"submitter_email" varchar(255) NOT NULL,
	"status" "location_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
