import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('administrateur', 'redaction', 'mediatheque', 'secretariat', 'personnalise');
  CREATE TYPE "public"."enum_users_acces_actualites" AS ENUM('aucun', 'lecture', 'modification');
  CREATE TYPE "public"."enum_users_acces_mediatheque" AS ENUM('aucun', 'lecture', 'modification');
  CREATE TYPE "public"."enum_users_acces_diaporama" AS ENUM('aucun', 'lecture', 'modification');
  CREATE TYPE "public"."enum_users_acces_pages" AS ENUM('aucun', 'lecture', 'modification');
  CREATE TYPE "public"."enum_users_acces_projets" AS ENUM('aucun', 'lecture', 'modification');
  CREATE TYPE "public"."enum_users_acces_organigramme" AS ENUM('aucun', 'lecture', 'modification');
  CREATE TYPE "public"."enum_users_acces_messages" AS ENUM('aucun', 'lecture', 'modification');
  CREATE TYPE "public"."enum_users_acces_reglages" AS ENUM('aucun', 'lecture', 'modification');
  ALTER TABLE "users" ADD COLUMN "nom" varchar;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'redaction' NOT NULL;
  ALTER TABLE "users" ADD COLUMN "acces_actualites" "enum_users_acces_actualites" DEFAULT 'aucun';
  ALTER TABLE "users" ADD COLUMN "acces_mediatheque" "enum_users_acces_mediatheque" DEFAULT 'aucun';
  ALTER TABLE "users" ADD COLUMN "acces_diaporama" "enum_users_acces_diaporama" DEFAULT 'aucun';
  ALTER TABLE "users" ADD COLUMN "acces_pages" "enum_users_acces_pages" DEFAULT 'aucun';
  ALTER TABLE "users" ADD COLUMN "acces_projets" "enum_users_acces_projets" DEFAULT 'aucun';
  ALTER TABLE "users" ADD COLUMN "acces_organigramme" "enum_users_acces_organigramme" DEFAULT 'aucun';
  ALTER TABLE "users" ADD COLUMN "acces_messages" "enum_users_acces_messages" DEFAULT 'aucun';
  ALTER TABLE "users" ADD COLUMN "acces_reglages" "enum_users_acces_reglages" DEFAULT 'aucun';`)

  // Reprise : le compte existant (le plus ancien, seul compte jusqu’ici) devient l’administrateur principal.
  await db.execute(sql`UPDATE "users" SET "role" = 'administrateur' WHERE "id" = (SELECT min("id") FROM "users");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "nom";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "users" DROP COLUMN "acces_actualites";
  ALTER TABLE "users" DROP COLUMN "acces_mediatheque";
  ALTER TABLE "users" DROP COLUMN "acces_diaporama";
  ALTER TABLE "users" DROP COLUMN "acces_pages";
  ALTER TABLE "users" DROP COLUMN "acces_projets";
  ALTER TABLE "users" DROP COLUMN "acces_organigramme";
  ALTER TABLE "users" DROP COLUMN "acces_messages";
  ALTER TABLE "users" DROP COLUMN "acces_reglages";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_acces_actualites";
  DROP TYPE "public"."enum_users_acces_mediatheque";
  DROP TYPE "public"."enum_users_acces_diaporama";
  DROP TYPE "public"."enum_users_acces_pages";
  DROP TYPE "public"."enum_users_acces_projets";
  DROP TYPE "public"."enum_users_acces_organigramme";
  DROP TYPE "public"."enum_users_acces_messages";
  DROP TYPE "public"."enum_users_acces_reglages";`)
}
