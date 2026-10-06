# Espace admin (KPI, actualités, Hero, médiathèque) — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** enrichir l'admin Payload (`/admin`) avec un tableau de bord KPI évolutif, un circuit brouillon/publication/archives pour les actualités avec aperçu, un écran « Diaporama d'accueil », une image d'en-tête par page et une gestion complète des photos de la médiathèque.  Ajout du 2026-10-06 : albums de la médiathèque (tâche 8) et premier contenu « Kafélé et Nianame » (tâche 9).

**Architecture:** tout reste dans l'admin Payload 3. Le travail se fait par configuration des collections et globals, plus un Server Component `beforeDashboard` pour les KPI. Les calculs des KPI sont des fonctions pures dans `src/lib/kpi/`, séparées de la lecture en base. Le site public lit toujours par l'API locale de Payload, via `src/lib/content.ts`, et filtre explicitement le contenu publié. Chaque tâche qui change le schéma crée sa propre migration Payload, avec la reprise de données écrite dans la migration.

**Tech Stack:** Next.js 16.3.8 (App Router, `proxy.ts`, `draftMode`), React 19, Payload 3.90.2 (`@payloadcms/db-postgres`, versions/brouillons, `@payloadcms/translations`), PostgreSQL 18 (embedded-postgres en dev, port 5433 ; e2e sur 5434), Tailwind v4, TypeScript 6, Vitest, Playwright.

**Spec :** `docs/superpowers/specs/2026-10-06-admin-contenus-kpi-design.md`

**Écart assumé par rapport à la spec §8 :** la spec prévoit « une seule migration ». Ce plan crée **une migration par tâche qui touche le schéma** (tâches 2, 4, 5 et 6). Chaque tâche reste ainsi livrable et testable seule. La reprise des données est identique.

## Global Constraints

- **Fond et forme :** les Textes v1.3 dictent le fond. Aucune information n'est inventée. Toute chaîne vide ou contenant `[...]` est un brouillon masqué côté site (`isPlaceholder` de `src/lib/text.ts`).
- **KPI :** aucun chiffre, aucune tendance ni aucun pourcentage fictifs. Trois états distincts : valeur réelle (y compris 0), « Indisponible » (erreur de lecture) et « Aucune source configurée ». La date est affichée en `Africa/Libreville`.
- **Langue de l'admin :** français uniquement (`@payloadcms/translations/languages/fr`).
- **Visibilité d'une actualité :** elle est publique si et seulement si `_status = 'published'` ET `archivee != true`.
- **Médias :** photos uniquement (JPEG, PNG, WebP, AVIF), 20 Mo maximum par fichier. Pas de vidéos.
- **Rôles :** tout utilisateur connecté est administrateur. Pas de rôles avant le lot 5.
- **Données personnelles :** aucune donnée personnelle n'est collectée. Les formulaires publics restent désactivés.
- **Base de données :** `push: false`. Tout changement de schéma passe par `npm run migrate:create <nom>`, suivi de `npm run generate:types`. La reprise de données s'écrit en SQL dans la migration générée.
- **Plateforme :** Windows (PowerShell / Git Bash), pas de Docker en local. Le port 3000 est le serveur de dev de l'utilisateur : ne jamais le tuer.
  - La base de dev est sur le port 5433 (`npm run db`).
  - La base e2e est dédiée, sur le port 5434 (`.data/postgres-e2e`), et gérée par `scripts/e2e-server.ts`.
- **Next.js :** « This is NOT the Next.js you know ». Avant d'écrire du code propre à Next, lire le guide correspondant dans `node_modules/next/dist/docs/` (par exemple `01-app/03-api-reference/04-functions/draft-mode.md`).
- **Commits :** messages en français, préfixés (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). Chaque message se termine par la ligne `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Ne jamais commiter `.env`.
- **Vérifications avant chaque commit final de tâche :** `npx tsc --noEmit`, `npm test`, `npm run lint` (0 erreur), puis `npm run test:e2e` pour les tâches qui ont des tests e2e.

---

## Carte des fichiers

| Fichier | Rôle | Tâche |
|---|---|---|
| `src/payload.config.ts` | i18n FR, globals, `beforeDashboard`, limite d'upload | 1, 4, 6, 7 |
| `src/collections/*.ts`, `src/globals/*.ts` | `admin.group`, champs, accès | 1, 2, 4, 5, 6 |
| `tests/e2e/admin-credentials.ts` | identifiants admin e2e, partagés par `e2e-server.ts` et les specs | 1 |
| `tests/e2e/admin-helpers.ts` | connexion admin dans le navigateur et par l'API REST | 1 |
| `src/lib/actualites.ts` | filtre « actualité visible », source unique de vérité | 2 |
| `src/lib/content.ts` | lectures du site (actualités filtrées, diaporama, galerie triée) | 2, 3, 4, 6 |
| `src/app/(site)/api/apercu/route.ts`, `.../fin/route.ts` | activation et désactivation du draftMode | 3 |
| `src/lib/preview.ts` | construction et vérification de l'URL d'aperçu (pur) | 3 |
| `src/components/layout/PreviewBanner.tsx` | bandeau « Aperçu — non publié » | 3 |
| `src/globals/Diaporama.ts` | global « Diaporama d'accueil » | 4 |
| `src/lib/kpi/compute.ts` | calculs purs des KPI | 7 |
| `src/lib/kpi/load.ts` | lecture Payload → entrées des calculs | 7 |
| `src/components/admin/KpiDashboard.tsx` | Server Component du tableau de bord | 7 |

---

### Task 1 : Admin en français, menus regroupés, compte admin pour l'e2e

**Files:**
- Modify: `src/payload.config.ts`
- Modify: `src/collections/Actualites.ts`, `src/collections/Pages.ts`, `src/collections/Projets.ts`, `src/collections/Medias.ts`, `src/collections/Users.ts`, `src/globals/Reglages.ts`
- Create: `tests/e2e/admin-credentials.ts`, `tests/e2e/admin-helpers.ts`, `tests/e2e/admin.spec.ts`
- Modify: `scripts/e2e-server.ts`

**Interfaces:**
- Produces:
  - `ADMIN_EMAIL: string` et `ADMIN_PASSWORD: string`, depuis `tests/e2e/admin-credentials.ts`.
  - `loginAdmin(page: Page): Promise<void>` : se connecte via l'UI `/admin/login`.
  - `adminToken(request: APIRequestContext): Promise<string>` : `POST /api/users/login` et renvoie le JWT.

Ces trois éléments viennent de `tests/e2e/admin-helpers.ts` (sauf les constantes) et sont utilisés par les tâches 2, 3 et 7.

- [ ] **Step 1 : Identifiants admin e2e**

`tests/e2e/admin-credentials.ts` :

```ts
// Compte admin créé par le seed de la base e2e (port 5434) — jamais utilisé hors des tests.
export const ADMIN_EMAIL = 'e2e-admin@terredavenir.local'
export const ADMIN_PASSWORD = 'e2e-mot-de-passe-local'
```

Dans `scripts/e2e-server.ts`, ajouter ces variables à `E2E_ENV` pour que `npm run seed` crée ce compte :

```ts
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../tests/e2e/admin-credentials'

const E2E_ENV = {
  ...process.env,
  DATABASE_URI: `postgres://postgres:postgres@127.0.0.1:${E2E_DB_PORT}/terredavenir`,
  SEED_ADMIN_EMAIL: ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD: ADMIN_PASSWORD,
}
```

- [ ] **Step 2 : Helpers de connexion**

`tests/e2e/admin-helpers.ts` :

```ts
import { expect, type APIRequestContext, type Page } from '@playwright/test'
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './admin-credentials'

/** Connexion à l'admin Payload par l'interface. */
export async function loginAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login')
  await page.getByLabel(/e-?mail/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/mot de passe|password/i).fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /connexion|se connecter|login/i }).click()
  await expect(page).toHaveURL(/\/admin(\/)?$/)
}

/** Jeton JWT pour l'API REST de Payload (en-tête Authorization: JWT <token>). */
export async function adminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/users/login', { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
  expect(res.ok()).toBe(true)
  return (await res.json()).token as string
}
```

- [ ] **Step 3 : Test e2e de l'admin, à écrire avant le code**

`tests/e2e/admin.spec.ts` :

```ts
import { expect, test } from '@playwright/test'
import { loginAdmin } from './admin-helpers'

test.describe('admin Payload', () => {
  test.skip(({ isMobile }) => isMobile, 'admin vérifiée sur desktop')

  test('interface en français et menu regroupé', async ({ page }) => {
    await loginAdmin(page)
    const nav = page.locator('nav')
    for (const group of ['Contenus', 'Images', 'Site', 'Administration']) {
      await expect(nav.getByText(group, { exact: true })).toBeVisible()
    }
    // Libellé natif de Payload traduit en français.
    await expect(page.getByRole('button', { name: /se déconnecter|déconnexion/i }).or(page.getByText('Tableau de bord'))).toBeVisible()
  })
})
```

- [ ] **Step 4 : Vérifier l'échec**

Run: `npm run test:e2e -- tests/e2e/admin.spec.ts --project=desktop`

Expected: FAIL. Les groupes « Contenus », etc. sont absents et l'interface est en anglais.

Si la connexion elle-même échoue, vérifier d'abord que le seed a bien créé le compte. La sortie de `globalSetup` ne doit **pas** afficher « aucun compte admin créé ».

- [ ] **Step 5 : Configuration**

Dans `src/payload.config.ts` :

```ts
import { fr } from '@payloadcms/translations/languages/fr'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: { supportedLanguages: { fr }, fallbackLanguage: 'fr' },
  // … reste inchangé
})
```

Ajouter `group` dans le bloc `admin` de chaque collection et global :

| Fichier | Ajout |
|---|---|
| `Actualites.ts`, `Pages.ts`, `Projets.ts` | `group: 'Contenus'` |
| `Medias.ts` | `group: 'Images'`, plus `labels: { singular: 'Photo', plural: 'Médiathèque' }` |
| `Reglages.ts` | `admin: { group: 'Site' }` (le global n'a pas encore de bloc `admin`) |
| `Users.ts` | `group: 'Administration'`, plus `labels: { singular: 'Utilisateur', plural: 'Utilisateurs' }` |

Exemple pour `Actualites.ts` :

```ts
admin: { useAsTitle: 'title', group: 'Contenus', defaultColumns: ['title', 'dateLabel', 'publie', 'order'] },
```

- [ ] **Step 6 : Régénérer l'importMap et les types**

Run: `npm run generate:importmap; npm run generate:types`

Expected: aucune erreur. `src/payload-types.ts` ne change pas, ou presque : aucun champ n'a changé.

- [ ] **Step 7 : Vérifier le succès**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected: tout passe, y compris `admin.spec.ts`. Les tests du lot 1 restent verts.

- [ ] **Step 8 : Commit**

```bash
git add src/payload.config.ts src/collections src/globals scripts/e2e-server.ts tests/e2e/admin-credentials.ts tests/e2e/admin-helpers.ts tests/e2e/admin.spec.ts src/payload-types.ts "src/app/(payload)/admin/importMap.js"
git commit -F - <<'EOF'
feat: admin Payload en français, menus regroupés et compte admin pour l'e2e

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2 : Actualités — brouillons, publication, archivée et visibilité

**Files:**
- Modify: `src/collections/Actualites.ts`
- Create: `src/lib/actualites.ts`, `tests/unit/actualites-visibilite.test.ts`
- Modify: `src/lib/content.ts`, `src/seed/index.ts`, `tests/unit/access.test.ts`, `tests/e2e/api-acces.spec.ts`
- Create: `tests/e2e/actualites-etats.spec.ts`
- Create (généré) : `src/migrations/<horodatage>_actualites_brouillons.ts` et `.json` ; Modify: `src/migrations/index.ts`, `src/payload-types.ts`

