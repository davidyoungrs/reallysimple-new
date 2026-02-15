CREATE TABLE "business_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"data" jsonb NOT NULL,
	"slug" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "business_cards_uid_unique" UNIQUE("uid"),
	CONSTRAINT "business_cards_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "card_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" integer,
	"type" text NOT NULL,
	"target_info" text,
	"clicked_at" timestamp DEFAULT now(),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "card_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" integer,
	"viewed_at" timestamp DEFAULT now(),
	"referrer" text,
	"user_agent" text,
	"city" text,
	"region" text,
	"country" text,
	"latitude" text,
	"longitude" text,
	"ip_address" text,
	"device_type" text,
	"source" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "card_clicks" ADD CONSTRAINT "card_clicks_card_id_business_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."business_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_views" ADD CONSTRAINT "card_views_card_id_business_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."business_cards"("id") ON DELETE cascade ON UPDATE no action;