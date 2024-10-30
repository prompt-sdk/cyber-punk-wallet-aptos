CREATE TABLE IF NOT EXISTS "Agent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" varchar(256) NOT NULL,
	"avatar" varchar(256) NOT NULL,
	"intro" varchar(256),
	"prompt" text NOT NULL,
	"suggestedActions" json,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Tool" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"typeName" varchar(64) NOT NULL,
	"description" text,
	"params" json,
	"generic_type_params" text[] DEFAULT ARRAY[]::text[],
	"functions" varchar(256),
	"typeFunction" varchar(64),
	"accessToken" text,
	"spec" json,
	"prompt" text,
	"code" text,
	"toolImportWidget" text[] DEFAULT ARRAY[]::text[],
	"userId" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Tool" ADD CONSTRAINT "Tool_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