**Interfaces:**
- Consumes: `adminToken(request)` (tâche 1).
- Produces:
  - `src/lib/actualites.ts` : `export const VISIBLE_ACTUALITE: Where` ; `export function isVisibleActualite(doc: { _status?: string | null; archivee?: boolean | null }): boolean`.
  - `getActualites(locale)` et `getActualite(slug, locale)` dans `content.ts` gardent leur signature et ne renvoient que les actualités visibles. La tâche 3 ajoutera une option `{ draft }` à `getActualite`.
  - La collection `actualites` a `_status` (`'draft' | 'published'`) et `archivee: boolean`. Le champ `publie` n'existe plus.

- [ ] **Step 1 : Test unitaire du filtre, à écrire avant le code**

`tests/unit/actualites-visibilite.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { VISIBLE_ACTUALITE, isVisibleActualite } from '@/lib/actualites'

describe('visibilité d’une actualité', () => {
  it('publiée et non archivée : visible', () => {
    expect(isVisibleActualite({ _status: 'published', archivee: false })).toBe(true)
    expect(isVisibleActualite({ _status: 'published', archivee: null })).toBe(true)
  })
  it('brouillon : invisible', () => {
    expect(isVisibleActualite({ _status: 'draft', archivee: false })).toBe(false)
  })
  it('archivée : invisible même publiée', () => {
    expect(isVisibleActualite({ _status: 'published', archivee: true })).toBe(false)
  })
  it('le filtre Payload exprime la même règle', () => {
    expect(VISIBLE_ACTUALITE).toEqual({ and: [{ _status: { equals: 'published' } }, { archivee: { not_equals: true } }] })
  })
})
```

Dans `tests/unit/access.test.ts`, remplacer l'attente du test « actualités » :

```ts
expect(read(anonymous)).toEqual({ and: [{ _status: { equals: 'published' } }, { archivee: { not_equals: true } }] })
```

- [ ] **Step 2 : Vérifier l'échec**

Run: `npx vitest run tests/unit/actualites-visibilite.test.ts tests/unit/access.test.ts`

Expected: FAIL. Le module `@/lib/actualites` est introuvable et l'accès renvoie encore `{ publie: … }`.

- [ ] **Step 3 : Implémenter le filtre**

`src/lib/actualites.ts` :

```ts
import type { Where } from 'payload'

/** Une actualité est publique si elle est publiée et non archivée. Source unique de la règle. */
export const VISIBLE_ACTUALITE: Where = { and: [{ _status: { equals: 'published' } }, { archivee: { not_equals: true } }] }

export function isVisibleActualite(doc: { _status?: string | null; archivee?: boolean | null }): boolean {
  return doc._status === 'published' && doc.archivee !== true
}
```

- [ ] **Step 4 : Modifier la collection**

Dans `src/collections/Actualites.ts` :

```ts
import { VISIBLE_ACTUALITE } from '../lib/actualites'

export const Actualites: CollectionConfig = {
  slug: 'actualites',
  typescript: { interface: 'Actualite' },
  labels: { singular: 'Actualité', plural: 'Actualités' },
  admin: {
    useAsTitle: 'title',
    group: 'Contenus',
    defaultColumns: ['title', '_status', 'archivee', 'dateLabel', 'updatedAt'],
    listSearchableFields: ['title', 'excerpt'],
  },
  versions: { drafts: true, maxPerDoc: 50 },
  access: { read: ({ req }) => (req.user ? true : VISIBLE_ACTUALITE) },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] },
  defaultSort: 'order',
  fields: [
    // … champs existants, SANS { name: 'publie', … }
    {
      name: 'archivee',
      label: 'Archivée',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Retire l’actualité du site sans la supprimer.' },
    },
  ],
}
```

Le champ `publie` est supprimé.

- [ ] **Step 5 : Migration générée, puis reprise de données**

Run: `npm run migrate:create actualites_brouillons`

La base de dev (5433) doit tourner (`npm run db`). Le fichier généré `src/migrations/<horodatage>_actualites_brouillons.ts` contient du SQL qui :
- ajoute `_status` à `actualites` ;
- crée les tables de versions `_actualites_v*` ;
- ajoute `archivee` ;
- supprime la colonne `publie`.

**Éditer `up`** pour insérer la conversion **après** l'ajout de `_status` et **avant** le `DROP COLUMN "publie"` :

```ts
await db.execute(sql`
  UPDATE "actualites" SET "_status" = CASE WHEN "publie" THEN 'published'::"enum_actualites_status" ELSE 'draft'::"enum_actualites_status" END;
`)
```

Vérifier dans le SQL généré le nom exact de l'enum (`enum_actualites_status`) et de la colonne. S'ils diffèrent, adapter la requête : c'est la seule chose à ajuster.

Dans `down`, symétriquement, avant de supprimer `_status`, restaurer `publie` :

```ts
UPDATE "actualites" SET "publie" = ("_status" = 'published');
```

Puis :

Run: `npm run migrate; npm run generate:types`

Expected: la migration s'applique sans erreur sur la base de dev. `src/payload-types.ts` contient `_status?: ('draft' | 'published') | null;` et `archivee?: boolean | null;` dans `Actualite`, et n'a plus `publie`.

- [ ] **Step 6 : Lectures du site**

Dans `src/lib/content.ts` :

```ts
import { VISIBLE_ACTUALITE } from './actualites'

export const getActualites = cache(async (locale: Locale): Promise<Actualite[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'actualites', where: VISIBLE_ACTUALITE, sort: 'order', locale, depth: 1, limit: 100 })
  return res.docs
})

export const getActualite = cache(async (slug: string, locale: Locale): Promise<Actualite | null> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'actualites',
    where: { and: [{ slug: { equals: slug } }, VISIBLE_ACTUALITE] },
    locale,
    depth: 1,
    limit: 1,
  })
  return res.docs[0] ?? null
})
```

Ces deux fonctions alimentent déjà la liste, le détail, l'accueil (`NewsSection`), les « autres actualités » et `src/app/sitemap.ts`. Vérifier par `grep -rn "collection: 'actualites'" src` qu'aucune autre lecture n'existe.

- [ ] **Step 7 : Seed**

Dans `src/seed/index.ts`, boucle des actualités :
- dans `shared`, remplacer `publie: true` par `_status: 'published', archivee: false` ;
- à la place de `upsertLocalized`, utiliser une variante qui passe `draft: false` : Payload publie alors la version.

Le plus simple est d'ajouter le paramètre à `src/seed/upsert.ts` :

```ts
export async function upsertLocalized(
  payload: Payload,
  collection: CollectionSlug,
  where: Where,
  fr: Record<string, unknown>,
  en: Record<string, unknown>,
): Promise<number | string> {
  const found = await payload.find({ collection, where, limit: 1, depth: 0, locale: 'fr' })
  const existingId = found.docs[0]?.id
  const doc = existingId
    ? await payload.update({ collection, id: existingId, data: fr as never, locale: 'fr', draft: false, context: SEED_CONTEXT })
    : await payload.create({ collection, data: fr as never, locale: 'fr', draft: false, context: SEED_CONTEXT })
  await payload.update({ collection, id: doc.id, data: en as never, locale: 'en', draft: false, context: SEED_CONTEXT })
  return doc.id
}
```

`draft: false` est sans effet sur les collections sans versions.

- [ ] **Step 8 : Tests e2e, à écrire avant de lancer la suite**

Remplacer le premier test de `tests/e2e/api-acces.spec.ts` par :

```ts
test('les actualités brouillon ou archivées ne sont pas exposées', async ({ request }) => {
  const all = await request.get('/api/actualites?limit=100')
  const docs: { _status?: string; archivee?: boolean }[] = (await all.json()).docs ?? []
  expect(docs.length).toBeGreaterThan(0)
  expect(docs.every((d) => d._status === 'published' && d.archivee !== true)).toBe(true)
})
```

Créer `tests/e2e/actualites-etats.spec.ts`. Il crée réellement un brouillon et une actualité archivée, puis les supprime :

```ts
import { expect, test } from '@playwright/test'
import { adminToken } from './admin-helpers'

const DRAFT = { slug: 'e2e-brouillon', title: 'E2E brouillon invisible' }
const ARCHIVED = { slug: 'e2e-archivee', title: 'E2E archivée invisible' }

test.describe.configure({ mode: 'serial' })

test.describe('états des actualités', () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''
  const ids: (string | number)[] = []

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    const headers = { Authorization: `JWT ${token}` }
    const draft = await request.post('/api/actualites?draft=true&locale=fr', {
      headers,
      data: { ...DRAFT, order: 99, _status: 'draft' },
    })
    expect(draft.ok()).toBe(true)
    ids.push((await draft.json()).doc.id)
    const archived = await request.post('/api/actualites?locale=fr', {
      headers,
      data: { ...ARCHIVED, order: 98, _status: 'published', archivee: true },
    })
    expect(archived.ok()).toBe(true)
    ids.push((await archived.json()).doc.id)
  })

  test.afterAll(async ({ request }) => {
    for (const id of ids) await request.delete(`/api/actualites/${id}`, { headers: { Authorization: `JWT ${token}` } })
  })

  test('absentes de la liste, de l’accueil et du plan du site', async ({ page, request }) => {
    for (const path of ['/fr/actualites', '/fr']) {
      await page.goto(path)
      await expect(page.getByText(DRAFT.title)).toHaveCount(0)
      await expect(page.getByText(ARCHIVED.title)).toHaveCount(0)
    }
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).not.toContain(DRAFT.slug)
    expect(sitemap).not.toContain(ARCHIVED.slug)
  })

  test('URL publique en 404', async ({ request }) => {
    expect((await request.get(`/fr/actualites/${DRAFT.slug}`)).status()).toBe(404)
    expect((await request.get(`/fr/actualites/${ARCHIVED.slug}`)).status()).toBe(404)
  })

  test('absentes de l’API publique', async ({ request }) => {
    const docs: { slug: string }[] = (await (await request.get('/api/actualites?limit=100')).json()).docs
    expect(docs.map((d) => d.slug)).not.toContain(DRAFT.slug)
    expect(docs.map((d) => d.slug)).not.toContain(ARCHIVED.slug)
  })
})
```

Si `POST /api/actualites?draft=true` refuse un document sans champs requis, ajouter les champs requis réellement exigés par la collection. Lire l'erreur : la collection exige `title`, `slug` et `order`.

- [ ] **Step 9 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected: tout passe. Les 3 actualités du seed restent visibles sur `/fr/actualites`.

- [ ] **Step 10 : Commit**

```bash
git add src/collections/Actualites.ts src/lib/actualites.ts src/lib/content.ts src/seed src/migrations src/payload-types.ts tests/unit/actualites-visibilite.test.ts tests/unit/access.test.ts tests/e2e/api-acces.spec.ts tests/e2e/actualites-etats.spec.ts
git commit -F - <<'EOF'
feat: actualités en brouillon, publication et archivage

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3 : Aperçu des brouillons (draftMode)

**Files:**
- Create: `src/lib/preview.ts`, `tests/unit/preview.test.ts`
- Create: `src/app/(site)/api/apercu/route.ts`, `src/app/(site)/api/apercu/fin/route.ts`
- Create: `src/components/layout/PreviewBanner.tsx`
- Modify: `src/collections/Actualites.ts` (`admin.preview`), `src/lib/content.ts` (`getActualite` avec option `draft`), `src/app/(site)/[locale]/actualites/[slug]/page.tsx`
- Modify: `src/lib/i18n/dictionaries/fr.ts`, `en.ts` (libellés du bandeau), `.env.example`, `README.md`, `scripts/e2e-server.ts` (`PREVIEW_SECRET`)
- Create: `tests/e2e/apercu.spec.ts`

**Interfaces:**
- Consumes: `VISIBLE_ACTUALITE` (tâche 2), `loginAdmin` et `adminToken` (tâche 1).
- Produces :
  - `previewUrl(base: string, path: string, secret: string): string`.
  - `isSafePreviewPath(path: string): boolean`. Il n'accepte qu'un chemin interne `/fr/...` ou `/en/...`, sans `//` ni schéma.
  - `getActualite(slug: string, locale: Locale, draft = false)`. Le troisième argument est un booléen et non un objet, car `cache` de React compare les arguments par valeur.

