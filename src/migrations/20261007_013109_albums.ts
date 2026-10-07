import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_albums_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__albums_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__albums_v_published_locale" AS ENUM('fr', 'en');
  CREATE TABLE "albums" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"order" numeric DEFAULT 0,
  	"date" timestamp(3) with time zone,
  	"cover_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_albums_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "albums_locales" (
  	"title" varchar,
  	"date_label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "albums_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"medias_id" integer
  );
  
  CREATE TABLE "_albums_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_date" timestamp(3) with time zone,
  	"version_cover_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__albums_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__albums_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_albums_v_locales" (
  	"version_title" varchar,
  	"version_date_label" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_albums_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"medias_id" integer
  );
  
  ALTER TABLE "actualites" ADD COLUMN "album_id" integer;
  ALTER TABLE "_actualites_v" ADD COLUMN "version_album_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "albums_id" integer;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_cover_id_medias_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums_locales" ADD CONSTRAINT "albums_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums_rels" ADD CONSTRAINT "albums_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums_rels" ADD CONSTRAINT "albums_rels_medias_fk" FOREIGN KEY ("medias_id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_parent_id_albums_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_version_cover_id_medias_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v_locales" ADD CONSTRAINT "_albums_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_albums_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_albums_v_rels" ADD CONSTRAINT "_albums_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_albums_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_albums_v_rels" ADD CONSTRAINT "_albums_v_rels_medias_fk" FOREIGN KEY ("medias_id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "albums_slug_idx" ON "albums" USING btree ("slug");
  CREATE INDEX "albums_cover_idx" ON "albums" USING btree ("cover_id");
  CREATE INDEX "albums_updated_at_idx" ON "albums" USING btree ("updated_at");
  CREATE INDEX "albums_created_at_idx" ON "albums" USING btree ("created_at");
  CREATE INDEX "albums__status_idx" ON "albums" USING btree ("_status");
  CREATE UNIQUE INDEX "albums_locales_locale_parent_id_unique" ON "albums_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "albums_rels_order_idx" ON "albums_rels" USING btree ("order");
  CREATE INDEX "albums_rels_parent_idx" ON "albums_rels" USING btree ("parent_id");
  CREATE INDEX "albums_rels_path_idx" ON "albums_rels" USING btree ("path");
  CREATE INDEX "albums_rels_medias_id_idx" ON "albums_rels" USING btree ("medias_id");
  CREATE INDEX "_albums_v_parent_idx" ON "_albums_v" USING btree ("parent_id");
  CREATE INDEX "_albums_v_version_version_slug_idx" ON "_albums_v" USING btree ("version_slug");
  CREATE INDEX "_albums_v_version_version_cover_idx" ON "_albums_v" USING btree ("version_cover_id");
  CREATE INDEX "_albums_v_version_version_updated_at_idx" ON "_albums_v" USING btree ("version_updated_at");
  CREATE INDEX "_albums_v_version_version_created_at_idx" ON "_albums_v" USING btree ("version_created_at");
  CREATE INDEX "_albums_v_version_version__status_idx" ON "_albums_v" USING btree ("version__status");
  CREATE INDEX "_albums_v_created_at_idx" ON "_albums_v" USING btree ("created_at");
  CREATE INDEX "_albums_v_updated_at_idx" ON "_albums_v" USING btree ("updated_at");
  CREATE INDEX "_albums_v_snapshot_idx" ON "_albums_v" USING btree ("snapshot");
  CREATE INDEX "_albums_v_published_locale_idx" ON "_albums_v" USING btree ("published_locale");
  CREATE INDEX "_albums_v_latest_idx" ON "_albums_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_albums_v_locales_locale_parent_id_unique" ON "_albums_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_albums_v_rels_order_idx" ON "_albums_v_rels" USING btree ("order");
  CREATE INDEX "_albums_v_rels_parent_idx" ON "_albums_v_rels" USING btree ("parent_id");
  CREATE INDEX "_albums_v_rels_path_idx" ON "_albums_v_rels" USING btree ("path");
  CREATE INDEX "_albums_v_rels_medias_id_idx" ON "_albums_v_rels" USING btree ("medias_id");
  ALTER TABLE "actualites" ADD CONSTRAINT "actualites_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_actualites_v" ADD CONSTRAINT "_actualites_v_version_album_id_albums_id_fk" FOREIGN KEY ("version_album_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_albums_fk" FOREIGN KEY ("albums_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "actualites_album_idx" ON "actualites" USING btree ("album_id");
  CREATE INDEX "_actualites_v_version_version_album_idx" ON "_actualites_v" USING btree ("version_album_id");
  CREATE INDEX "payload_locked_documents_rels_albums_id_idx" ON "payload_locked_documents_rels" USING btree ("albums_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "albums" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "albums_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "albums_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_albums_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_albums_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_albums_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "albums" CASCADE;
  DROP TABLE "albums_locales" CASCADE;
  DROP TABLE "albums_rels" CASCADE;
  DROP TABLE "_albums_v" CASCADE;
  DROP TABLE "_albums_v_locales" CASCADE;
  DROP TABLE "_albums_v_rels" CASCADE;
  ALTER TABLE "actualites" DROP CONSTRAINT IF EXISTS "actualites_album_id_albums_id_fk";
  
  ALTER TABLE "_actualites_v" DROP CONSTRAINT IF EXISTS "_actualites_v_version_album_id_albums_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_albums_fk";
  
  DROP INDEX IF EXISTS "actualites_album_idx";
  DROP INDEX IF EXISTS "_actualites_v_version_version_album_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_albums_id_idx";
  ALTER TABLE "actualites" DROP COLUMN "album_id";
  ALTER TABLE "_actualites_v" DROP COLUMN "version_album_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "albums_id";
  DROP TYPE "public"."enum_albums_status";
  DROP TYPE "public"."enum__albums_v_version_status";
  DROP TYPE "public"."enum__albums_v_published_locale";`)
}
