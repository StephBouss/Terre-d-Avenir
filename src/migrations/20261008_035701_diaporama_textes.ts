import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "diaporama_textes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "diaporama_textes_locales" (
  	"titre" varchar NOT NULL,
  	"texte" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "diaporama_textes" ADD CONSTRAINT "diaporama_textes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."diaporama"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "diaporama_textes_locales" ADD CONSTRAINT "diaporama_textes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."diaporama_textes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "diaporama_textes_order_idx" ON "diaporama_textes" USING btree ("_order");
  CREATE INDEX "diaporama_textes_parent_id_idx" ON "diaporama_textes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "diaporama_textes_locales_locale_parent_id_unique" ON "diaporama_textes_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "diaporama_textes" CASCADE;
  DROP TABLE "diaporama_textes_locales" CASCADE;`)
}