- [ ] **Step 1 : Lire la doc Next**

Lire `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/draft-mode.md` en entier : activation dans un Route Handler, lecture de `isEnabled` dans une page, désactivation.

- [ ] **Step 2 : Test unitaire, à écrire avant le code**

`tests/unit/preview.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { isSafePreviewPath, previewUrl } from '@/lib/preview'

describe('URL d’aperçu', () => {
  it('construit l’URL avec le chemin et le secret encodés', () => {
    expect(previewUrl('https://site.org', '/fr/actualites/a b', 's&1')).toBe(
      'https://site.org/api/apercu?path=%2Ffr%2Factualites%2Fa%20b&secret=s%261',
    )
  })
  it('n’accepte que des chemins internes localisés', () => {
    expect(isSafePreviewPath('/fr/actualites/x')).toBe(true)
    expect(isSafePreviewPath('/en/actualites/x')).toBe(true)
    expect(isSafePreviewPath('https://evil.com')).toBe(false)
    expect(isSafePreviewPath('//evil.com')).toBe(false)
    expect(isSafePreviewPath('/es/actualites/x')).toBe(false)
    expect(isSafePreviewPath('/fr/../admin')).toBe(false)
  })
})
```

Run: `npx vitest run tests/unit/preview.test.ts`

Expected: FAIL, module introuvable.

- [ ] **Step 3 : Implémenter `src/lib/preview.ts`**

```ts
import { LOCALES } from './i18n/config'

export function previewUrl(base: string, path: string, secret: string): string {
  return `${base}/api/apercu?path=${encodeURIComponent(path)}&secret=${encodeURIComponent(secret)}`
}

/** Chemin interne d'une langue active, sans redirection ouverte ni remontée de dossier. */
export function isSafePreviewPath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('..')) return false
  const first = path.split('/')[1] ?? ''
  return (LOCALES as readonly string[]).includes(first)
}
```

Run: `npx vitest run tests/unit/preview.test.ts`

Expected: PASS.

- [ ] **Step 4 : Route d'activation**

`src/app/(site)/api/apercu/route.ts` :

```ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isSafePreviewPath } from '@/lib/preview'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? ''
  const secret = url.searchParams.get('secret') ?? ''
  const expected = process.env.PREVIEW_SECRET
  if (!expected || secret !== expected || !isSafePreviewPath(path)) return new Response('Non autorisé', { status: 401 })

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Non autorisé', { status: 401 })

  ;(await draftMode()).enable()
  redirect(path)
}
```

`src/app/(site)/api/apercu/fin/route.ts` :

```ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { isSafePreviewPath } from '@/lib/preview'

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') ?? '/fr'
  ;(await draftMode()).disable()
  redirect(isSafePreviewPath(path) ? path : '/fr')
}
```

**Vérification de routage obligatoire.** Payload possède `src/app/(payload)/api/[...slug]/route.ts`. Le segment statique `apercu` doit gagner sur ce catch-all. Avec `npm run dev` lancé, faire :

```bash
curl -s -o /dev/null -w '%{http_code}' 'http://localhost:3000/api/apercu?path=/fr&secret=x'
```

Expected: `401`, qui vient de notre route, et non un JSON 404 de Payload. Si Payload intercepte la requête, déplacer les deux routes dans `src/app/apercu/route.ts` et `src/app/apercu/fin/route.ts`, puis ajouter `apercu` à `PASSTHROUGH` dans `src/lib/i18n/routing.ts` et au `matcher` de `src/proxy.ts`. Dans ce cas, adapter `previewUrl` et les tests en conséquence, et le signaler dans le rapport.

- [ ] **Step 5 : `admin.preview` sur la collection**

Dans `src/collections/Actualites.ts`, bloc `admin` :

```ts
preview: (doc, { locale }) =>
  typeof doc.slug === 'string' && process.env.PREVIEW_SECRET
    ? previewUrl(siteUrl(), `/${locale === 'en' ? 'en' : 'fr'}/actualites/${doc.slug}`, process.env.PREVIEW_SECRET)
    : null,
```

Imports : `import { previewUrl } from '../lib/preview'` et `import { siteUrl } from '../lib/seo'`. Si l'import de `seo.ts` (qui importe `next`) pose problème côté config Payload, inliner `process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'` **uniquement ici**, avec un commentaire.

- [ ] **Step 6 : Lecture en brouillon et bandeau**

`src/lib/content.ts` :

```ts
export const getActualite = cache(async (slug: string, locale: Locale, draft = false): Promise<Actualite | null> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'actualites',
    where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, VISIBLE_ACTUALITE] },
    draft,
    locale,
    depth: 1,
    limit: 1,
  })
  return res.docs[0] ?? null
})
```

`cache` compare les arguments par valeur : `draft` est donc un booléen, pas un objet.

`src/components/layout/PreviewBanner.tsx` :

```tsx
type Props = { label: string; exitLabel: string; exitHref: string }

export default function PreviewBanner({ label, exitLabel, exitHref }: Props) {
  return (
    <div role="status" className="bg-gold text-deep text-sm font-semibold px-6 py-2 flex items-center justify-center gap-4">
      <span>{label}</span>
      <a href={exitHref} className="underline">{exitLabel}</a>
    </div>
  )
}
```

Utiliser les classes de couleurs existantes. Vérifier dans `globals.css` les noms des tokens or et vert profond (`--color-…`), et adapter `bg-gold` et `text-deep` aux tokens réels.

Dictionnaires, clé `preview` (FR et EN) :

```ts
// fr.ts
preview: { banner: 'Aperçu — non publié', exit: 'Quitter l’aperçu' },
// en.ts
preview: { banner: 'Preview — not published', exit: 'Exit preview' },
```

Ajouter la clé au type du dictionnaire. `tests/unit/dictionaries.test.ts` vérifie la parité FR/EN.

Dans `src/app/(site)/[locale]/actualites/[slug]/page.tsx` :

```tsx
import { draftMode } from 'next/headers'
import PreviewBanner from '@/components/layout/PreviewBanner'
// …
const { isEnabled: preview } = await draftMode()
const actualite = await getActualite(slug, locale, preview)
if (!actualite) notFound()
// en tête du JSX retourné :
{preview && <PreviewBanner label={dict.preview.banner} exitLabel={dict.preview.exit} exitHref={`/api/apercu/fin?path=${encodeURIComponent(`/${locale}/actualites/${slug}`)}`} />}
```

Faire de même dans `generateMetadata` si elle appelle `getActualite`, en passant `preview`.

- [ ] **Step 7 : Variable d'environnement**

- `.env.example` : ajouter `PREVIEW_SECRET=remplacer-par-une-chaine-aleatoire`.
- `scripts/e2e-server.ts`, `E2E_ENV` : ajouter `PREVIEW_SECRET: 'e2e-apercu'`.
- `README.md`, section des variables d'environnement : `PREVIEW_SECRET` sécurise l'aperçu des brouillons. Il est obligatoire en production. Sans lui, le bouton Aperçu de l'admin est désactivé.
- `docker-compose.yml`, `environment` du service `app` : `PREVIEW_SECRET: ${PREVIEW_SECRET:?}`.

- [ ] **Step 8 : Test e2e**

`tests/e2e/apercu.spec.ts` :

```ts
import { expect, test } from '@playwright/test'
import { adminToken, loginAdmin } from './admin-helpers'

const DRAFT = { slug: 'e2e-apercu', title: 'E2E aperçu brouillon' }

test.describe.configure({ mode: 'serial' })

test.describe('aperçu des brouillons', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop uniquement')
  let token = ''
  let id: string | number = ''

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    const res = await request.post('/api/actualites?draft=true&locale=fr', {
      headers: { Authorization: `JWT ${token}` },
      data: { ...DRAFT, order: 97, _status: 'draft' },
    })
    expect(res.ok()).toBe(true)
    id = (await res.json()).doc.id
  })

  test.afterAll(async ({ request }) => {
    await request.delete(`/api/actualites/${id}`, { headers: { Authorization: `JWT ${token}` } })
  })

  test('refusé sans connexion ou avec un mauvais secret', async ({ request }) => {
    expect((await request.get(`/api/apercu?path=/fr/actualites/${DRAFT.slug}&secret=e2e-apercu`)).status()).toBe(401)
    expect((await request.get(`/api/apercu?path=https://evil.com&secret=e2e-apercu`)).status()).toBe(401)
  })

  test('un admin connecté voit le brouillon avec le bandeau, puis quitte l’aperçu', async ({ page }) => {
    await loginAdmin(page)
    await page.goto(`/api/apercu?path=/fr/actualites/${DRAFT.slug}&secret=e2e-apercu`)
    await expect(page.getByRole('heading', { name: DRAFT.title })).toBeVisible()
    await expect(page.getByRole('status').getByText('Aperçu — non publié')).toBeVisible()
    await page.getByRole('link', { name: 'Quitter l’aperçu' }).click()
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  })
})
```

Run: `npm run test:e2e -- tests/e2e/apercu.spec.ts --project=desktop`. Écrire la spec avant les étapes 4 à 6 et constater d'abord l'échec, ce qui fait la preuve RED. Ensuite, Expected: PASS.

- [ ] **Step 9 : Vérifier tout**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected: tout passe.

- [ ] **Step 10 : Commit**

```bash
git add src/lib/preview.ts "src/app/(site)/api" src/components/layout/PreviewBanner.tsx src/collections/Actualites.ts src/lib/content.ts "src/app/(site)/[locale]/actualites/[slug]/page.tsx" src/lib/i18n/dictionaries .env.example README.md docker-compose.yml scripts/e2e-server.ts tests/unit/preview.test.ts tests/e2e/apercu.spec.ts
git commit -F - <<'EOF'
feat: aperçu des actualités en brouillon pour les admins connectés

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4 : Global « Diaporama d'accueil »

**Files:**
- Create: `src/globals/Diaporama.ts`
- Modify: `src/payload.config.ts`, `src/lib/content.ts`, `src/app/(site)/[locale]/page.tsx`, `src/seed/index.ts`
- Create (généré) : migration `<horodatage>_diaporama` ; Modify: `src/migrations/index.ts`, `src/payload-types.ts`
- Create: `tests/e2e/diaporama.spec.ts`

**Interfaces:**
- Produces: `getDiaporama(locale: Locale): Promise<Media[]>` dans `content.ts`. Il renvoie les médias peuplés, dans l'ordre, et `[]` si rien n'est défini. Le global `diaporama` a `images: (number | Media)[]`.
- **N'enlève pas encore** `reglages.heroImages`. Les pages intérieures l'utilisent jusqu'à la tâche 5.

- [ ] **Step 1 : Test e2e, à écrire avant le code**

`tests/e2e/diaporama.spec.ts` :

```ts
import { expect, test } from '@playwright/test'
import { loginAdmin } from './admin-helpers'

test.describe('diaporama d’accueil', () => {
  test.skip(({ isMobile }) => isMobile, 'admin vérifiée sur desktop')

  test('écran dédié dans le groupe Images', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/globals/diaporama')
    await expect(page.getByRole('heading', { name: 'Diaporama d’accueil' })).toBeVisible()
  })

  test('le Hero de l’accueil affiche les images du diaporama', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.locator('.hero-slide img').first()).toHaveAttribute('src', /forest/)
  })
})
```

Avant d'écrire l'assertion `src`, vérifier dans le code du `HeroSlider` le sélecteur réel des images de fond. Adapter `.hero-slide img` si besoin, mais garder l'assertion « la 1re diapositive vient de `forest.jpg` », qui est la 1re image du diaporama seedé.

