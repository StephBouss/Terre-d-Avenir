import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_postes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__postes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__postes_v_published_locale" AS ENUM('fr', 'en');
  CREATE TABLE "postes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"ordre" numeric DEFAULT 0,
  	"personne_nom" varchar,
  	"personne_photo_id" integer,
  	"cle" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_postes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "postes_locales" (
  	"intitule" varchar,
  	"mission" varchar,
  	"personne_bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_postes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_parent_id" integer,
  	"version_ordre" numeric DEFAULT 0,
  	"version_personne_nom" varchar,
  	"version_personne_photo_id" integer,
  	"version_cle" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__postes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__postes_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_postes_v_locales" (
  	"version_intitule" varchar,
  	"version_mission" varchar,
  	"version_personne_bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "postes_id" integer;
  ALTER TABLE "postes" ADD CONSTRAINT "postes_parent_id_postes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."postes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "postes" ADD CONSTRAINT "postes_personne_photo_id_medias_id_fk" FOREIGN KEY ("personne_photo_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "postes_locales" ADD CONSTRAINT "postes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."postes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_postes_v" ADD CONSTRAINT "_postes_v_parent_id_postes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."postes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_postes_v" ADD CONSTRAINT "_postes_v_version_parent_id_postes_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."postes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_postes_v" ADD CONSTRAINT "_postes_v_version_personne_photo_id_medias_id_fk" FOREIGN KEY ("version_personne_photo_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_postes_v_locales" ADD CONSTRAINT "_postes_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_postes_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "postes_parent_idx" ON "postes" USING btree ("parent_id");
  CREATE INDEX "postes_personne_photo_idx" ON "postes" USING btree ("personne_photo_id");
  CREATE UNIQUE INDEX "postes_cle_idx" ON "postes" USING btree ("cle");
  CREATE INDEX "postes_updated_at_idx" ON "postes" USING btree ("updated_at");
  CREATE INDEX "postes_created_at_idx" ON "postes" USING btree ("created_at");
  CREATE INDEX "postes__status_idx" ON "postes" USING btree ("_status");
  CREATE UNIQUE INDEX "postes_locales_locale_parent_id_unique" ON "postes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_postes_v_parent_idx" ON "_postes_v" USING btree ("parent_id");
  CREATE INDEX "_postes_v_version_version_parent_idx" ON "_postes_v" USING btree ("version_parent_id");
  CREATE INDEX "_postes_v_version_version_personne_photo_idx" ON "_postes_v" USING btree ("version_personne_photo_id");
  CREATE INDEX "_postes_v_version_version_cle_idx" ON "_postes_v" USING btree ("version_cle");
  CREATE INDEX "_postes_v_version_version_updated_at_idx" ON "_postes_v" USING btree ("version_updated_at");
  CREATE INDEX "_postes_v_version_version_created_at_idx" ON "_postes_v" USING btree ("version_created_at");
  CREATE INDEX "_postes_v_version_version__status_idx" ON "_postes_v" USING btree ("version__status");
  CREATE INDEX "_postes_v_created_at_idx" ON "_postes_v" USING btree ("created_at");
  CREATE INDEX "_postes_v_updated_at_idx" ON "_postes_v" USING btree ("updated_at");
  CREATE INDEX "_postes_v_snapshot_idx" ON "_postes_v" USING btree ("snapshot");
  CREATE INDEX "_postes_v_published_locale_idx" ON "_postes_v" USING btree ("published_locale");
  CREATE INDEX "_postes_v_latest_idx" ON "_postes_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_postes_v_locales_locale_parent_id_unique" ON "_postes_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_postes_fk" FOREIGN KEY ("postes_id") REFERENCES "public"."postes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_postes_id_idx" ON "payload_locked_documents_rels" USING btree ("postes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "postes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "postes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_postes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_postes_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "postes" CASCADE;
  DROP TABLE "postes_locales" CASCADE;
  DROP TABLE "_postes_v" CASCADE;
  DROP TABLE "_postes_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_postes_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_postes_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "postes_id";
  DROP TYPE "public"."enum_postes_status";
  DROP TYPE "public"."enum__postes_v_version_status";
  DROP TYPE "public"."enum__postes_v_published_locale";`)
}
