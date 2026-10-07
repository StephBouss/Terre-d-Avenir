import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "hero_image_id" integer;`)

  // Reprise des données : chaque page garde l'image qu'elle tirait de reglages.heroImages (index 0-based => "order" 1-based).
  // Doit passer AVANT la suppression de reglages_rels.
  await db.execute(sql`
    WITH m(slug, ord) AS (VALUES
      ('ong', 2), ('mot-de-la-presidente', 0), ('organisation', 6), ('projets', 3), ('actualites', 0),
      ('adhesion', 1), ('mediatheque', 4), ('partenariats', 6), ('transparence', 2), ('contact', 0),
      ('confidentialite', 0), ('mentions-legales', 0)
    ),
    h AS (SELECT r."medias_id", r."order" FROM "reglages_rels" r WHERE r."path" = 'heroImages')
    UPDATE "pages" p SET "hero_image_id" = h."medias_id"
    FROM m JOIN h ON h."order" = m.ord + 1
    WHERE p."slug"::text = m.slug;
  `)

  await db.execute(sql`
   ALTER TABLE "reglages_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "reglages_rels" CASCADE;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_image_id_medias_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_hero_image_idx" ON "pages" USING btree ("hero_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Les images du diaporama restent dans "diaporama_rels" : la migration « diaporama » (down) les replace dans reglages_rels.
  await db.execute(sql`
   CREATE TABLE "reglages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"medias_id" integer
  );
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_image_id_medias_id_fk";
  
  DROP INDEX "pages_hero_image_idx";
  ALTER TABLE "reglages_rels" ADD CONSTRAINT "reglages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reglages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reglages_rels" ADD CONSTRAINT "reglages_rels_medias_fk" FOREIGN KEY ("medias_id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "reglages_rels_order_idx" ON "reglages_rels" USING btree ("order");
  CREATE INDEX "reglages_rels_parent_idx" ON "reglages_rels" USING btree ("parent_id");
  CREATE INDEX "reglages_rels_path_idx" ON "reglages_rels" USING btree ("path");
  CREATE INDEX "reglages_rels_medias_id_idx" ON "reglages_rels" USING btree ("medias_id");
  ALTER TABLE "pages" DROP COLUMN "hero_image_id";`)
}