Run: `npm run test:e2e -- tests/e2e/diaporama.spec.ts --project=desktop`

Expected: FAIL, car `/admin/globals/diaporama` n'existe pas.

- [ ] **Step 2 : Global**

`src/globals/Diaporama.ts` :

```ts
import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidate'

export const Diaporama: GlobalConfig = {
  slug: 'diaporama',
  typescript: { interface: 'Diaporama' },
  label: 'Diaporama d’accueil',
  admin: { group: 'Images' },
  access: { read: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'images',
      label: 'Images',
      type: 'upload',
      relationTo: 'medias',
      hasMany: true,
      required: true,
      minRows: 1,
      admin: {
        description: 'Les 3 premières images défilent en fond du Hero ; l’ensemble des images alimente aussi le collage de droite. Glisser pour réordonner.',
      },
    },
  ],
}
```

Dans `src/payload.config.ts` : `globals: [Reglages, Diaporama]`.

- [ ] **Step 3 : Migration et copie des données**

Run: `npm run migrate:create diaporama`

Dans `up` du fichier généré, **après** la création des tables `diaporama` et `diaporama_rels`, ajouter :

```ts
await db.execute(sql`
  INSERT INTO "diaporama" ("updated_at", "created_at") SELECT now(), now() WHERE NOT EXISTS (SELECT 1 FROM "diaporama");
  INSERT INTO "diaporama_rels" ("order", "parent_id", "path", "medias_id")
    SELECT r."order", (SELECT "id" FROM "diaporama" LIMIT 1), 'images', r."medias_id"
    FROM "reglages_rels" r WHERE r."path" = 'heroImages' ORDER BY r."order";
`)
```

Vérifier les noms réels des colonnes de `diaporama_rels` et `reglages_rels` dans le SQL généré et dans `src/migrations/20261005_142134_init.ts` : `order`, `parent_id`, `path`, `medias_id`. Ajuster si besoin. Si `reglages_rels.path` contient `hero_images` plutôt que `heroImages`, utiliser la valeur réelle, à contrôler avec une requête `SELECT DISTINCT path FROM reglages_rels` sur la base de dev.

Run: `npm run migrate; npm run generate:types`

- [ ] **Step 4 : Lecture et accueil**

`src/lib/content.ts` :

```ts
import type { Diaporama } from '@/payload-types'

export const getDiaporama = cache(async (locale: Locale): Promise<Media[]> => {
  const payload = await client()
  const global: Diaporama = await payload.findGlobal({ slug: 'diaporama', locale, depth: 1 })
  return (global.images ?? []).filter((m): m is Media => typeof m === 'object' && m !== null)
})
```

Dans `src/app/(site)/[locale]/page.tsx`, remplacer la lecture `reglages.heroImages` par `getDiaporama(locale)` :

```ts
const [page, projets, actualites, images] = await Promise.all([
  getPage('accueil', locale),
  getProjets(locale),
  getActualites(locale),
  getDiaporama(locale),
])
```

Supprimer le filtre `const images = (reglages.heroImages ?? [])…` et l'import de `getReglages` s'il n'est plus utilisé.

- [ ] **Step 5 : Seed**

Dans `src/seed/index.ts`, après les pages, actualités et projets :

```ts
const images = HERO_ORDER.map((k) => media[k] as number)
await payload.updateGlobal({ slug: 'diaporama', data: { images }, context: SEED_CONTEXT })
```

Laisser `heroImages` dans `reglages` pour cette tâche : la tâche 5 le supprime.

- [ ] **Step 6 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected: tout passe, y compris `diaporama.spec.ts` et `accueil.spec.ts`.

- [ ] **Step 7 : Commit**

```bash
git add src/globals/Diaporama.ts src/payload.config.ts src/lib/content.ts "src/app/(site)/[locale]/page.tsx" src/seed/index.ts src/migrations src/payload-types.ts tests/e2e/diaporama.spec.ts "src/app/(payload)/admin/importMap.js"
git commit -F - <<'EOF'
feat: écran « Diaporama d'accueil » dans l'admin

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5 : Image d'en-tête propre à chaque page

**Files:**
- Modify: `src/collections/Pages.ts`, `src/globals/Reglages.ts` (supprime `heroImages`)
- Modify: les pages `src/app/(site)/[locale]/{ong,mot-de-la-presidente,organisation,projets,actualites,adhesion,mediatheque,contact}/page.tsx`, `src/components/ui/TextPage.tsx`, `src/components/news/ActualitesHero.tsx`, les 4 pages qui utilisent `TextPage` (`partenariats`, `transparence`, `confidentialite`, `mentions-legales`)
- Modify: `src/seed/index.ts`, `src/seed/data/types.ts` si nécessaire
- Create (généré) : migration `<horodatage>_pages_image_entete` ; Modify: `src/migrations/index.ts`, `src/payload-types.ts`
- Create: `tests/e2e/images-entete.spec.ts`

**Interfaces:**
- Consumes: `getDiaporama` (tâche 4) pour l'accueil, qui ne change pas.
- Produces: `Page.heroImage?: number | Media | null`. `TextPage` ne prend plus `imageIndex`. `ActualitesHero` prend `image?: Media | number | null` à la place de `images`.

**Correspondance actuelle, à préserver.** Les index renvoient à `reglages.heroImages`, dans l'ordre `HERO_ORDER` = `forest, youth, community, education, sport, health, solidarity, banner`.

| Page | Index actuel | Image seed |
|---|---|---|
| ong | 2 | community |
| mot-de-la-presidente | 0 | forest |
| organisation | 6 | solidarity |
| projets | 3 | education |
| actualites | 0 | forest |
| adhesion | 1 | youth |
| mediatheque | 4 | sport |
| partenariats | 6 | solidarity |
| transparence | 2 | community |
| contact | 0 (hero et localisation) | forest |
| confidentialite | 0 | forest |
| mentions-legales | 0 | forest |
| accueil | — (diaporama) | aucune |

- [ ] **Step 1 : Test e2e, à écrire avant le code**

`tests/e2e/images-entete.spec.ts` :

```ts
import { expect, test } from '@playwright/test'

// L'image d'en-tête vient du champ propre à chaque page (seed : correspondance du lot 1 conservée).
const EXPECTED: [string, RegExp][] = [
  ['/fr/ong', /community/],
  ['/fr/organisation', /solidarity/],
  ['/fr/projets', /education/],
  ['/fr/adhesion', /youth/],
  ['/fr/mediatheque', /sport/],
  ['/fr/contact', /forest/],
]

for (const [path, image] of EXPECTED) {
  test(`en-tête de ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('main img').first()).toHaveAttribute('src', image)
  })
}

test('l’admin propose « Image d’en-tête » sur une page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'admin desktop')
  const { loginAdmin } = await import('./admin-helpers')
  await loginAdmin(page)
  await page.goto('/admin/collections/pages')
  await page.getByRole('link', { name: 'contact' }).first().click()
  await expect(page.getByText('Image d’en-tête')).toBeVisible()
})
```

Si la première image de `main` n'est pas celle de l'en-tête sur une page, cibler le conteneur réel du hero (`PageHero`, `OngHero`, `MediathequeHero`). Vérifier le DOM d'abord. Ce test passe déjà en partie avant le changement, puisque les images sont les mêmes : la preuve RED est donc l'assertion admin « Image d'en-tête », qui doit échouer.

Run: `npm run test:e2e -- tests/e2e/images-entete.spec.ts --project=desktop`

Expected: FAIL sur le test admin.

- [ ] **Step 2 : Champ et suppression**

Dans `src/collections/Pages.ts`, juste après `intro` :

```ts
{
  name: 'heroImage',
  label: 'Image d’en-tête',
  type: 'upload',
  relationTo: 'medias',
  admin: { description: 'Photo affichée en haut de la page. Vide : fond vert de la charte. (Sans effet sur l’accueil, qui utilise le diaporama.)' },
},
```

Dans `src/globals/Reglages.ts` : supprimer le champ `heroImages`.

- [ ] **Step 3 : Migration et reprise**

Run: `npm run migrate:create pages_image_entete`

Le SQL généré ajoute `hero_image_id` à `pages` et supprime les lignes ou la logique `heroImages` de `reglages_rels`. Dans `up`, **avant** toute suppression liée à `heroImages`, insérer :

```ts
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
```

- La colonne `pages.slug` est un enum, d'où le cast `::text`.
- `reglages_rels.order` commence à 1 : le vérifier avec `SELECT path, "order" FROM reglages_rels ORDER BY "order"` sur la base de dev.
- Vérifier aussi la valeur réelle de `path`.

Run: `npm run migrate; npm run generate:types`

Vérifier sur la base de dev que `SELECT slug, hero_image_id FROM pages` est rempli pour les 12 pages, et vide pour `accueil`.

- [ ] **Step 4 : Les pages lisent `page.heroImage`**

Dans chaque page du tableau, remplacer `reglages.heroImages?.[N]` par `page.heroImage`. Exemple (`contact/page.tsx`, deux occurrences : hero et image de localisation) :

```tsx
<PageHero eyebrow={dict.nav.contact} title={page.h1 ?? ''} intro={page.intro} image={page.heroImage} />
// …
<MediaImage media={page.heroImage} fill decorative sizes="100vw" className="w-full h-full object-cover" />
```

`src/components/ui/TextPage.tsx` : supprimer `imageIndex` des `Props` et de la signature, puis utiliser `image={page.heroImage}`. Retirer `imageIndex={…}` des 4 pages qui l'appellent.

`src/components/news/ActualitesHero.tsx` : remplacer `images: Media[]` par `image?: Media | number | null` et `media={images[0]}` par `media={image}`. Dans `actualites/page.tsx`, passer `image={page.heroImage}` et supprimer le filtre `images` et `getReglages` s'ils ne servent plus.

Vérifier que les types acceptés par `PageHero`, `OngHero`, `MediathequeHero` et `MediaImage` incluent `number | Media | null | undefined`. Avec `depth: 1`, `getPage` renvoie l'objet `Media`. Puis lancer `grep -rn "heroImages" src` : le résultat doit être vide, hors `payload-types.ts` régénéré.

- [ ] **Step 5 : Seed**

Dans `src/seed/index.ts` :

```ts
const PAGE_HERO: Partial<Record<PageSlug, SeedImageKey>> = {
  ong: 'community',
  'mot-de-la-presidente': 'forest',
  organisation: 'solidarity',
  projets: 'education',
  actualites: 'forest',
  adhesion: 'youth',
  mediatheque: 'sport',
  partenariats: 'solidarity',
  transparence: 'community',
  contact: 'forest',
  confidentialite: 'forest',
  'mentions-legales': 'forest',
}
```

Dans la boucle des pages, ajouter `heroImage: PAGE_HERO[slug] ? media[PAGE_HERO[slug]!] : null` aux données FR. Le champ n'est pas localisé. Retirer `heroImages` de l'`updateGlobal` de `reglages`. Importer `PageSlug` depuis `../collections/Pages`.

- [ ] **Step 6 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected: tout passe. Les captures et l'accessibilité restent vertes.

- [ ] **Step 7 : Commit**

```bash
git add src/collections/Pages.ts src/globals/Reglages.ts "src/app/(site)/[locale]" src/components/ui/TextPage.tsx src/components/news/ActualitesHero.tsx src/seed src/migrations src/payload-types.ts tests/e2e/images-entete.spec.ts
git commit -F - <<'EOF'
feat: image d'en-tête propre à chaque page, indépendante du diaporama

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 6 : Médiathèque — champs des photos, admin et ordre d'affichage

**Files:**
- Modify: `src/collections/Medias.ts`, `src/payload.config.ts` (limite d'upload), `src/lib/content.ts` (`getGalleryMedia` trié)
- Create (généré) : migration `<horodatage>_medias_champs` ; Modify: `src/migrations/index.ts`, `src/payload-types.ts`
- Create: `tests/e2e/mediatheque-ordre.spec.ts`

**Interfaces:**
- Produces: les champs de `Media` `ordre: number`, `source`, `lieu` (localisé), `datePrise`, `droitsConfirmes: boolean` et `droitsNote`, utilisés par les KPI de la tâche 7.

- [ ] **Step 1 : Test e2e, à écrire avant le code**

`tests/e2e/mediatheque-ordre.spec.ts` :

```ts
import { expect, test } from '@playwright/test'
import { adminToken } from './admin-helpers'

test.describe.configure({ mode: 'serial' })

test.describe('ordre de la médiathèque', () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''
  const ids: (number | string)[] = []

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    const headers = { Authorization: `JWT ${token}` }
    // Deux photos existantes du seed passent en médiathèque avec un ordre explicite.
    const list = (await (await request.get('/api/medias?limit=100', { headers })).json()).docs as { id: number; filename: string }[]
    const youth = list.find((m) => m.filename === 'youth.jpg')!
    const sport = list.find((m) => m.filename === 'sport.jpg')!
    for (const [doc, ordre] of [[sport, 1], [youth, 2]] as const) {
      const res = await request.patch(`/api/medias/${doc.id}`, { headers, data: { galerie: true, ordre } })
      expect(res.ok()).toBe(true)
      ids.push(doc.id)
    }
  })

  test.afterAll(async ({ request }) => {
    for (const id of ids) await request.patch(`/api/medias/${id}`, { headers: { Authorization: `JWT ${token}` }, data: { galerie: false, ordre: 0 } })
  })

  test('les photos suivent l’ordre d’affichage', async ({ page }) => {
    await page.goto('/fr/mediatheque')
    const hrefs = await page.locator('main a[href*="/media/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))
    const iSport = hrefs.findIndex((h) => h.includes('sport'))
    const iYouth = hrefs.findIndex((h) => h.includes('youth'))
    expect(iSport).toBeGreaterThanOrEqual(0)
    expect(iSport).toBeLessThan(iYouth)
  })
})
```

Adapter le sélecteur des vignettes au DOM réel de `Gallery.tsx` : ce sont des liens `<a href={item.url}>`. Vérifier le format de `item.url`.

Run: `npm run test:e2e -- tests/e2e/mediatheque-ordre.spec.ts --project=desktop`

Expected: FAIL, car le champ `ordre` n'existe pas et le PATCH est rejeté ou ignoré.

- [ ] **Step 2 : Champs et admin**

`src/collections/Medias.ts` :

```ts
admin: {
  useAsTitle: 'filename',
  group: 'Images',
  defaultColumns: ['filename', 'galerie', 'provisoire', 'droitsConfirmes', 'ordre'],
  listSearchableFields: ['filename', 'alt', 'caption', 'credit'],
},
fields: [
  // … alt, caption, credit, galerie, provisoire inchangés
  { name: 'ordre', label: 'Ordre d’affichage dans la médiathèque', type: 'number', defaultValue: 0, admin: { description: 'Les plus petits nombres s’affichent en premier.' } },
  { name: 'source', label: 'Source', type: 'text' },
  { name: 'lieu', label: 'Lieu (si documenté)', type: 'text', localized: true },
  { name: 'datePrise', label: 'Date de prise de vue (si documentée)', type: 'date' },
  { name: 'droitsConfirmes', label: 'Droits de diffusion confirmés', type: 'checkbox', defaultValue: false, admin: { description: 'Renseigne le dossier ; ne remplace pas une preuve de droits.' } },
  { name: 'droitsNote', label: 'Précisions sur les droits', type: 'textarea' },
],
```

`src/payload.config.ts` :

```ts
upload: { limits: { fileSize: 20_000_000 } }, // 20 Mo par photo (PRD BO-10)
```

Vérifier dans les types de `buildConfig` que la clé est bien `upload.limits.fileSize`. Sinon, utiliser l'option équivalente documentée de Payload 3.90.

- [ ] **Step 3 : Migration**

Run: `npm run migrate:create medias_champs; npm run migrate; npm run generate:types`

Aucune reprise de données : les valeurs par défaut suffisent. Vérifier que le SQL généré ne supprime rien d'autre.

- [ ] **Step 4 : Tri de la galerie**

`src/lib/content.ts`, dans `getGalleryMedia`, remplacer `sort: 'createdAt'` par `sort: ['ordre', 'createdAt']`.

- [ ] **Step 5 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected: tout passe, y compris `mediatheque.spec.ts` du lot 1 et `mediatheque-ordre.spec.ts`.

- [ ] **Step 6 : Commit**

```bash
git add src/collections/Medias.ts src/payload.config.ts src/lib/content.ts src/migrations src/payload-types.ts tests/e2e/mediatheque-ordre.spec.ts
git commit -F - <<'EOF'
feat: médiathèque — ordre d'affichage, source, lieu, date et droits des photos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 7 : Tableau de bord des indicateurs

