import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "medias" ADD COLUMN "ordre" numeric DEFAULT 0;
  ALTER TABLE "medias" ADD COLUMN "source" varchar;
  ALTER TABLE "medias" ADD COLUMN "date_prise" timestamp(3) with time zone;
  ALTER TABLE "medias" ADD COLUMN "droits_confirmes" boolean DEFAULT false;
  ALTER TABLE "medias" ADD COLUMN "droits_note" varchar;
  ALTER TABLE "medias_locales" ADD COLUMN "lieu" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "medias" DROP COLUMN "ordre";
  ALTER TABLE "medias" DROP COLUMN "source";
  ALTER TABLE "medias" DROP COLUMN "date_prise";
  ALTER TABLE "medias" DROP COLUMN "droits_confirmes";
  ALTER TABLE "medias" DROP COLUMN "droits_note";
  ALTER TABLE "medias_locales" DROP COLUMN "lieu";`)
}
