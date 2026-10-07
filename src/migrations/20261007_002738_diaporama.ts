import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "diaporama" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "diaporama_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"medias_id" integer
  );
  
  ALTER TABLE "diaporama_rels" ADD CONSTRAINT "diaporama_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."diaporama"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "diaporama_rels" ADD CONSTRAINT "diaporama_rels_medias_fk" FOREIGN KEY ("medias_id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "diaporama_rels_order_idx" ON "diaporama_rels" USING btree ("order");
  CREATE INDEX "diaporama_rels_parent_idx" ON "diaporama_rels" USING btree ("parent_id");
  CREATE INDEX "diaporama_rels_path_idx" ON "diaporama_rels" USING btree ("path");
  CREATE INDEX "diaporama_rels_medias_id_idx" ON "diaporama_rels" USING btree ("medias_id");`)

  // Reprise des données : les images du diaporama quittent les réglages.
  await db.execute(sql`
    INSERT INTO "diaporama" ("updated_at", "created_at") SELECT now(), now() WHERE NOT EXISTS (SELECT 1 FROM "diaporama");
    INSERT INTO "diaporama_rels" ("order", "parent_id", "path", "medias_id")
      SELECT r."order", (SELECT "id" FROM "diaporama" LIMIT 1), 'images', r."medias_id"
      FROM "reglages_rels" r WHERE r."path" = 'heroImages' ORDER BY r."order";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Reprise inverse : les images du diaporama retournent dans les réglages.
  await db.execute(sql`
    DELETE FROM "reglages_rels" WHERE "path" = 'heroImages';
    INSERT INTO "reglages_rels" ("order", "parent_id", "path", "medias_id")
      SELECT r."order", (SELECT "id" FROM "reglages" LIMIT 1), 'heroImages', r."medias_id"
      FROM "diaporama_rels" r WHERE r."path" = 'images' AND EXISTS (SELECT 1 FROM "reglages") ORDER BY r."order";
  `)
  await db.execute(sql`
   DROP TABLE "diaporama" CASCADE;
  DROP TABLE "diaporama_rels" CASCADE;`)
}