**Files:**
- Create: `src/lib/kpi/compute.ts`, `src/lib/kpi/load.ts`, `src/components/admin/KpiDashboard.tsx`, `src/components/admin/kpi-dashboard.css`
- Modify: `src/payload.config.ts` (`admin.components.beforeDashboard`), `src/app/(payload)/admin/importMap.js` (régénéré)
- Create: `tests/unit/kpi.test.ts`, `tests/e2e/tableau-de-bord.spec.ts`
- Modify: `README.md` (courte section « Administration »)

**Interfaces:**
- Consumes :
  - `isPlaceholder` de `src/lib/text.ts` ;
  - `Media.droitsConfirmes`, `galerie`, `provisoire` et `alt` (tâche 6) ;
  - `Actualite._status` et `archivee` (tâche 2).
- Produces (dans `src/lib/kpi/compute.ts`) :

```ts
export type KpiState = { kind: 'value'; value: number } | { kind: 'unavailable' } | { kind: 'no-source'; note: string }
export type ActualiteRow = { _status?: string | null; archivee?: boolean | null }
export type MediaRow = { galerie?: boolean | null; provisoire?: boolean | null; alt?: string | null; droitsConfirmes?: boolean | null }
export type TitleRow = { titleEn?: string | null }
export function actualiteCounts(rows: ActualiteRow[]): { publiees: number; brouillons: number; archivees: number }
export function missingTranslations(rows: TitleRow[]): number
export function mediaCounts(rows: MediaRow[]): { total: number; galerie: number; provisoires: number; sansAlt: number; droitsNonConfirmes: number }
export const NO_SOURCE: { id: string; title: string; note: string }[]
export function formatSituation(date: Date): string
```

**Règles de calcul :**
- `publiees` = publiée ET non archivée ; `brouillons` = brouillon ET non archivée ; `archivees` = `archivee === true`.
- `sansAlt` ne compte que les photos **non provisoires** dont `alt` est un brouillon. Une photo provisoire est décorative par conception, donc on ne la compte pas deux fois.
- `missingTranslations` compte les lignes dont `titleEn` est un brouillon : vide, `null` ou contenant `[...]`.

- [ ] **Step 1 : Tests unitaires, à écrire avant le code**

`tests/unit/kpi.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { NO_SOURCE, actualiteCounts, formatSituation, mediaCounts, missingTranslations } from '@/lib/kpi/compute'

describe('KPI', () => {
  it('compte les actualités par état (archivée prioritaire)', () => {
    expect(
      actualiteCounts([
        { _status: 'published', archivee: false },
        { _status: 'published', archivee: true },
        { _status: 'draft', archivee: false },
        { _status: 'draft', archivee: true },
        { _status: 'published', archivee: null },
      ]),
    ).toEqual({ publiees: 2, brouillons: 1, archivees: 2 })
  })

  it('zéro réel quand la liste est vide', () => {
    expect(actualiteCounts([])).toEqual({ publiees: 0, brouillons: 0, archivees: 0 })
    expect(mediaCounts([])).toEqual({ total: 0, galerie: 0, provisoires: 0, sansAlt: 0, droitsNonConfirmes: 0 })
  })

  it('traductions manquantes : vide, null ou brouillon', () => {
    expect(missingTranslations([{ titleEn: 'News' }, { titleEn: '' }, { titleEn: null }, { titleEn: '[à traduire]' }, {}])).toBe(4)
  })

  it('alertes photos : provisoires non comptées comme sans texte alternatif', () => {
    expect(
      mediaCounts([
        { galerie: true, provisoire: false, alt: 'Bannière', droitsConfirmes: true },
        { galerie: false, provisoire: true, alt: '', droitsConfirmes: false },
        { galerie: true, provisoire: false, alt: '', droitsConfirmes: false },
      ]),
    ).toEqual({ total: 3, galerie: 2, provisoires: 1, sansAlt: 1, droitsNonConfirmes: 2 })
  })

  it('cartes sans source : adhésions, transactions, chargements, sauvegardes', () => {
    expect(NO_SOURCE.map((c) => c.id)).toEqual(['adhesions', 'transactions', 'chargements', 'sauvegardes'])
    expect(NO_SOURCE.every((c) => c.note.length > 0)).toBe(true)
  })

  it('situation datée en heure de Libreville', () => {
    expect(formatSituation(new Date('2026-10-06T23:30:00Z'))).toBe('7 octobre 2026 à 00:30')
  })
})
```

Run: `npx vitest run tests/unit/kpi.test.ts`

Expected: FAIL, module introuvable.

- [ ] **Step 2 : Calculs purs**

`src/lib/kpi/compute.ts` :

```ts
import { isPlaceholder } from '../text'

export type KpiState = { kind: 'value'; value: number } | { kind: 'unavailable' } | { kind: 'no-source'; note: string }
export type ActualiteRow = { _status?: string | null; archivee?: boolean | null }
export type MediaRow = { galerie?: boolean | null; provisoire?: boolean | null; alt?: string | null; droitsConfirmes?: boolean | null }
export type TitleRow = { titleEn?: string | null }

export function actualiteCounts(rows: ActualiteRow[]) {
  let publiees = 0
  let brouillons = 0
  let archivees = 0
  for (const r of rows) {
    if (r.archivee === true) archivees++
    else if (r._status === 'published') publiees++
    else brouillons++
  }
  return { publiees, brouillons, archivees }
}

export function missingTranslations(rows: TitleRow[]): number {
  return rows.filter((r) => isPlaceholder(r.titleEn ?? undefined)).length
}

export function mediaCounts(rows: MediaRow[]) {
  return {
    total: rows.length,
    galerie: rows.filter((r) => r.galerie === true).length,
    provisoires: rows.filter((r) => r.provisoire === true).length,
    sansAlt: rows.filter((r) => r.provisoire !== true && isPlaceholder(r.alt ?? undefined)).length,
    droitsNonConfirmes: rows.filter((r) => r.droitsConfirmes !== true).length,
  }
}

export const NO_SOURCE = [
  { id: 'adhesions', title: 'Adhésions (KPI-01 à KPI-10)', note: 'Aucune source configurée — disponible au lot 2' },
  { id: 'transactions', title: 'Transactions (KPI-11 à KPI-17)', note: 'Aucune source configurée — disponible au lot 4' },
  { id: 'chargements', title: 'Chargements en erreur (KPI-19)', note: 'Aucune source configurée' },
  { id: 'sauvegardes', title: 'Sauvegardes (KPI-20)', note: 'Aucune sauvegarde configurée' },
]

const SITUATION = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Libreville' })

export function formatSituation(date: Date): string {
  return SITUATION.format(date)
}
```

Vérifier la signature de `isPlaceholder` dans `src/lib/text.ts`. Si elle accepte `null`, retirer les `?? undefined`. Si le format `Intl` de Node donne `7 octobre 2026 à 00:30` avec une espace insécable ou un autre séparateur, aligner l'attente du test sur la sortie réelle de Node 22, après l'avoir vérifiée.

