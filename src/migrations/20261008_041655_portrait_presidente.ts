import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reglages" ADD COLUMN "portrait_presidente_id" integer;
  ALTER TABLE "reglages" ADD CONSTRAINT "reglages_portrait_presidente_id_medias_id_fk" FOREIGN KEY ("portrait_presidente_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "reglages_portrait_presidente_idx" ON "reglages" USING btree ("portrait_presidente_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reglages" DROP CONSTRAINT "reglages_portrait_presidente_id_medias_id_fk";
  
  DROP INDEX "reglages_portrait_presidente_idx";
  ALTER TABLE "reglages" DROP COLUMN "portrait_presidente_id";`)
}
