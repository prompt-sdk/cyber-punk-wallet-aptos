ALTER TABLE "Agent" ADD COLUMN "tool" json;--> statement-breakpoint
ALTER TABLE "Tool" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "Tool" ADD COLUMN "type_params" json;--> statement-breakpoint
ALTER TABLE "Tool" ADD COLUMN "toolWidget" json;--> statement-breakpoint
ALTER TABLE "Tool" DROP COLUMN IF EXISTS "generic_type_params";--> statement-breakpoint
ALTER TABLE "Tool" DROP COLUMN IF EXISTS "toolImportWidget";