Run: `npx vitest run tests/unit/kpi.test.ts`

Expected: PASS.

- [ ] **Step 3 : Lecture des données**

`src/lib/kpi/load.ts` :

```ts
import type { Payload } from 'payload'
import { actualiteCounts, mediaCounts, missingTranslations, type KpiState } from './compute'

const ALL = { limit: 0, pagination: false, depth: 0 } as const

/** Exécute une lecture ; toute erreur donne « Indisponible » pour cette carte seulement. */
async function safe<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read()
  } catch {
    return null
  }
}

export async function loadKpis(payload: Payload) {
  const [actualites, pages, projets, medias, actuEn, pagesEn, projetsEn] = await Promise.all([
    safe(() => payload.find({ collection: 'actualites', ...ALL, select: { _status: true, archivee: true } })),
    safe(() => payload.count({ collection: 'pages' })),
    safe(() => payload.count({ collection: 'projets' })),
    safe(() => payload.find({ collection: 'medias', ...ALL, locale: 'fr', select: { galerie: true, provisoire: true, alt: true, droitsConfirmes: true } })),
    safe(() => payload.find({ collection: 'actualites', ...ALL, locale: 'en', fallbackLocale: false, select: { title: true } })),
    safe(() => payload.find({ collection: 'pages', ...ALL, locale: 'en', fallbackLocale: false, select: { h1: true } })),
    safe(() => payload.find({ collection: 'projets', ...ALL, locale: 'en', fallbackLocale: false, select: { title: true } })),
  ])

  const value = (n: number): KpiState => ({ kind: 'value', value: n })
  const unavailable: KpiState = { kind: 'unavailable' }

  const actu = actualites ? actualiteCounts(actualites.docs) : null
  const med = medias ? mediaCounts(medias.docs) : null
  const translations =
    actuEn && pagesEn && projetsEn
      ? missingTranslations([
          ...actuEn.docs.map((d) => ({ titleEn: d.title })),
          ...pagesEn.docs.map((d) => ({ titleEn: d.h1 })),
          ...projetsEn.docs.map((d) => ({ titleEn: d.title })),
        ])
      : null

  return {
    actualites: {
      publiees: actu ? value(actu.publiees) : unavailable,
      brouillons: actu ? value(actu.brouillons) : unavailable,
      archivees: actu ? value(actu.archivees) : unavailable,
    },
    pages: pages ? value(pages.totalDocs) : unavailable,
    projets: projets ? value(projets.totalDocs) : unavailable,
    traductions: translations === null ? unavailable : value(translations),
    medias: med
      ? { total: value(med.total), galerie: value(med.galerie), provisoires: value(med.provisoires), sansAlt: value(med.sansAlt), droitsNonConfirmes: value(med.droitsNonConfirmes) }
      : { total: unavailable, galerie: unavailable, provisoires: unavailable, sansAlt: unavailable, droitsNonConfirmes: unavailable },
  }
}

export type Kpis = Awaited<ReturnType<typeof loadKpis>>
```

Vérifier que l'option `select` est supportée par `payload.find` en 3.90, ce qui est le cas en 3.x. Si le typage la refuse, la retirer : les performances restent acceptables, avec moins de 200 documents.

- [ ] **Step 4 : Composant du tableau de bord**

`src/components/admin/KpiDashboard.tsx` (Server Component, props `ServerProps` de Payload) :

```tsx
import type { ServerProps } from 'payload'
import Link from 'next/link'
import { NO_SOURCE, formatSituation, type KpiState } from '@/lib/kpi/compute'
import { loadKpis } from '@/lib/kpi/load'
import './kpi-dashboard.css'

const LIST = '/admin/collections'

function Value({ state }: { state: KpiState }) {
  if (state.kind === 'value') return <strong className="kpi-value">{state.value}</strong>
  if (state.kind === 'unavailable') return <span className="kpi-muted">Indisponible</span>
  return <span className="kpi-muted">{state.note}</span>
}

function Row({ label, state, href }: { label: string; state: KpiState; href: string }) {
  return (
    <li>
      <Link href={href} className="kpi-row">
        <span>{label}</span>
        <Value state={state} />
      </Link>
    </li>
  )
}

export default async function KpiDashboard({ payload }: ServerProps) {
  const k = await loadKpis(payload)
  return (
    <section className="kpi-dashboard" aria-labelledby="kpi-title">
      <header className="kpi-header">
        <h2 id="kpi-title">Indicateurs</h2>
        <p>Situation au {formatSituation(new Date())} (heure de Libreville)</p>
      </header>
      <div className="kpi-grid">
        <article className="kpi-card">
          <h3>Actualités</h3>
          <ul>
            <Row label="Publiées" state={k.actualites.publiees} href={`${LIST}/actualites?where[_status][equals]=published&where[archivee][not_equals]=true`} />
            <Row label="Brouillons" state={k.actualites.brouillons} href={`${LIST}/actualites?where[_status][equals]=draft`} />
            <Row label="Archivées" state={k.actualites.archivees} href={`${LIST}/actualites?where[archivee][equals]=true`} />
          </ul>
        </article>
        <article className="kpi-card">
          <h3>Pages et projets</h3>
          <ul>
            <Row label="Pages" state={k.pages} href={`${LIST}/pages`} />
            <Row label="Projets" state={k.projets} href={`${LIST}/projets`} />
            <Row label="Traductions anglaises à revoir" state={k.traductions} href={`${LIST}/actualites?locale=en`} />
          </ul>
        </article>
        <article className="kpi-card">
          <h3>Photos</h3>
          <ul>
            <Row label="Total" state={k.medias.total} href={`${LIST}/medias`} />
            <Row label="Dans la médiathèque" state={k.medias.galerie} href={`${LIST}/medias?where[galerie][equals]=true`} />
          </ul>
        </article>
        <article className="kpi-card kpi-alert">
          <h3>Alertes photos</h3>
          <ul>
            <Row label="Provisoires à remplacer" state={k.medias.provisoires} href={`${LIST}/medias?where[provisoire][equals]=true`} />
            <Row label="Sans texte alternatif" state={k.medias.sansAlt} href={`${LIST}/medias?where[provisoire][not_equals]=true&where[alt][exists]=false`} />
            <Row label="Droits non confirmés" state={k.medias.droitsNonConfirmes} href={`${LIST}/medias?where[droitsConfirmes][not_equals]=true`} />
          </ul>
        </article>
        {NO_SOURCE.map((c) => (
          <article key={c.id} className="kpi-card kpi-disabled" aria-disabled="true">
            <h3>{c.title}</h3>
            <p className="kpi-muted">{c.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
```

**Liens filtrés.** Le format `?where[champ][op]=valeur` doit ouvrir la liste réellement filtrée. Le vérifier à la main dans l'admin. Si Payload 3.90 exige la forme imbriquée `?where[or][0][and][0][champ][op]=valeur`, générer les liens avec une petite fonction `listHref(collection, conditions)` dans `compute.ts`, testée unitairement, et l'utiliser partout.

**Traductions à revoir.** Le lien mène pour l'instant à la liste des actualités en anglais. C'est acceptable : l'éditeur y voit les titres vides. Un filtre plus précis est hors périmètre.

`src/components/admin/kpi-dashboard.css`, styles sobres qui utilisent les variables CSS de l'admin Payload (`--theme-elevation-*`, `--theme-text`) pour rester lisibles en thème clair comme en sombre :

```css
.kpi-dashboard { margin-bottom: 2.5rem; }
.kpi-header p { color: var(--theme-elevation-600); margin-top: 0.25rem; }
.kpi-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); margin-top: 1rem; }
.kpi-card { border: 1px solid var(--theme-elevation-150); border-radius: 8px; padding: 1rem 1.25rem; background: var(--theme-elevation-0); }
.kpi-card h3 { font-size: 0.95rem; margin: 0 0 0.75rem; }
.kpi-card ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.kpi-row { display: flex; justify-content: space-between; gap: 1rem; text-decoration: none; color: var(--theme-text); }
.kpi-row:hover .kpi-value, .kpi-row:focus-visible .kpi-value { text-decoration: underline; }
.kpi-value { font-size: 1.1rem; }
.kpi-muted { color: var(--theme-elevation-600); font-size: 0.85rem; }
.kpi-alert { border-color: #e6bf58; }
.kpi-disabled { opacity: 0.7; }
```

- [ ] **Step 5 : Enregistrer le composant**

`src/payload.config.ts` :

```ts
admin: {
  user: Users.slug,
  importMap: { baseDir: path.resolve(dirname) },
  components: { beforeDashboard: ['/components/admin/KpiDashboard'] },
},
```

Le chemin est relatif à `importMap.baseDir`, c'est-à-dire `src`.

Run: `npm run generate:importmap`

Expected: `src/app/(payload)/admin/importMap.js` référence `KpiDashboard`.

- [ ] **Step 6 : Test e2e**

`tests/e2e/tableau-de-bord.spec.ts` :

```ts
import { expect, test } from '@playwright/test'
import { loginAdmin } from './admin-helpers'

test.describe('tableau de bord des indicateurs', () => {
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  test('valeurs réelles, situation datée et cartes sans source', async ({ page }) => {
    await loginAdmin(page)
    const board = page.locator('.kpi-dashboard')
    await expect(board.getByRole('heading', { name: 'Indicateurs' })).toBeVisible()
    await expect(board.getByText(/Situation au .* \(heure de Libreville\)/)).toBeVisible()
    // Seed : 3 actualités publiées.
    await expect(board.getByRole('link', { name: /Publiées\s*3/ })).toBeVisible()
    await expect(board.getByText('Aucune source configurée — disponible au lot 2')).toBeVisible()
    await expect(board.getByText('Aucune source configurée — disponible au lot 4')).toBeVisible()
    await expect(board.getByText('Aucune sauvegarde configurée')).toBeVisible()
  })

  test('une carte mène à la liste filtrée', async ({ page }) => {
    await loginAdmin(page)
    await page.locator('.kpi-dashboard').getByRole('link', { name: /Provisoires à remplacer/ }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/medias/)
    await expect(page.getByText('forest.jpg')).toBeVisible()
    await expect(page.getByText('banner.jpg')).toHaveCount(0)
  })
})
```

`banner.jpg` n'est pas provisoire : il ne doit donc pas apparaître dans la liste filtrée. `forest.jpg` l'est. Si une tâche e2e précédente laisse des actualités en plus, le compte « Publiées 3 » reste juste : les tests des tâches 2 et 3 suppriment leurs données en `afterAll`. Ce test tourne en parallèle d'eux, donc soit il les tolère avec `/Publiées\s*[3-9]/`, soit il passe en `serial` avec eux. **Choisir la regex tolérante** et l'expliquer en commentaire.

Écrire ce test avant l'étape 4 et constater l'échec (pas de `.kpi-dashboard`), ce qui fait la preuve RED. Ensuite :

Run: `npm run test:e2e -- tests/e2e/tableau-de-bord.spec.ts --project=desktop`

Expected: PASS.

- [ ] **Step 7 : README**

Ajouter au `README.md` une section « Administration » de 6 à 10 lignes :
- **Admin :** `/admin`, en français.
- **Actualités :**
  - « Enregistrer le brouillon » ne publie pas ; « Publier » met en ligne ;
  - « Archivée » retire l'actualité du site sans la supprimer ;
  - « Aperçu » montre un brouillon aux admins connectés et nécessite `PREVIEW_SECRET`.
- **Images :**
  - *Diaporama d'accueil* pour le Hero de l'accueil ;
  - « Image d'en-tête » dans chaque page ;
  - *Médiathèque* : cocher « Afficher dans la médiathèque » et régler l'ordre.
- **Indicateurs :** la page d'accueil de l'admin, avec des valeurs réelles uniquement. Les cartes adhésions et transactions s'activeront avec les lots 2 et 4.

