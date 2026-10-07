import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reglages" ADD COLUMN "email_adhesions" varchar;
  ALTER TABLE "reglages" ADD COLUMN "email_contact" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reglages" DROP COLUMN "email_adhesions";
  ALTER TABLE "reglages" DROP COLUMN "email_contact";`)
}
