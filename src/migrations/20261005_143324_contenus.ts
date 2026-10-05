import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_slug" AS ENUM('accueil', 'ong', 'mot-de-la-presidente', 'organisation', 'projets', 'actualites', 'adhesion', 'mediatheque', 'partenariats', 'transparence', 'contact', 'confidentialite', 'mentions-legales');
  CREATE TYPE "public"."enum_projets_icon" AS ENUM('graduation-cap', 'heart-pulse', 'trophy', 'handshake');
  CREATE TABLE "pages_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_sections_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "pages_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" "enum_pages_slug" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"seo_title" varchar,
  	"meta_description" varchar,
  	"h1" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "actualites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"publie" boolean DEFAULT true,
  	"date" timestamp(3) with time zone,
  	"image_id" integer,
  	"source_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "actualites_locales" (
  	"title" varchar NOT NULL,
  	"category" varchar,
  	"date_label" varchar,
  	"excerpt" varchar,
  	"body" varchar,
  	"source_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"icon" "enum_projets_icon",
  	"image_id" integer,
  	"source_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projets_locales" (
  	"theme" varchar NOT NULL,
  	"title" varchar,
  	"summary" varchar,
  	"body" varchar,
  	"source_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "medias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"galerie" boolean DEFAULT false,
  	"provisoire" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "medias_locales" (
  	"alt" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "reglages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"facebook_url" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "reglages_locales" (
  	"location" varchar,
  	"footer_tagline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "reglages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"medias_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "actualites_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projets_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "medias_id" integer;
  ALTER TABLE "pages_sections_items" ADD CONSTRAINT "pages_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections_ctas" ADD CONSTRAINT "pages_sections_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections" ADD CONSTRAINT "pages_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "actualites" ADD CONSTRAINT "actualites_image_id_medias_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "actualites_locales" ADD CONSTRAINT "actualites_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."actualites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projets" ADD CONSTRAINT "projets_image_id_medias_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projets_locales" ADD CONSTRAINT "projets_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "medias_locales" ADD CONSTRAINT "medias_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reglages_locales" ADD CONSTRAINT "reglages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reglages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reglages_rels" ADD CONSTRAINT "reglages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reglages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reglages_rels" ADD CONSTRAINT "reglages_rels_medias_fk" FOREIGN KEY ("medias_id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_sections_items_order_idx" ON "pages_sections_items" USING btree ("_order");
  CREATE INDEX "pages_sections_items_parent_id_idx" ON "pages_sections_items" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_items_locale_idx" ON "pages_sections_items" USING btree ("_locale");
  CREATE INDEX "pages_sections_ctas_order_idx" ON "pages_sections_ctas" USING btree ("_order");
  CREATE INDEX "pages_sections_ctas_parent_id_idx" ON "pages_sections_ctas" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_ctas_locale_idx" ON "pages_sections_ctas" USING btree ("_locale");
  CREATE INDEX "pages_sections_order_idx" ON "pages_sections" USING btree ("_order");
  CREATE INDEX "pages_sections_parent_id_idx" ON "pages_sections" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_locale_idx" ON "pages_sections" USING btree ("_locale");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "actualites_slug_idx" ON "actualites" USING btree ("slug");
  CREATE INDEX "actualites_image_idx" ON "actualites" USING btree ("image_id");
  CREATE INDEX "actualites_updated_at_idx" ON "actualites" USING btree ("updated_at");
  CREATE INDEX "actualites_created_at_idx" ON "actualites" USING btree ("created_at");
  CREATE UNIQUE INDEX "actualites_locales_locale_parent_id_unique" ON "actualites_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "projets_slug_idx" ON "projets" USING btree ("slug");
  CREATE INDEX "projets_image_idx" ON "projets" USING btree ("image_id");
  CREATE INDEX "projets_updated_at_idx" ON "projets" USING btree ("updated_at");
  CREATE INDEX "projets_created_at_idx" ON "projets" USING btree ("created_at");
  CREATE UNIQUE INDEX "projets_locales_locale_parent_id_unique" ON "projets_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "medias_updated_at_idx" ON "medias" USING btree ("updated_at");
  CREATE INDEX "medias_created_at_idx" ON "medias" USING btree ("created_at");
  CREATE UNIQUE INDEX "medias_filename_idx" ON "medias" USING btree ("filename");
  CREATE INDEX "medias_sizes_card_sizes_card_filename_idx" ON "medias" USING btree ("sizes_card_filename");
  CREATE INDEX "medias_sizes_hero_sizes_hero_filename_idx" ON "medias" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "medias_locales_locale_parent_id_unique" ON "medias_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "reglages_locales_locale_parent_id_unique" ON "reglages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "reglages_rels_order_idx" ON "reglages_rels" USING btree ("order");
  CREATE INDEX "reglages_rels_parent_idx" ON "reglages_rels" USING btree ("parent_id");
  CREATE INDEX "reglages_rels_path_idx" ON "reglages_rels" USING btree ("path");
  CREATE INDEX "reglages_rels_medias_id_idx" ON "reglages_rels" USING btree ("medias_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_actualites_fk" FOREIGN KEY ("actualites_id") REFERENCES "public"."actualites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projets_fk" FOREIGN KEY ("projets_id") REFERENCES "public"."projets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_medias_fk" FOREIGN KEY ("medias_id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_actualites_id_idx" ON "payload_locked_documents_rels" USING btree ("actualites_id");
  CREATE INDEX "payload_locked_documents_rels_projets_id_idx" ON "payload_locked_documents_rels" USING btree ("projets_id");
  CREATE INDEX "payload_locked_documents_rels_medias_id_idx" ON "payload_locked_documents_rels" USING btree ("medias_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_sections_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_sections_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "actualites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "actualites_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projets_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "medias" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "medias_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reglages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reglages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reglages_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_sections_items" CASCADE;
  DROP TABLE "pages_sections_ctas" CASCADE;
  DROP TABLE "pages_sections" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "actualites" CASCADE;
  DROP TABLE "actualites_locales" CASCADE;
  DROP TABLE "projets" CASCADE;
  DROP TABLE "projets_locales" CASCADE;
  DROP TABLE "medias" CASCADE;
  DROP TABLE "medias_locales" CASCADE;
  DROP TABLE "reglages" CASCADE;
  DROP TABLE "reglages_locales" CASCADE;
  DROP TABLE "reglages_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_actualites_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projets_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_medias_fk";
  
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_actualites_id_idx";
  DROP INDEX "payload_locked_documents_rels_projets_id_idx";
  DROP INDEX "payload_locked_documents_rels_medias_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "actualites_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "projets_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "medias_id";
  DROP TYPE "public"."enum_pages_slug";
  DROP TYPE "public"."enum_projets_icon";`)
}