- [ ] **Step 8 : Vérifier tout**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected: tout passe, y compris l'ensemble des tests du lot 1.

- [ ] **Step 9 : Commit**

```bash
git add src/lib/kpi src/components/admin src/payload.config.ts "src/app/(payload)/admin/importMap.js" tests/unit/kpi.test.ts tests/e2e/tableau-de-bord.spec.ts README.md
git commit -F - <<'EOF'
feat: tableau de bord des indicateurs dans l'admin

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 8 : Albums de la médiathèque et lien depuis une actualité

**Files:**
- Create: `src/collections/Albums.ts`, `src/components/media/AlbumCard.tsx`, `src/app/(site)/[locale]/mediatheque/albums/[slug]/page.tsx`
- Modify: `src/payload.config.ts`, `src/collections/Actualites.ts` (champ `album`), `src/lib/content.ts`, `src/app/(site)/[locale]/mediatheque/page.tsx`, `src/app/(site)/[locale]/actualites/[slug]/page.tsx`, `src/app/sitemap.ts`, `src/lib/i18n/dictionaries/fr.ts` et `en.ts` (et leur type)
- Create (généré) : migration `<horodatage>_albums` ; Modify: `src/migrations/index.ts`, `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`
- Create: `tests/unit/albums.test.ts`, `tests/e2e/albums.spec.ts`

**Interfaces:**
- Consumes :
  - le schéma des tâches 2 (brouillons des actualités) et 6 (champs des médias) ;
  - `adminToken` de la tâche 1 ;
  - `Gallery` et `GalleryItem` du lot 1 (`src/components/media/Gallery.tsx`) ;
  - `MediathequeHero` et `Cta`.
- Produces :
  - `PUBLISHED_ALBUM: Where`, `getAlbums(locale): Promise<Album[]>` et `getAlbum(slug, locale): Promise<Album | null>`, tous dans `content.ts` ;
  - `toGalleryItems(medias: (number | Media | null | undefined)[]): GalleryItem[]`, dans un nouveau `src/lib/gallery.ts`. C'est la conversion `Media` → `GalleryItem` qui existe déjà dans `mediatheque/page.tsx`, déplacée et réutilisée ;
  - `Actualite.album?: number | Album | null`.

- [ ] **Step 1 : Tests, à écrire avant le code**

`tests/unit/albums.test.ts` : il teste `toGalleryItems`.

```ts
import { describe, expect, it } from 'vitest'
import { toGalleryItems } from '@/lib/gallery'

const media = (over: Record<string, unknown>) => ({ id: 1, url: '/media/a.jpg', alt: 'Texte', caption: null, width: 800, height: 600, provisoire: false, ...over }) as never

describe('photos d’une galerie', () => {
  it('ignore les identifiants non peuplés et les médias sans URL', () => {
    expect(toGalleryItems([3, null, undefined, media({ url: null })])).toEqual([])
  })
  it('texte alternatif réel, décoratif si provisoire, légende brouillon masquée', () => {
    expect(toGalleryItems([media({ alt: 'Élèves', caption: '[à compléter]' }), media({ id: 2, provisoire: true, alt: 'X' })])).toEqual([
      { id: 1, url: '/media/a.jpg', alt: 'Élèves', caption: null, width: 800, height: 600 },
      { id: 2, url: '/media/a.jpg', alt: '', caption: null, width: 800, height: 600 },
    ])
  })
})
```

`tests/e2e/albums.spec.ts` : il crée un album publié avec deux photos du seed et une actualité liée, vérifie le site, puis nettoie.

```ts
import { expect, test } from '@playwright/test'
import { adminToken } from './admin-helpers'

test.describe.configure({ mode: 'serial' })

test.describe('albums', () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''
  const created: { collection: string; id: number | string }[] = []

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    const headers = { Authorization: `JWT ${token}` }
    const medias = (await (await request.get('/api/medias?limit=100', { headers })).json()).docs as { id: number; filename: string }[]
    const pick = (f: string) => medias.find((m) => m.filename === f)!.id
    const album = await request.post('/api/albums?locale=fr', {
      headers,
      data: { slug: 'e2e-album', order: 99, title: 'E2E album', dateLabel: '1er janvier 2026', description: 'Album de test', cover: pick('forest.jpg'), photos: [pick('forest.jpg'), pick('youth.jpg')], _status: 'published' },
    })
    expect(album.ok()).toBe(true)
    const albumId = (await album.json()).doc.id
    created.push({ collection: 'albums', id: albumId })
    const actu = await request.post('/api/actualites?locale=fr', {
      headers,
      data: { slug: 'e2e-actu-album', order: 96, title: 'E2E actualité avec album', album: albumId, _status: 'published' },
    })
    expect(actu.ok()).toBe(true)
    created.push({ collection: 'actualites', id: (await actu.json()).doc.id })
  })

  test.afterAll(async ({ request }) => {
    for (const { collection, id } of created.reverse()) await request.delete(`/api/${collection}/${id}`, { headers: { Authorization: `JWT ${token}` } })
  })

  test('la médiathèque liste l’album et sa page affiche ses photos', async ({ page }) => {
    await page.goto('/fr/mediatheque')
    await page.getByRole('link', { name: /E2E album/ }).click()
    await expect(page).toHaveURL(/\/fr\/mediatheque\/albums\/e2e-album$/)
    await expect(page.getByRole('heading', { level: 1, name: 'E2E album' })).toBeVisible()
    await expect(page.locator('main a[href*="/media/"]')).toHaveCount(2)
  })

  test('l’actualité liée mène à l’album', async ({ page }) => {
    await page.goto('/fr/actualites/e2e-actu-album')
    await page.getByRole('link', { name: 'Voir les photos de l’événement' }).click()
    await expect(page).toHaveURL(/\/fr\/mediatheque\/albums\/e2e-album$/)
  })

  test('album inconnu : 404 ; plan du site : album présent', async ({ request }) => {
    expect((await request.get('/fr/mediatheque/albums/inexistant')).status()).toBe(404)
    expect(await (await request.get('/sitemap.xml')).text()).toContain('/mediatheque/albums/e2e-album')
  })
})
```

Adapter les sélecteurs (`main a[href*="/media/"]`) au DOM réel de `Gallery`, comme l'a fait la tâche 6.

Run: `npx vitest run tests/unit/albums.test.ts` puis `npm run test:e2e -- tests/e2e/albums.spec.ts --project=desktop`

Expected: FAIL (module `@/lib/gallery` introuvable ; collection `albums` inexistante).

- [ ] **Step 2 : Collection `albums` et champ `album`**

`src/collections/Albums.ts` :

```ts
import type { CollectionConfig } from 'payload'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const Albums: CollectionConfig = {
  slug: 'albums',
  typescript: { interface: 'Album' },
  labels: { singular: 'Album', plural: 'Albums' },
  admin: { useAsTitle: 'title', group: 'Images', defaultColumns: ['title', '_status', 'dateLabel', 'order'] },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }) },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] },
  defaultSort: 'order',
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { description: 'Adresse de l’album : /mediatheque/albums/<slug>' } },
    { name: 'order', label: 'Ordre', type: 'number', required: true, defaultValue: 0 },
    { name: 'date', label: 'Date (tri, facultatif)', type: 'date' },
    { name: 'dateLabel', label: 'Date affichée', type: 'text', localized: true },
    { name: 'description', label: 'Description', type: 'textarea', localized: true },
    { name: 'cover', label: 'Photo de couverture', type: 'upload', relationTo: 'medias' },
    { name: 'photos', label: 'Photos', type: 'upload', relationTo: 'medias', hasMany: true, required: true, minRows: 1, admin: { description: 'Glisser pour réordonner.' } },
  ],
}
```

Dans `src/payload.config.ts`, ajouter `Albums` à `collections`, juste après `Medias`.

Dans `src/collections/Actualites.ts`, ajouter avant `archivee` :

```ts
{ name: 'album', label: 'Album lié', type: 'relationship', relationTo: 'albums', admin: { description: 'Affiche un bouton « Voir les photos de l’événement » vers cet album.' } },
```

Run: `npm run migrate:create albums; npm run migrate; npm run generate:types; npm run generate:importmap`

La base de dev (5433) doit tourner.

- [ ] **Step 3 : Lectures et conversion**

`src/lib/gallery.ts` : déplacer ici la conversion actuellement écrite dans `mediatheque/page.tsx`.

```ts
import type { GalleryItem } from '@/components/media/Gallery'
import type { Media } from '@/payload-types'
import { isPlaceholder } from './text'

export function toGalleryItems(medias: (number | Media | null | undefined)[]): GalleryItem[] {
  return medias
    .filter((m): m is Media => typeof m === 'object' && m !== null && Boolean(m.url))
    .map((m) => ({
      id: m.id,
      url: m.url!,
      alt: m.provisoire ? '' : (m.alt ?? ''),
      caption: isPlaceholder(m.caption) ? null : m.caption,
      width: m.width ?? 1600,
      height: m.height ?? 900,
    }))
}
```

`src/lib/content.ts` :

```ts
export const PUBLISHED_ALBUM: Where = { _status: { equals: 'published' } }

export const getAlbums = cache(async (locale: Locale): Promise<Album[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'albums', where: PUBLISHED_ALBUM, sort: ['order', '-date'], locale, depth: 1, limit: 100 })
  return res.docs
})

export const getAlbum = cache(async (slug: string, locale: Locale): Promise<Album | null> => {
  const payload = await client()
  const res = await payload.find({ collection: 'albums', where: { and: [{ slug: { equals: slug } }, PUBLISHED_ALBUM] }, locale, depth: 1, limit: 1 })
  return res.docs[0] ?? null
})
```

Importer `Album` depuis `@/payload-types` et `Where` depuis `payload`.

- [ ] **Step 4 : Libellés**

Dictionnaires, dans `common` ou dans une clé `albums` à créer dans les deux langues et dans le type :

| Clé | FR | EN |
|---|---|---|
| `albums.heading` | Albums | Albums |
| `albums.photos` | `(n: number) => n > 1 ? `${n} photos` : `${n} photo`` | `(n: number) => n > 1 ? `${n} photos` : `${n} photo`` |
| `albums.loosePhotos` | Photos | Photos |
| `albums.back` | Retour à la médiathèque | Back to the media library |
| `albums.viewAlbum` | Voir les photos de l’événement | See the event photos |

Si les dictionnaires n'acceptent que des chaînes, utiliser `photos: 'photos'`, `photo: 'photo'` et composer dans le composant. Le test de parité FR/EN existant doit rester vert.

- [ ] **Step 5 : Carte d'album et page Médiathèque**

`src/components/media/AlbumCard.tsx` :

```tsx
import Link from 'next/link'
import MediaImage from '@/components/ui/MediaImage'
import { localizedHref } from '@/lib/i18n/paths'
import type { Locale } from '@/lib/i18n/config'
import type { Album } from '@/payload-types'
import { isPlaceholder } from '@/lib/text'

type Props = { locale: Locale; album: Album; photosLabel: string }

