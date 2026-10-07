import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_messages_type" AS ENUM('adhesion', 'contact');
  CREATE TYPE "public"."enum_messages_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_messages_email_etat" AS ENUM('envoye', 'echec', 'non_configure');
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"type" "enum_messages_type" NOT NULL,
  	"nom" varchar,
  	"donnees" jsonb NOT NULL,
  	"locale" "enum_messages_locale",
  	"notice_version" varchar,
  	"cle_idempotence" varchar NOT NULL,
  	"email_etat" "enum_messages_email_etat" DEFAULT 'non_configure' NOT NULL,
  	"email_erreur" varchar,
  	"email_envoye_le" timestamp(3) with time zone,
  	"traite" boolean DEFAULT false,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "messages_id" integer;
  CREATE UNIQUE INDEX "messages_reference_idx" ON "messages" USING btree ("reference");
  CREATE UNIQUE INDEX "messages_cle_idempotence_idx" ON "messages" USING btree ("cle_idempotence");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "messages" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_messages_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_messages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "messages_id";
  DROP TYPE "public"."enum_messages_type";
  DROP TYPE "public"."enum_messages_locale";
  DROP TYPE "public"."enum_messages_email_etat";`)
}
