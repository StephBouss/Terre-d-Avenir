import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_actualites_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__actualites_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__actualites_v_published_locale" AS ENUM('fr', 'en');
  CREATE TABLE "_actualites_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_date" timestamp(3) with time zone,
  	"version_image_id" integer,
  	"version_source_url" varchar,
  	"version_archivee" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__actualites_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__actualites_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_actualites_v_locales" (
  	"version_title" varchar,
  	"version_category" varchar,
  	"version_date_label" varchar,
  	"version_excerpt" varchar,
  	"version_body" varchar,
  	"version_source_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "actualites" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "actualites" ALTER COLUMN "order" DROP NOT NULL;
  ALTER TABLE "actualites_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "actualites" ADD COLUMN "archivee" boolean DEFAULT false;
  ALTER TABLE "actualites" ADD COLUMN "_status" "enum_actualites_status" DEFAULT 'draft';
  ALTER TABLE "_actualites_v" ADD CONSTRAINT "_actualites_v_parent_id_actualites_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."actualites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_actualites_v" ADD CONSTRAINT "_actualites_v_version_image_id_medias_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_actualites_v_locales" ADD CONSTRAINT "_actualites_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_actualites_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_actualites_v_parent_idx" ON "_actualites_v" USING btree ("parent_id");
  CREATE INDEX "_actualites_v_version_version_slug_idx" ON "_actualites_v" USING btree ("version_slug");
  CREATE INDEX "_actualites_v_version_version_image_idx" ON "_actualites_v" USING btree ("version_image_id");
  CREATE INDEX "_actualites_v_version_version_updated_at_idx" ON "_actualites_v" USING btree ("version_updated_at");
  CREATE INDEX "_actualites_v_version_version_created_at_idx" ON "_actualites_v" USING btree ("version_created_at");
  CREATE INDEX "_actualites_v_version_version__status_idx" ON "_actualites_v" USING btree ("version__status");
  CREATE INDEX "_actualites_v_created_at_idx" ON "_actualites_v" USING btree ("created_at");
  CREATE INDEX "_actualites_v_updated_at_idx" ON "_actualites_v" USING btree ("updated_at");
  CREATE INDEX "_actualites_v_snapshot_idx" ON "_actualites_v" USING btree ("snapshot");
  CREATE INDEX "_actualites_v_published_locale_idx" ON "_actualites_v" USING btree ("published_locale");
  CREATE INDEX "_actualites_v_latest_idx" ON "_actualites_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_actualites_v_locales_locale_parent_id_unique" ON "_actualites_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "actualites__status_idx" ON "actualites" USING btree ("_status");
  UPDATE "actualites" SET "_status" = CASE WHEN "publie" THEN 'published'::"enum_actualites_status" ELSE 'draft'::"enum_actualites_status" END;
  ALTER TABLE "actualites" DROP COLUMN "publie";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_actualites_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_actualites_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_actualites_v" CASCADE;
  DROP TABLE "_actualites_v_locales" CASCADE;
  DROP INDEX "actualites__status_idx";
  ALTER TABLE "actualites" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "actualites" ALTER COLUMN "order" SET NOT NULL;
  ALTER TABLE "actualites_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "actualites" ADD COLUMN "publie" boolean DEFAULT true;
  UPDATE "actualites" SET "publie" = ("_status" = 'published');
  ALTER TABLE "actualites" DROP COLUMN "archivee";
  ALTER TABLE "actualites" DROP COLUMN "_status";
  DROP TYPE "public"."enum_actualites_status";
  DROP TYPE "public"."enum__actualites_v_version_status";
  DROP TYPE "public"."enum__actualites_v_published_locale";`)
}
