import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_sections" ADD COLUMN "image_id" integer;
  ALTER TABLE "pages_sections" ADD CONSTRAINT "pages_sections_image_id_medias_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_sections_image_idx" ON "pages_sections" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_sections" DROP CONSTRAINT "pages_sections_image_id_medias_id_fk";
  
  DROP INDEX "pages_sections_image_idx";
  ALTER TABLE "pages_sections" DROP COLUMN "image_id";`)
}