export default function AlbumCard({ locale, album, photosLabel }: Props) {
  return (
    <Link href={localizedHref(locale, `/mediatheque/albums/${album.slug}`)} className="card-lift group block rounded-xl overflow-hidden bg-white border border-black/5">
      <div className="card-media relative aspect-[4/3]">
        <MediaImage media={album.cover ?? album.photos?.[0]} fill decorative sizes="(min-width: 1024px) 33vw, 100vw" className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex flex-col gap-1">
        <h3 className="title-underline text-lg font-bold text-foreground font-headings">{album.title}</h3>
        <p className="text-sm text-foreground/70">
          {!isPlaceholder(album.dateLabel) && <>{album.dateLabel} · </>}
          {photosLabel}
        </p>
      </div>
    </Link>
  )
}
```

Reprendre les classes réelles des cartes existantes (`NewsCard`, `ProjetCard`) pour rester fidèle à la charte : couleurs, rayons et ombres. La carte ci-dessus n'est qu'un squelette.

Dans `src/app/(site)/[locale]/mediatheque/page.tsx` :
- lire `getAlbums(locale)` en parallèle des autres lectures ;
- construire `items` avec `toGalleryItems(medias)` ;
- avant la grille de photos, si `albums.length > 0`, afficher une section avec `SectionHeader` (titre `dict.albums.heading`) et une `RevealGroup` de `AlbumCard` (grille 1, 2 puis 3 colonnes) ;
- si des albums **et** des photos isolées existent, mettre `SectionHeader` (titre `dict.albums.loosePhotos`) au-dessus de la grille ;
- l'état vide (section `vide`) ne s'affiche que s'il n'y a **ni** album **ni** photo.

- [ ] **Step 6 : Page d'un album**

`src/app/(site)/[locale]/mediatheque/albums/[slug]/page.tsx` :

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Gallery from '@/components/media/Gallery'
import MediathequeHero from '@/components/media/MediathequeHero'
import Cta from '@/components/ui/Cta'
import { Paragraphs } from '@/components/ui/Paragraphs'
import { getAlbum } from '@/lib/content'
import { toGalleryItems } from '@/lib/gallery'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { SITE_NAME, pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const album = await getAlbum(slug, locale)
  if (!album) return {}
  const image = typeof album.cover === 'object' ? album.cover?.url : undefined
  return pageMetadata({ locale, path: `/mediatheque/albums/${slug}`, title: `${album.title} — ${SITE_NAME}`, description: album.description ?? undefined, image: image ?? undefined })
}

export default async function AlbumPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const album = await getAlbum(slug, locale)
  if (!album) notFound()
  const dict = getDictionary(locale)
  return (
    <>
      <MediathequeHero eyebrow={dict.nav.mediatheque} title={album.title} intro={album.dateLabel} image={album.cover} />
      <section className="bg-background py-16">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
          <Paragraphs text={album.description} />
          <Gallery items={toGalleryItems(album.photos ?? [])} labels={dict.gallery} />
          <div>
            <Cta locale={locale} href="/mediatheque" label={dict.albums.back} variant="outline" newTabLabel={dict.common.newTab} />
          </div>
        </div>
      </section>
    </>
  )
}
```

Vérifier les props réelles de `MediathequeHero`, `Cta` (noms des variantes, présence d'une icône de flèche de retour), `Paragraphs` et `pageMetadata` (`description` et `image`), puis aligner le code dessus.

- [ ] **Step 7 : Bouton dans l'actualité, et plan du site**

Dans `src/app/(site)/[locale]/actualites/[slug]/page.tsx`, après `<ArticleBody … />` :

```tsx
{typeof actualite.album === 'object' && actualite.album?._status === 'published' && (
  <div className="bg-background pb-12">
    <div className="max-w-[800px] mx-auto px-6">
      <Cta locale={locale} href={`/mediatheque/albums/${actualite.album.slug}`} label={dict.albums.viewAlbum} newTabLabel={dict.common.newTab} />
    </div>
  </div>
)}
```

`getActualite` utilise `depth: 1`, donc `actualite.album` est peuplé. Aligner la largeur du conteneur sur celle d'`ArticleBody`.

`src/app/sitemap.ts` : lire aussi `getAlbums('fr')` et ajouter `...albums.map((a) => `/mediatheque/albums/${a.slug}`)`.

- [ ] **Step 8 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected: tout passe. `seo.spec.ts` compte toujours 40 URL : le seed n'a pas encore d'album, et l'album e2e est créé puis supprimé dans une autre spec. Si les deux specs tournent en parallèle et que le compte devient instable, rendre l'assertion du nombre d'URL robuste aux données de test (par exemple ignorer les slugs `e2e-`) et l'expliquer en commentaire.

- [ ] **Step 9 : Commit**

```bash
git add src/collections/Albums.ts src/collections/Actualites.ts src/payload.config.ts src/lib/content.ts src/lib/gallery.ts src/components/media/AlbumCard.tsx "src/app/(site)/[locale]/mediatheque" "src/app/(site)/[locale]/actualites/[slug]/page.tsx" src/app/sitemap.ts src/lib/i18n/dictionaries src/migrations src/payload-types.ts "src/app/(payload)/admin/importMap.js" tests/unit/albums.test.ts tests/e2e/albums.spec.ts
git commit -F - <<'EOF'
feat: albums de la médiathèque et lien depuis une actualité

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 9 : Contenu « Kafélé et Nianame » (album et actualité)

**Files:**
- Create: `src/seed/images/albums/kafele-nianame/photo-1.jpg` … `photo-6.jpg`, copiés depuis `.superpowers/contenus/kafele-nianame-2026-09/`
- Modify: `src/seed/index.ts`, `src/seed/data/fr.ts`, `src/seed/data/en.ts`, `src/seed/data/types.ts`
- Modify: `tests/unit/seed-data.test.ts` (parité de la nouvelle entrée), `tests/e2e/seo.spec.ts` (nombre d'URL), `tests/e2e/actualites.spec.ts` si un compte d'actualités y figure
- Create: `tests/e2e/kafele-nianame.spec.ts`

**Interfaces:**
- Consumes :
  - la collection `albums` et le champ `actualites.album` (tâche 8) ;
  - les champs `source`, `lieu`, `datePrise`, `droitsConfirmes`, `droitsNote` des médias (tâche 6) ;
  - `upsertLocalized` avec `draft: false` (tâche 2).
- **Textes : à reprendre mot pour mot** depuis `docs/superpowers/plans/2026-10-06-contenu-kafele-nianame.md`. N'inventer aucun texte.

- [ ] **Step 1 : Test e2e, à écrire avant le code**

`tests/e2e/kafele-nianame.spec.ts` :

```ts
import { expect, test } from '@playwright/test'

const TITLE_FR = 'Kafélé et Nianame : un dispensaire et une école réhabilités'
const TITLE_EN = 'Kafélé and Nianame: a health centre and a school rehabilitated'

test('actualité FR en tête de liste, avec bouton vers l’album', async ({ page }) => {
  await page.goto('/fr/actualites')
  await expect(page.locator('main h2, main h3').filter({ hasText: TITLE_FR }).first()).toBeVisible()
  await page.goto('/fr/actualites/kafele-nianame-rehabilitation')
  await expect(page.getByRole('heading', { level: 1, name: TITLE_FR })).toBeVisible()
  await expect(page.getByText('Construction du Komo SARL')).toBeVisible()
  await page.getByRole('link', { name: 'Voir les photos de l’événement' }).click()
  await expect(page).toHaveURL(/\/fr\/mediatheque\/albums\/kafele-nianame-2026-09$/)
  await expect(page.locator('main a[href*="/media/"]')).toHaveCount(6)
  await expect(page.getByRole('img', { name: 'Photo de groupe des participants devant le bâtiment réhabilité' })).toHaveCount(0) // les vignettes sont décoratives : le nom est porté par le lien
})

test('version anglaise', async ({ page }) => {
  await page.goto('/en/actualites/kafele-nianame-rehabilitation')
  await expect(page.getByRole('heading', { level: 1, name: TITLE_EN })).toBeVisible()
  await page.goto('/en/mediatheque')
  await expect(page.getByRole('link', { name: new RegExp(TITLE_EN) })).toBeVisible()
})
```

La dernière assertion du premier test dépend de la façon dont `Gallery` expose le texte alternatif : nom porté par le lien de vignette (lot 1). L'adapter au comportement réel, sans l'affaiblir. L'objectif est de vérifier que le texte alternatif validé est bien exposé aux lecteurs d'écran.

Run: `npm run test:e2e -- tests/e2e/kafele-nianame.spec.ts --project=desktop`

Expected: FAIL (actualité inexistante).

- [ ] **Step 2 : Photos et données**

Copier les 6 photos dans `src/seed/images/albums/kafele-nianame/` (mêmes noms).

Dans `src/seed/data/types.ts` et `fr.ts` / `en.ts`, ajouter :
- l'actualité `kafele-nianame-rehabilitation` dans `actualites`, avec les champs de l'annexe ;
- une nouvelle liste `albums` (FR et EN) contenant l'album `kafele-nianame-2026-09`.

La forme suit celle des actualités existantes. Les références d'images utilisent de nouvelles clés, par exemple `'kafele-1'` à `'kafele-6'`. Étendre le type des clés d'image en conséquence.

- [ ] **Step 3 : Seed**

Dans `src/seed/index.ts` :
1. **Photos.** Déclarer les 6 photos (clé, fichier, `alt` FR/EN, champs communs de l'annexe), avec le chemin `images/albums/kafele-nianame/photo-N.jpg`. Les créer ou les retrouver avec la même logique idempotente que `seedMedia` : correspondance exacte du nom de fichier via `isSeedMediaFilename`, en passant la clé `photo-N` et l'extension `.jpg`. Le plus simple est de généraliser `seedMedia` pour qu'elle accepte un sous-dossier.
2. **Album.** Le créer ou le mettre à jour par `slug` avec `upsertLocalized` (`draft: false`), avec `_status: 'published'`, `cover` = photo-6 et `photos` = photo-1 à photo-6. Les champs localisés passent en FR puis en EN.
3. **Actualité.** Elle est seedée dans la boucle existante, avec `album` = id de l'album et `image` = photo-6. **L'album doit être seedé avant les actualités.**

- [ ] **Step 4 : Tests existants**

- `tests/unit/seed-data.test.ts` : la parité FR/EN doit couvrir la nouvelle actualité et l'album. Ajouter l'album au test de parité s'il ne couvre que des listes connues.
- `tests/e2e/seo.spec.ts` : le nombre d'URL passe de 40 à 44 (une actualité et un album, chacun en FR et en EN). Mettre à jour la constante et son commentaire.
- `tests/e2e/actualites.spec.ts` et `tests/e2e/tableau-de-bord.spec.ts` : ajuster tout compte d'actualités publiées. Le seed compte désormais 4 actualités.

- [ ] **Step 5 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected: tout passe.

Puis lancer `npm run seed` sur la base de dev (5433, déjà lancée). L'utilisateur voit ainsi le nouveau contenu sur http://localhost:3000. Signaler dans le rapport que ce seed réinitialise les modifications faites dans l'admin sur les contenus seedés.

- [ ] **Step 6 : Commit**

```bash
git add src/seed tests/unit/seed-data.test.ts tests/e2e/seo.spec.ts tests/e2e/actualites.spec.ts tests/e2e/tableau-de-bord.spec.ts tests/e2e/kafele-nianame.spec.ts
git commit -F - <<'EOF'
feat: album et actualité « Kafélé et Nianame : un dispensaire et une école réhabilités »

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Couverture de la spec

| Spec | Tâche |
|---|---|
| §3 Admin FR, menu regroupé | 1 |
| §4.1–4.2 Brouillons, archivée, visibilité, accès | 2 |
| §4.3 Aperçu | 3 |
| §4.4 Liste admin des actualités | 2 (colonnes, recherche), 1 (groupe) |
| §5.1 Diaporama | 4 |
| §5.2 Image d'en-tête par page | 5 |
| §6 Médiathèque (champs, admin, limite, tri) | 6 |
| §7 Tableau de bord | 7 |
| §8 Migrations et seed | 2, 4, 5, 6 (une migration par tâche, écart assumé) |
| §9 Erreurs (diaporama vide, `heroImage` vide, aperçu 401, carte indisponible, archivée en 404) | 4, 5, 3, 7, 2 |
| §10 Tests | chaque tâche |
| §10 bis Albums, lien actualité, contenu Kafélé–Nianame | 8, 9 |
| §11 Critères d'acceptation 1–9 | 1 → 1 ; 2 → 2 ; 3 → 2 ; 4 → 3 ; 5 → 4 ; 6 → 5 ; 7 → 6 ; 8 → 7 ; 9 → toutes |
