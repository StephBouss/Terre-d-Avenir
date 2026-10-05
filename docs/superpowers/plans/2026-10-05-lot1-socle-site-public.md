# Lot 1 — Socle Next.js + Payload et site public FR/EN animé : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** remplacer le prototype Vite de Codex par une application Next.js + Payload + PostgreSQL. Elle sert le site public complet du lot 1 en FR et en EN, fidèle à la maquette Banani, avec des animations sobres.

**Architecture :**
- Payload 3 tourne dans l'application Next.js (App Router).
- Les contenus (pages, actualités, projets, médias, réglages) sont localisés `fr`/`en` dans PostgreSQL et lus par l'API locale de Payload depuis des Server Components.
- Les routes publiques sont `/{locale}/…`, gérées par `src/proxy.ts`.
- Les animations reposent sur du CSS, IntersectionObserver et un `template.tsx`, sans aucune bibliothèque.

**Tech Stack :**
- Next.js 16.3.8, React 19.3, Payload 3.90.2 (`@payloadcms/db-postgres`), PostgreSQL 18 ;
- en développement, `embedded-postgres` ; en production, Docker `postgres:18` ;
- Tailwind CSS 4, lucide-react ;
- Vitest 5 + Testing Library, Playwright 1.63 + axe-core.

**Spec de référence :** `docs/superpowers/specs/2026-10-05-lot1-socle-site-public-design.md`
**Contenus à saisir :** `docs/superpowers/plans/2026-10-05-lot1-contenus.md` (annexe de ce plan)

## Global Constraints

- **Forme et fond :** la maquette dicte la forme (couleurs, typos, composants, mises en page du prototype Codex, commit `72dc396`). Les **Textes v1.3 dictent le fond** : tout texte de la maquette absent des Textes v1.3 est supprimé (liste en section « Contenus inventés à supprimer »).
- **Aucune information inventée :** une valeur inconnue n'est pas affichée. Toute chaîne contenant `[...]` est traitée comme un brouillon et masquée (`isPlaceholder`).
- **Langues :** `fr` (par défaut) et `en` actives. Langues prévues mais inactives : `es`, `pt`, `ar`, `zh-Hans`. Les slugs sont identiques dans toutes les langues.
- **Formulaires :** aucun formulaire n'envoie de données au lot 1. Les champs et le bouton portent `disabled` et `aria-disabled="true"`, et aucune requête réseau n'est émise.
- **Animations :** seules des propriétés sans recalcul de mise en page sont animées (`opacity`, `transform`, couleurs, ombres). `prefers-reduced-motion: reduce` coupe toutes les animations. Sans JavaScript, tout le contenu reste visible.
- **Images :** les images provisoires (Unsplash) sont décoratives, avec `alt=""`. Aucun visage ne sert de portrait de personne réelle.
- **Base de données :** `push: false` ; tout changement de schéma passe par `npm run migrate:create`.
- **Gestionnaire de paquets :** npm.
- **Plateforme :** le poste de développement est sous Windows (PowerShell), sans Docker. Les commandes `npm run …` sont multiplateformes.
- **PostgreSQL de développement :** port **5433**, base `terredavenir`, utilisateur et mot de passe `postgres`/`postgres`, données dans `.data/postgres`.
- **Lancement :** toutes les commandes Payload et le site supposent que `npm run db` tourne déjà dans un terminal séparé (ou en arrière-plan).
- **Commits :** messages en français, préfixés (`feat:`, `chore:`, `test:`, `docs:`) et terminés par la ligne `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

## Structure des fichiers

```
website/
  package.json, tsconfig.json, next.config.mjs, postcss.config.mjs, eslint.config.mjs
  vitest.config.ts, vitest.setup.ts, playwright.config.ts
  .env.example, .gitignore, Dockerfile, docker-compose.yml, .dockerignore, README.md
  public/brand/            logo-couleur.png, logo-clair.png, og.jpg
  scripts/
    lib/embedded-db.ts     démarrage de PostgreSQL embarqué (réutilisable)
    db.ts                  `npm run db` : PostgreSQL de dev au premier plan
    e2e-server.ts          base + migrate + seed + `next start` pour Playwright
  src/
    payload.config.ts
    payload-types.ts       (généré)
    migrations/            (généré)
    proxy.ts               langues : redirections et réécritures
    collections/           Users.ts, Pages.ts, Actualites.ts, Projets.ts, Medias.ts
    globals/Reglages.ts
    hooks/revalidate.ts
    lib/
      i18n/config.ts       langues actives/prévues, sens d'écriture, noms natifs
      i18n/paths.ts        localizedHref, switchLocale, stripLocale, alternates, isExternal, isActivePath
      i18n/routing.ts      decideRoute (logique pure du proxy)
      i18n/dictionaries/   fr.ts, en.ts, index.ts (libellés d'interface)
      routes.ts            STATIC_PATHS, NAV_ITEMS, FOOTER_*, pageSlugForPath
      text.ts              isPlaceholder, paragraphs, emphasis
      sections.ts          type Section, getSection
      content.ts           accès Payload (getPage, getActualites, …)
      seo.ts               pageMetadata, buildSitemapEntries
    seed/
      index.ts             point d'entrée `npm run seed`
      upsert.ts            upsertLocalized
      data/types.ts, data/fr.ts, data/en.ts
      images/              banner.jpg + 7 images provisoires
    components/
      layout/              SiteHeader.tsx, LanguageSwitcher.tsx, SiteFooter.tsx
      motion/              useReveal.ts, Reveal.tsx, RevealGroup.tsx, no-js-guard.ts
      ui/                  Icon, GoldDivider, SectionHeader, Cta, Paragraphs, MediaImage,
                           PageHero, ContentSection, CtaBand, ActionThemeCard, NewsCard, FacebookIcon
      home/                HeroSlider, MissionStrip, AncrageSection, MotTeaser, ThemesSection,
                           NewsSection, ParticiperSection
      forms/               AdhesionForm.tsx, ContactForm.tsx, ClosedNotice.tsx
      media/Gallery.tsx    grille et visionneuse (client)
      article/ShareButtons.tsx
    app/
      (payload)/...        copié du template Payload
      (site)/globals.css
      (site)/[locale]/     layout, template, error, not-found, [...rest], page + toutes les routes
      sitemap.ts, robots.ts
  tests/
    unit/*.test.ts(x)
    e2e/*.spec.ts
```

## Règles de portage du prototype Codex (utilisées par les tâches 9 à 14)

Le prototype est lisible avec `git show 72dc396:<chemin>` (ex. `git show 72dc396:src/screens/AccueilDesktop.jsx`). Pour porter un bloc :

- **P1 :** le fichier devient `.tsx`, avec des props typées.
- **P2 :** `import { Link } from 'react-router-dom'` devient `import Link from 'next/link'`, et `to=` devient `href={localizedHref(locale, …)}`. Correspondance des anciennes routes :
  - `/ong#adhesion` → `/adhesion`
  - `/ong#equipe` → `/organisation`
  - `/#mot-presidente` → `/mot-de-la-presidente`
  - `/#actions` → `/projets`
  - `/ong`, `/actualites`, `/mediatheque`, `/contact` sont inchangées.
- **P3 :** chaque `t('…')` est remplacé par un champ de contenu (section Payload) ou un libellé du dictionnaire. **Aucune chaîne française ou anglaise littérale ne reste dans un `.tsx`**, sauf les noms propres « Terre d'Avenir KOMO-KANGO » et « Komo-Kango ».
- **P4 :** `@global/Image` (attribut `prompt`) devient `<MediaImage media={…} />`.
- **P5 :** `@global/Icon` devient `@/components/ui/Icon`.
- **P6 :** les classes Tailwind, les `style={{…}}` en ligne et la structure DOM sont **conservés tels quels**, car c'est la fidélité à la maquette.
- **P7 :** `SiteHeader` et `SiteFooter` sont retirés des écrans : ils sont dans le layout.
- **P8 :** `useState` et les gestionnaires d'événements sont isolés dans un petit composant `'use client'`. La page reste un Server Component.
- **P9 :** les titres et paragraphes de section sont enveloppés dans `<Reveal>`, et les grilles de cartes dans `<RevealGroup>`.
- **P10 :** les classes `card-lift` (carte), `card-media` (conteneur d'image) et `btn-arrow` (lien avec flèche) sont ajoutées aux éléments correspondants.

## Contenus inventés à supprimer (absents des Textes v1.3)

| Écran Codex | Supprimé | Remplacé par |
|---|---|---|
| Accueil, HeroSlider l.100-111 | Statistiques « 4 axes / — membres / — projets » | rien : les repères sont dans la bande de mission |
| Accueil l.25-40 | 4 libellés de la bande de mission | les 3 repères (`accueil.hero.items`) |
| Accueil l.43-86 | « Fondée au Komo-Kango », les 3 puces « Mobiliser… » | section `ancrage` |
| Accueil l.89-145 | Portrait fictif, signature « La Présidente » | composition typographique (guillemet doré) |
| Accueil l.223-238 | Bande « Membres actifs / Demandes reçues… » | bande `transparence` |
| ONG l.105-141 | « Nos valeurs » (4 valeurs) | `ong.ancrage` + `ong.reperes` |
| ONG l.144-189 | Frise « 2022 — Fondation… » | supprimée |
| ONG l.192-232 | Cartes « La Présidente / Membres actifs / Partenaires » | section `demarche` (liens) |
| ONG l.244-495 | Formulaire en 3 étapes (genre, date de naissance…) | `AdhesionForm` (champs des Textes v1.3, désactivé) |
| ONG l.498-545 | « Critères » et « Avantages » d'adhésion, « réponse en 3 à 5 jours » | `adhesion.faq` |
| Article l.91-180 | Corps « Le contexte / Déroulement / Résultats… », « Partenaires : À préciser » | extrait, corps et source de l'actualité |
| Contact l.78-359 | Adresse, BP, e-mail `contact@…`, téléphones, WhatsApp, sujets | 3 cartes d'orientation + `ContactForm` désactivé |
| Footer | E-mail `contact@…`, note « Informations à compléter… » | localisation + Facebook |
| Médiathèque | 12 médias fictifs, filtres, bloc « Contribuer » | médias `galerie=true` + état vide + lien Facebook |

---

### Task 1 : Socle Next.js + Payload + PostgreSQL embarqué

**Files :**
- Delete : `src/` (prototype), `index.html`, `vite.config.js`, `eslint.config.js`, `package.json`, `package-lock.json`, `dist/`
- Create : `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `eslint.config.mjs`, `.env.example`, `.env`
- Create : `scripts/lib/embedded-db.ts`, `scripts/db.ts`
- Create : `src/payload.config.ts`, `src/collections/Users.ts`, `src/app/(payload)/**` (copié du template)
- Create : `src/app/(site)/globals.css`, `src/app/(site)/[locale]/layout.tsx`, `src/app/(site)/[locale]/page.tsx` (provisoires)
- Modify : `.gitignore`

**Interfaces :**
- Produces : `startDatabase(): Promise<EmbeddedPostgres>` (dans `scripts/lib/embedded-db.ts`), l'alias `@payload-config`, l'alias `@/*` → `src/*`, et les scripts npm `db`, `dev`, `build`, `start`, `payload`, `migrate`, `migrate:create`, `seed`, `generate:types`, `generate:importmap`, `lint`, `test`, `test:e2e`.

- [ ] **Step 1 : retirer le prototype Vite** (il reste dans l'historique git, commit `72dc396`)

```powershell
git rm -r -q src index.html vite.config.js eslint.config.js package.json package-lock.json
Remove-Item -Recurse -Force dist, node_modules -ErrorAction SilentlyContinue
```

- [ ] **Step 2 : générer le template Payload « blank » dans un dossier temporaire**

```powershell
Set-Location $env:TEMP
Remove-Item -Recurse -Force payload-template -ErrorAction SilentlyContinue
npx --yes create-payload-app@3.90.2 --name payload-template --template blank --db postgres --db-connection-string "postgres://postgres:postgres@127.0.0.1:5433/terredavenir" --no-deps --use-npm --no-git
Set-Location 'D:\APPLICATION\Site Web\Terre Davenir\website'
```

Si une option est refusée, lancer `npx create-payload-app@3.90.2 --help`, puis relancer avec les noms d'options affichés. Si l'outil pose une question, accepter la valeur par défaut.

- [ ] **Step 3 : copier les fichiers d'admin Payload du template**

```powershell
$tpl = Join-Path $env:TEMP 'payload-template'
New-Item -ItemType Directory -Force 'src/app' | Out-Null
Copy-Item -Recurse -Force (Join-Path $tpl 'src/app/(payload)') 'src/app/(payload)'
Get-Content (Join-Path $tpl 'package.json')
Get-Content (Join-Path $tpl 'tsconfig.json')
```

Noter les dépendances du `package.json` du template. Si un paquet `@payloadcms/*` y figure mais pas dans le Step 4, l'ajouter à la commande d'installation.

- [ ] **Step 4 : créer `package.json` et installer les dépendances**

`package.json` :

```json
{
  "name": "terre-davenir-komo-kango",
  "version": "0.2.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20.9.0" },
  "scripts": {
    "db": "tsx scripts/db.ts",
    "dev": "cross-env NODE_OPTIONS=--no-deprecation next dev",
    "build": "cross-env NODE_OPTIONS=--no-deprecation next build",
    "start": "cross-env NODE_OPTIONS=--no-deprecation next start",
    "payload": "cross-env NODE_OPTIONS=--no-deprecation payload",
    "migrate": "npm run payload -- migrate",
    "migrate:create": "npm run payload -- migrate:create",
    "seed": "npm run payload -- run src/seed/index.ts",
    "generate:types": "npm run payload -- generate:types",
    "generate:importmap": "npm run payload -- generate:importmap",
    "lint": "eslint .",
    "test": "vitest run",
    "test:e2e": "npm run build && playwright test"
  }
}
```

```powershell
npm install next@16.3.8 react@19.3.0 react-dom@19.3.0 payload@3.90.2 @payloadcms/next@3.90.2 @payloadcms/db-postgres@3.90.2 @payloadcms/richtext-lexical@3.90.2 @payloadcms/ui@3.90.2 graphql sharp lucide-react cross-env
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss@4 @tailwindcss/postcss eslint eslint-config-next@16.3.8 embedded-postgres tsx vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright
```

Expected : installation sans erreur `ERESOLVE`. Si npm signale un conflit de peer dependency entre Payload et Next, garder `next@16.3.8`, qui satisfait `>=16.3.3 <17.0.0`.

- [ ] **Step 5 : fichiers de configuration**

`tsconfig.json` : partir de celui du template et vérifier que ces clés sont présentes :

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@payload-config": ["./src/payload.config.ts"]
    }
  }
}
```

`next.config.mjs` :

```js
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { formats: ['image/avif', 'image/webp'] },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
```

`postcss.config.mjs` :

```js
export default { plugins: { '@tailwindcss/postcss': {} } }
```

`eslint.config.mjs` :

```js
import nextVitals from 'eslint-config-next/core-web-vitals'

export default [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      '.banani-export/**',
      'src/app/(payload)/**',
      'src/migrations/**',
      'src/payload-types.ts',
      'playwright-report/**',
      'test-results/**',
    ],
  },
]
```

`.env.example` (versionné), copié tel quel en `.env` (non versionné) :

```
DATABASE_URI=postgres://postgres:postgres@127.0.0.1:5433/terredavenir
PAYLOAD_SECRET=remplacer-par-une-chaine-aleatoire-de-32-caracteres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SEED_ADMIN_EMAIL=admin@terredavenir.local
SEED_ADMIN_PASSWORD=changer-ce-mot-de-passe
```

Dans `.env`, remplacer `PAYLOAD_SECRET` par une valeur générée avec `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`.

Ajouter à `.gitignore` :

```
.next/
.data/
media/
.env
next-env.d.ts
*.tsbuildinfo
playwright-report/
test-results/
```

- [ ] **Step 6 : PostgreSQL embarqué**

`scripts/lib/embedded-db.ts` :

```ts
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import path from 'node:path'

export const DB_PORT = 5433
export const DB_NAME = 'terredavenir'
const DATA_DIR = path.resolve('.data/postgres')

export async function startDatabase(): Promise<EmbeddedPostgres> {
  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: 'postgres',
    password: 'postgres',
    port: DB_PORT,
    persistent: true,
    onLog: () => {},
  })
  if (!existsSync(path.join(DATA_DIR, 'PG_VERSION'))) {
    await pg.initialise()
  }
  await pg.start()
  try {
    await pg.createDatabase(DB_NAME)
  } catch {
    // La base existe déjà : rien à faire.
  }
  return pg
}
```

`scripts/db.ts` :

```ts
import { DB_PORT, startDatabase } from './lib/embedded-db'

const pg = await startDatabase()
console.log(`PostgreSQL embarqué prêt sur le port ${DB_PORT} (Ctrl+C pour arrêter)`)

const stop = async () => {
  await pg.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
```

Run (en arrière-plan, il reste allumé) : `npm run db`
Expected : `PostgreSQL embarqué prêt sur le port 5433`. Le premier lancement télécharge et initialise PostgreSQL (~1 min).

- [ ] **Step 7 : configuration Payload minimale**

`src/collections/Users.ts` :

```ts
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  typescript: { interface: 'User' },
  admin: { useAsTitle: 'email' },
  auth: true,
  fields: [],
}
```

`src/payload.config.ts` :

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { DEFAULT_LOCALE, LOCALES, NATIVE_NAMES } from './lib/i18n/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users],
  globals: [],
  localization: {
    locales: LOCALES.map((code) => ({ code, label: NATIVE_NAMES[code] })),
    defaultLocale: DEFAULT_LOCALE,
    fallback: false,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
})
```

Ce fichier importe `src/lib/i18n/config.ts`, qui sera testé à la tâche 2. Le créer dès maintenant avec le contenu exact de la tâche 2, Step 3 (`config.ts`).

- [ ] **Step 8 : site provisoire**

`src/app/(site)/globals.css` :

```css
@import 'tailwindcss';
```

`src/app/(site)/[locale]/layout.tsx` :

```tsx
import '../globals.css'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}
```

`src/app/(site)/[locale]/page.tsx` :

```tsx
export default function Home() {
  return <main>Terre d’Avenir KOMO-KANGO</main>
}
```

- [ ] **Step 9 : première migration, types et carte d'imports**

```powershell
npm run migrate:create -- init
npm run migrate
npm run generate:types
npm run generate:importmap
```

Expected :
- un fichier `src/migrations/<horodatage>_init.ts` et un `src/migrations/index.ts` ;
- `migrate` affiche `Done` ;
- `src/payload-types.ts` contient `export interface User`.

- [ ] **Step 10 : vérifier dev et build**

Run : `npm run dev`, puis ouvrir `http://localhost:3000/admin` et `http://localhost:3000/fr`.
Expected : l'admin affiche l'écran « Create first user » ; `/fr` affiche « Terre d’Avenir KOMO-KANGO ». Arrêter le serveur.

Run : `npm run build`
Expected : `✓ Compiled successfully`, sans erreur TypeScript.

- [ ] **Step 11 : commit**

```powershell
git add -A
git commit -m "chore: socle Next.js 16 + Payload 3 + PostgreSQL embarqué" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2 : Langues, routes, textes et proxy (TDD)

**Files :**
- Create : `vitest.config.ts`, `vitest.setup.ts`
- Create : `src/lib/i18n/config.ts`, `src/lib/i18n/paths.ts`, `src/lib/i18n/routing.ts`
- Create : `src/lib/i18n/dictionaries/fr.ts`, `src/lib/i18n/dictionaries/en.ts`, `src/lib/i18n/dictionaries/index.ts`
- Create : `src/lib/routes.ts`, `src/lib/text.ts`, `src/proxy.ts`
- Test : `tests/unit/i18n-config.test.ts`, `tests/unit/i18n-paths.test.ts`, `tests/unit/i18n-routing.test.ts`, `tests/unit/text.test.ts`, `tests/unit/dictionaries.test.ts`, `tests/unit/routes.test.ts`

**Interfaces :**
- Produces (`config.ts`) :
  - `LOCALES: readonly ['fr','en']`, `type Locale`, `DEFAULT_LOCALE: Locale` ;
  - `PLANNED_LOCALES`, `NATIVE_NAMES: Record<string,string>` ;
  - `isLocale(v: string): v is Locale`, `isPlannedLocale(v: string): boolean`, `localeDir(l: string): 'ltr'|'rtl'`.
- Produces (`paths.ts`) :
  - `isExternal(href: string): boolean`, `localizedHref(locale: Locale, href: string): string` ;
  - `stripLocale(pathname: string): string`, `switchLocale(pathname: string, target: Locale): string` ;
  - `alternates(path: string): Record<string,string>`, `isActivePath(current: string, href: string): boolean`.
- Produces (`routing.ts`) : `decideRoute(pathname: string): RouteDecision`.
- Produces (`dictionaries`) : `type Dictionary`, `getDictionary(locale: Locale): Dictionary`.
- Produces (`routes.ts`) :
  - `STATIC_PATHS` ;
  - `NAV_ITEMS: { key: NavKey; href: string }[]`, `FOOTER_PRIMARY`, `FOOTER_UTILITY` ;
  - `type NavKey`, `pageSlugForPath(path: string): string`.
- Produces (`text.ts`) : `isPlaceholder(v?: string|null): boolean`, `paragraphs(v?: string|null): string[]`, `emphasisParts(v: string): {text: string; em: boolean}[]`, `stripEmphasis(v: string): string`.

- [ ] **Step 1 : configuration de Vitest**

`vitest.config.ts` :

```ts
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
})
```

`vitest.setup.ts` :

```ts
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Les collections Payload importent next/cache (hooks de revalidation) : inutile hors de Next.js.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
```

- [ ] **Step 2 : écrire les tests (ils doivent échouer)**

`tests/unit/i18n-config.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, LOCALES, isLocale, isPlannedLocale, localeDir } from '@/lib/i18n/config'

describe('configuration des langues', () => {
  it('active fr et en, fr par défaut', () => {
    expect(LOCALES).toEqual(['fr', 'en'])
    expect(DEFAULT_LOCALE).toBe('fr')
  })
  it('reconnaît uniquement les langues actives', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('es')).toBe(false)
    expect(isLocale('contact')).toBe(false)
  })
  it('reconnaît les langues prévues mais inactives', () => {
    expect(isPlannedLocale('es')).toBe(true)
    expect(isPlannedLocale('zh-Hans')).toBe(true)
    expect(isPlannedLocale('fr')).toBe(false)
  })
  it('donne le sens d’écriture', () => {
    expect(localeDir('ar')).toBe('rtl')
    expect(localeDir('fr')).toBe('ltr')
  })
})
```

`tests/unit/i18n-paths.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { alternates, isActivePath, isExternal, localizedHref, stripLocale, switchLocale } from '@/lib/i18n/paths'

describe('chemins localisés', () => {
  it('préfixe les chemins internes', () => {
    expect(localizedHref('fr', '/')).toBe('/fr')
    expect(localizedHref('en', '/contact#partenariat')).toBe('/en/contact#partenariat')
    expect(localizedHref('fr', '/actualites/un-jeune-un-permis')).toBe('/fr/actualites/un-jeune-un-permis')
  })
  it('laisse intacts les liens externes et les ancres', () => {
    expect(localizedHref('fr', 'https://www.facebook.com/x')).toBe('https://www.facebook.com/x')
    expect(localizedHref('fr', 'mailto:a@b.c')).toBe('mailto:a@b.c')
    expect(localizedHref('fr', '#partenariat')).toBe('#partenariat')
    expect(isExternal('https://gabonofficiel.com')).toBe(true)
    expect(isExternal('/contact')).toBe(false)
  })
  it('retire la langue d’un chemin', () => {
    expect(stripLocale('/en/contact')).toBe('/contact')
    expect(stripLocale('/fr')).toBe('/')
    expect(stripLocale('/fr/')).toBe('/')
  })
  it('change de langue en gardant la page', () => {
    expect(switchLocale('/fr/actualites/un-jeune-un-permis', 'en')).toBe('/en/actualites/un-jeune-un-permis')
    expect(switchLocale('/fr', 'en')).toBe('/en')
    expect(switchLocale('/en/contact', 'fr')).toBe('/fr/contact')
  })
  it('construit les alternates hreflang', () => {
    expect(alternates('/contact')).toEqual({ fr: '/fr/contact', en: '/en/contact', 'x-default': '/fr/contact' })
    expect(alternates('/')).toEqual({ fr: '/fr', en: '/en', 'x-default': '/fr' })
  })
  it('détecte la rubrique active', () => {
    expect(isActivePath('/actualites/un-jeune-un-permis', '/actualites')).toBe(true)
    expect(isActivePath('/actualites', '/actualites')).toBe(true)
    expect(isActivePath('/ong', '/organisation')).toBe(false)
    expect(isActivePath('/', '/ong')).toBe(false)
  })
})
```

`tests/unit/i18n-routing.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { decideRoute } from '@/lib/i18n/routing'

describe('decideRoute', () => {
  it('redirige la racine vers la langue par défaut', () => {
    expect(decideRoute('/')).toEqual({ action: 'redirect', location: '/fr' })
  })
  it('laisse passer les langues actives', () => {
    expect(decideRoute('/fr')).toEqual({ action: 'next' })
    expect(decideRoute('/en/contact')).toEqual({ action: 'next' })
  })
  it('préfixe les anciens chemins sans langue', () => {
    expect(decideRoute('/contact')).toEqual({ action: 'redirect', location: '/fr/contact' })
    expect(decideRoute('/ong')).toEqual({ action: 'redirect', location: '/fr/ong' })
  })
  it('réécrit une langue prévue vers la page « langue indisponible »', () => {
    expect(decideRoute('/es/contact')).toEqual({ action: 'rewrite', location: '/fr/langue-indisponible?lang=es' })
    expect(decideRoute('/zh-Hans')).toEqual({ action: 'rewrite', location: '/fr/langue-indisponible?lang=zh-Hans' })
  })
  it('ignore l’admin, l’API, les assets et les fichiers', () => {
    for (const p of ['/admin', '/admin/collections/pages', '/api/pages', '/_next/static/a.js', '/favicon.ico', '/sitemap.xml', '/robots.txt', '/brand/logo-couleur.png']) {
      expect(decideRoute(p)).toEqual({ action: 'next' })
    }
  })
})
```

`tests/unit/text.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { emphasisParts, isPlaceholder, paragraphs, stripEmphasis } from '@/lib/text'

describe('textes', () => {
  it('repère les brouillons et les vides', () => {
    expect(isPlaceholder('[NOM DE LA PRÉSIDENTE À CONFIRMER]')).toBe(true)
    expect(isPlaceholder('Signature : [NOM]')).toBe(true)
    expect(isPlaceholder('   ')).toBe(true)
    expect(isPlaceholder(null)).toBe(true)
    expect(isPlaceholder('Komo-Kango, Gabon')).toBe(false)
  })
  it('découpe en paragraphes et masque les brouillons', () => {
    expect(paragraphs('Un.\n\nDeux.\n  \nTrois [À CONFIRMER].')).toEqual(['Un.', 'Deux.'])
    expect(paragraphs('Ligne 1,\nLigne 2,\n\nSuite.')).toEqual(['Ligne 1,\nLigne 2,', 'Suite.'])
    expect(paragraphs(undefined)).toEqual([])
  })
  it('gère l’emphase *…*', () => {
    expect(emphasisParts('Du Komo-Kango au monde, *faisons grandir* la solidarité.')).toEqual([
      { text: 'Du Komo-Kango au monde, ', em: false },
      { text: 'faisons grandir', em: true },
      { text: ' la solidarité.', em: false },
    ])
    expect(stripEmphasis('A *b* c')).toBe('A b c')
  })
})
```

`tests/unit/dictionaries.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { getDictionary } from '@/lib/i18n/dictionaries'

function leaves(obj: unknown, prefix = ''): [string, unknown][] {
  if (Array.isArray(obj)) return obj.flatMap((v, i) => leaves(v, `${prefix}[${i}]`))
  if (obj && typeof obj === 'object') return Object.entries(obj).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k))
  return [[prefix, obj]]
}

describe('dictionnaires', () => {
  it('fr et en ont exactement les mêmes clés', () => {
    expect(leaves(getDictionary('en')).map(([k]) => k)).toEqual(leaves(getDictionary('fr')).map(([k]) => k))
  })
  it('aucun libellé vide', () => {
    for (const locale of ['fr', 'en'] as const) {
      for (const [key, value] of leaves(getDictionary(locale))) {
        expect(typeof value === 'string' && value.trim().length > 0, `${locale}:${key}`).toBe(true)
      }
    }
  })
})
```

`tests/unit/routes.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { NAV_ITEMS, STATIC_PATHS, pageSlugForPath } from '@/lib/routes'

describe('routes', () => {
  it('associe chaque chemin à un slug de page', () => {
    expect(pageSlugForPath('/')).toBe('accueil')
    expect(pageSlugForPath('/mot-de-la-presidente')).toBe('mot-de-la-presidente')
    expect(STATIC_PATHS).toHaveLength(13)
  })
  it('le menu suit la maquette Banani', () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual(['/ong', '/mot-de-la-presidente', '/organisation', '/projets', '/actualites', '/mediatheque', '/contact'])
  })
})
```

Run : `npm test`
Expected : FAIL (modules introuvables).

- [ ] **Step 3 : implémenter**

`src/lib/i18n/config.ts` :

```ts
export const LOCALES = ['fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

/** Langues prévues par le PRD mais pas encore publiées. */
export const PLANNED_LOCALES = ['es', 'pt', 'ar', 'zh-Hans'] as const

export const NATIVE_NAMES: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  pt: 'Português',
  ar: 'العربية',
  'zh-Hans': '简体中文',
}

const RTL_LOCALES = new Set(['ar'])

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

export function isPlannedLocale(value: string): boolean {
  return (PLANNED_LOCALES as readonly string[]).includes(value)
}

export function localeDir(locale: string): 'ltr' | 'rtl' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
}
```

`src/lib/i18n/paths.ts` :

```ts
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './config'

export function isExternal(href: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(href)
}

export function localizedHref(locale: Locale, href: string): string {
  if (isExternal(href) || href.startsWith('#')) return href
  if (href === '/' || href === '') return `/${locale}`
  return `/${locale}${href.startsWith('/') ? href : `/${href}`}`
}

export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split('/')
  if (!isLocale(first ?? '')) return pathname || '/'
  const path = `/${rest.join('/')}`.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

export function switchLocale(pathname: string, target: Locale): string {
  return localizedHref(target, stripLocale(pathname))
}

export function alternates(path: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const locale of LOCALES) result[locale] = localizedHref(locale, path)
  result['x-default'] = localizedHref(DEFAULT_LOCALE, path)
  return result
}

export function isActivePath(current: string, href: string): boolean {
  if (href === '/') return current === '/'
  return current === href || current.startsWith(`${href}/`)
}
```

`src/lib/i18n/routing.ts` :

```ts
import { DEFAULT_LOCALE, isLocale, isPlannedLocale } from './config'

export type RouteDecision =
  | { action: 'next' }
  | { action: 'redirect'; location: string }
  | { action: 'rewrite'; location: string }

const PASSTHROUGH = /^\/(admin|api|_next)(\/|$)/

export function decideRoute(pathname: string): RouteDecision {
  if (PASSTHROUGH.test(pathname) || /\.[a-z0-9]+$/i.test(pathname)) return { action: 'next' }
  if (pathname === '/') return { action: 'redirect', location: `/${DEFAULT_LOCALE}` }
  const first = pathname.split('/')[1] ?? ''
  if (isLocale(first)) return { action: 'next' }
  if (isPlannedLocale(first)) {
    return { action: 'rewrite', location: `/${DEFAULT_LOCALE}/langue-indisponible?lang=${first}` }
  }
  return { action: 'redirect', location: `/${DEFAULT_LOCALE}${pathname}` }
}
```

`src/proxy.ts` (Next.js 16 : l'ancien `middleware.ts` s'appelle désormais `proxy.ts`) :

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { decideRoute } from './lib/i18n/routing'

export function proxy(request: NextRequest) {
  const decision = decideRoute(request.nextUrl.pathname)
  if (decision.action === 'redirect') {
    return NextResponse.redirect(new URL(decision.location + request.nextUrl.search, request.url))
  }
  if (decision.action === 'rewrite') {
    return NextResponse.rewrite(new URL(decision.location, request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}
```

`src/lib/text.ts` :

```ts
const BRACKET = /\[[^\]]+\]/

/** Vide, blanc ou contenant un marqueur de brouillon « [...] » : à ne pas afficher. */
export function isPlaceholder(value?: string | null): boolean {
  return !value || value.trim() === '' || BRACKET.test(value)
}

/** Paragraphes séparés par une ligne vide ; les retours simples sont conservés. */
export function paragraphs(value?: string | null): string[] {
  if (!value) return []
  return value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => !isPlaceholder(p))
}

/** Découpe « texte *mis en avant* texte » en segments. */
export function emphasisParts(value: string): { text: string; em: boolean }[] {
  return value
    .split(/(\*[^*]+\*)/)
    .filter((part) => part !== '')
    .map((part) =>
      part.startsWith('*') && part.endsWith('*') ? { text: part.slice(1, -1), em: true } : { text: part, em: false },
    )
}

export function stripEmphasis(value: string): string {
  return value.replace(/\*([^*]+)\*/g, '$1')
}
```

`src/lib/routes.ts` :

```ts
export const STATIC_PATHS = [
  '/',
  '/ong',
  '/mot-de-la-presidente',
  '/organisation',
  '/projets',
  '/actualites',
  '/adhesion',
  '/mediatheque',
  '/partenariats',
  '/transparence',
  '/contact',
  '/confidentialite',
  '/mentions-legales',
] as const

export type NavKey =
  | 'ong'
  | 'mot'
  | 'organisation'
  | 'projets'
  | 'actualites'
  | 'mediatheque'
  | 'contact'
  | 'adhesion'
  | 'partenariats'
  | 'transparence'
  | 'confidentialite'
  | 'mentions'

export const NAV_ITEMS: { key: NavKey; href: string }[] = [
  { key: 'ong', href: '/ong' },
  { key: 'mot', href: '/mot-de-la-presidente' },
  { key: 'organisation', href: '/organisation' },
  { key: 'projets', href: '/projets' },
  { key: 'actualites', href: '/actualites' },
  { key: 'mediatheque', href: '/mediatheque' },
  { key: 'contact', href: '/contact' },
]

export const FOOTER_PRIMARY: { key: NavKey; href: string }[] = NAV_ITEMS.filter((i) => i.key !== 'contact')

export const FOOTER_UTILITY: { key: NavKey; href: string }[] = [
  { key: 'adhesion', href: '/adhesion' },
  { key: 'partenariats', href: '/partenariats' },
  { key: 'transparence', href: '/transparence' },
  { key: 'contact', href: '/contact' },
  { key: 'confidentialite', href: '/confidentialite' },
  { key: 'mentions', href: '/mentions-legales' },
]

export function pageSlugForPath(path: string): string {
  return path === '/' ? 'accueil' : path.replace(/^\//, '')
}
```

`src/lib/i18n/dictionaries/fr.ts` :

```ts
export const fr = {
  skipToContent: 'Aller au contenu',
  nav: {
    ong: 'L’ONG',
    mot: 'Le mot de la présidente',
    organisation: 'Organisation',
    projets: 'Projets & actions',
    actualites: 'Actualités',
    mediatheque: 'Médiathèque',
    contact: 'Contact',
    adhesion: 'Adhésion',
    partenariats: 'Partenariats',
    transparence: 'Transparence',
    confidentialite: 'Informations sur vos données personnelles',
    mentions: 'Mentions légales',
  },
  header: {
    home: 'Terre d’Avenir KOMO-KANGO — Accueil',
    mainNav: 'Navigation principale',
    mobileNav: 'Navigation mobile',
    language: 'Langue',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    join: 'Adhérer',
    joinLong: 'Faire une demande d’adhésion',
  },
  footer: {
    navigation: 'Navigation',
    useful: 'Liens utiles',
    contact: 'Contact',
    follow: 'Suivez-nous',
    facebook: 'Facebook',
    copyright: '© 2026 Terre d’Avenir KOMO-KANGO',
  },
  common: {
    readArticle: 'Lire l’article',
    learnMore: 'En savoir plus',
    seeOnFacebook: 'Voir sur Facebook',
    newTab: '(s’ouvre dans un nouvel onglet)',
    category: 'Catégorie',
    date: 'Date',
    source: 'Source',
    share: 'Partager :',
    copyLink: 'Copier le lien',
    linkCopied: 'Lien copié',
    otherNews: 'Autres actualités',
    otherProjects: 'Autres initiatives',
    backToList: 'Retour à la liste',
    error: 'Une erreur est survenue. Réessayez dans un instant.',
    retry: 'Réessayer',
  },
  notFound: {
    title: 'Page introuvable',
    text: 'Cette page n’est pas disponible. Vous pouvez revenir à l’accueil ou consulter nos actions.',
    home: 'Retour à l’accueil',
    actions: 'Voir nos actions',
  },
  languageUnavailable: {
    title: 'Version non publiée',
    text: 'Cette version linguistique n’est pas encore publiée. Les autres versions disponibles sont proposées ci-dessous.',
  },
  gallery: {
    open: 'Agrandir l’image',
    dialog: 'Visionneuse d’images',
    close: 'Fermer',
    previous: 'Image précédente',
    next: 'Image suivante',
  },
  adhesionForm: {
    lastName: 'Nom *',
    firstNames: 'Prénom(s) *',
    phone: 'Téléphone avec indicatif international *',
    email: 'Adresse e-mail (facultatif)',
    country: 'Pays de résidence (facultatif)',
    city: 'Ville (facultatif)',
    interests: 'Vos centres d’intérêt (facultatif)',
    motivation: 'Votre motivation (facultatif)',
    helpPhone: 'Indiquez un numéro auquel l’ONG peut vous joindre.',
    helpEmail: 'Si vous renseignez votre e-mail, il pourra être utilisé pour le suivi de votre demande.',
    helpInterests: 'Vous pouvez sélectionner plusieurs thèmes.',
    helpMotivation: '1 000 caractères maximum. Ne transmettez pas de document d’identité ou d’information sensible dans ce champ.',
    interestOptions: ['Jeunesse', 'Santé et sensibilisation', 'Sport', 'Solidarité et vie locale', 'Autre contribution'],
    notice: 'J’ai pris connaissance des informations relatives au traitement de ma demande d’adhésion.',
    noticeLink: 'Informations sur vos données personnelles',
    submit: 'Envoyer ma demande',
  },
  contactForm: {
    lastName: 'Nom',
    firstName: 'Prénom',
    email: 'Adresse e-mail',
    phone: 'Téléphone',
    organisation: 'Organisation (si applicable)',
    message: 'Votre message',
    submit: 'Envoyer le message',
  },
}
```

`src/lib/i18n/dictionaries/en.ts` :

```ts
import type { Dictionary } from './index'

export const en: Dictionary = {
  skipToContent: 'Skip to content',
  nav: {
    ong: 'About the NGO',
    mot: 'A message from the President',
    organisation: 'Organization',
    projets: 'Projects & activities',
    actualites: 'News',
    mediatheque: 'Media library',
    contact: 'Contact',
    adhesion: 'Membership',
    partenariats: 'Partnerships',
    transparence: 'Transparency',
    confidentialite: 'Personal data information',
    mentions: 'Legal notice',
  },
  header: {
    home: 'Terre d’Avenir KOMO-KANGO — Home',
    mainNav: 'Main navigation',
    mobileNav: 'Mobile navigation',
    language: 'Language',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    join: 'Join us',
    joinLong: 'Apply for membership',
  },
  footer: {
    navigation: 'Navigation',
    useful: 'Useful links',
    contact: 'Contact',
    follow: 'Follow us',
    facebook: 'Facebook',
    copyright: '© 2026 Terre d’Avenir KOMO-KANGO',
  },
  common: {
    readArticle: 'Read the article',
    learnMore: 'Learn more',
    seeOnFacebook: 'See on Facebook',
    newTab: '(opens in a new tab)',
    category: 'Category',
    date: 'Date',
    source: 'Source',
    share: 'Share:',
    copyLink: 'Copy link',
    linkCopied: 'Link copied',
    otherNews: 'More news',
    otherProjects: 'Other initiatives',
    backToList: 'Back to the list',
    error: 'Something went wrong. Please try again in a moment.',
    retry: 'Try again',
  },
  notFound: {
    title: 'Page not found',
    text: 'This page is not available. You can return to the home page or browse our activities.',
    home: 'Back to home',
    actions: 'See our activities',
  },
  languageUnavailable: {
    title: 'Version not published',
    text: 'This language version has not been published yet. The available versions are listed below.',
  },
  gallery: {
    open: 'Enlarge image',
    dialog: 'Image viewer',
    close: 'Close',
    previous: 'Previous image',
    next: 'Next image',
  },
  adhesionForm: {
    lastName: 'Last name *',
    firstNames: 'First name(s) *',
    phone: 'Phone number with international code *',
    email: 'Email address (optional)',
    country: 'Country of residence (optional)',
    city: 'City (optional)',
    interests: 'Your areas of interest (optional)',
    motivation: 'Your motivation (optional)',
    helpPhone: 'Give a number at which the NGO can reach you.',
    helpEmail: 'If you provide your email, it may be used to follow up on your application.',
    helpInterests: 'You can select several themes.',
    helpMotivation: '1,000 characters maximum. Do not share identity documents or sensitive information in this field.',
    interestOptions: ['Youth', 'Health and awareness', 'Sport', 'Solidarity and local life', 'Other contribution'],
    notice: 'I have read the information on how my membership application will be processed.',
    noticeLink: 'Personal data information',
    submit: 'Submit my application',
  },
  contactForm: {
    lastName: 'Last name',
    firstName: 'First name',
    email: 'Email address',
    phone: 'Phone',
    organisation: 'Organization (if applicable)',
    message: 'Your message',
    submit: 'Send message',
  },
}
```

`src/lib/i18n/dictionaries/index.ts` :

```ts
import type { Locale } from '../config'
import { fr } from './fr'
import { en } from './en'

export type Dictionary = typeof fr

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}
```

- [ ] **Step 4 : lancer les tests**

Run : `npm test`
Expected : PASS (6 fichiers, tous verts).

- [ ] **Step 5 : vérifier le proxy en conditions réelles**

Run : `npm run dev`, puis `curl.exe -sI http://localhost:3000/` et `curl.exe -sI http://localhost:3000/contact`.
Expected :
- `HTTP/1.1 307` avec `location: /fr` ;
- puis `307` avec `location: /fr/contact`.

Si Next.js 16.3.8 signale que la convention attendue est `middleware.ts`, renommer le fichier en `src/middleware.ts` et la fonction en `middleware`, puis relancer.

- [ ] **Step 6 : commit**

```powershell
git add -A
git commit -m "feat: langues fr/en, routes, dictionnaires et proxy" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3 : Modèle de contenu Payload et accès aux données

**Files :**
- Create : `src/collections/Pages.ts`, `src/collections/Actualites.ts`, `src/collections/Projets.ts`, `src/collections/Medias.ts`
- Create : `src/globals/Reglages.ts`, `src/hooks/revalidate.ts`
- Create : `src/lib/sections.ts`, `src/lib/content.ts`
- Modify : `src/payload.config.ts`
- Generated : `src/migrations/<horodatage>_contenus.ts`, `src/payload-types.ts`
- Test : `tests/unit/sections.test.ts`

**Interfaces :**
- Consumes : `LOCALES`, `Locale` (tâche 2), `STATIC_PATHS` et `pageSlugForPath` (tâche 2).
- Produces :
  - les types générés `Page`, `Actualite`, `Projet`, `Media`, `Reglage` (depuis `@/payload-types`) ;
  - `PAGE_SLUGS`, `type PageSlug`, `PROJET_ICONS` ;
  - `type Section`, `getSection(page, key): Section | undefined` ;
  - `getPage(slug: PageSlug, locale: Locale): Promise<Page | null>` ;
  - `getActualites(locale): Promise<Actualite[]>`, `getActualite(slug, locale): Promise<Actualite | null>` ;
  - `getProjets(locale): Promise<Projet[]>`, `getProjet(slug, locale): Promise<Projet | null>` ;
  - `getGalleryMedia(locale): Promise<Media[]>`, `getReglages(locale): Promise<Reglage>`.

- [ ] **Step 1 : test de `getSection` et de la couverture des slugs (doit échouer)**

`tests/unit/sections.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { getSection } from '@/lib/sections'
import { PAGE_SLUGS } from '@/collections/Pages'
import { STATIC_PATHS, pageSlugForPath } from '@/lib/routes'

describe('sections', () => {
  const page = { sections: [{ key: 'hero', heading: 'A' }, { key: 'mot', heading: 'B' }] }
  it('trouve une section par clé', () => {
    expect(getSection(page as never, 'mot')?.heading).toBe('B')
    expect(getSection(page as never, 'absent')).toBeUndefined()
    expect(getSection(null, 'mot')).toBeUndefined()
  })
  it('chaque route statique a une page Payload', () => {
    for (const path of STATIC_PATHS) expect(PAGE_SLUGS).toContain(pageSlugForPath(path))
  })
})
```

Run : `npm test -- sections`
Expected : FAIL (module `@/lib/sections` introuvable).

- [ ] **Step 2 : hook de revalidation**

`src/hooks/revalidate.ts` :

```ts
import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

function revalidateSite(context: Record<string, unknown> | undefined) {
  if (context?.disableRevalidate) return
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Hors du contexte Next.js (seed, CLI) : rien à revalider.
  }
}

export const revalidateCollection: CollectionAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req.context)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req.context)
  return doc
}
```

- [ ] **Step 3 : collections et global**

`src/collections/Pages.ts` :

```ts
import type { CollectionConfig } from 'payload'
import { revalidateCollection } from '../hooks/revalidate'

export const PAGE_SLUGS = [
  'accueil',
  'ong',
  'mot-de-la-presidente',
  'organisation',
  'projets',
  'actualites',
  'adhesion',
  'mediatheque',
  'partenariats',
  'transparence',
  'contact',
  'confidentialite',
  'mentions-legales',
] as const
export type PageSlug = (typeof PAGE_SLUGS)[number]

const EMPTY_HINT = 'Laisser vide tant que le texte n’est pas validé : un champ vide est masqué sur le site.'

export const Pages: CollectionConfig = {
  slug: 'pages',
  typescript: { interface: 'Page' },
  labels: { singular: 'Page', plural: 'Pages' },
  admin: { useAsTitle: 'slug', defaultColumns: ['slug', 'h1', 'updatedAt'] },
  access: { read: () => true },
  hooks: { afterChange: [revalidateCollection] },
  fields: [
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: PAGE_SLUGS.map((value) => ({ label: value, value })),
    },
    { name: 'seoTitle', label: 'Titre SEO', type: 'text', localized: true },
    { name: 'metaDescription', label: 'Méta-description', type: 'textarea', localized: true },
    {
      name: 'h1',
      label: 'Titre principal (H1)',
      type: 'text',
      localized: true,
      admin: { description: 'Entourer un passage de *astérisques* pour le mettre en doré.' },
    },
    { name: 'intro', label: 'Introduction', type: 'textarea', localized: true, admin: { description: EMPTY_HINT } },
    {
      name: 'sections',
      type: 'array',
      localized: true,
      admin: { initCollapsed: true },
      fields: [
        { name: 'key', label: 'Clé technique', type: 'text', required: true, admin: { description: 'Ne pas modifier : utilisée par la mise en page.' } },
        { name: 'eyebrow', label: 'Surtitre', type: 'text' },
        { name: 'heading', label: 'Titre', type: 'text' },
        { name: 'body', label: 'Texte', type: 'textarea', admin: { description: `Paragraphes séparés par une ligne vide. ${EMPTY_HINT}` } },
        {
          name: 'items',
          label: 'Éléments',
          type: 'array',
          fields: [
            { name: 'title', label: 'Titre', type: 'text' },
            { name: 'text', label: 'Texte', type: 'textarea' },
          ],
        },
        {
          name: 'ctas',
          label: 'Boutons',
          type: 'array',
          fields: [
            { name: 'label', label: 'Libellé', type: 'text', required: true },
            { name: 'href', label: 'Lien', type: 'text', required: true, admin: { description: 'Chemin interne sans langue (ex. /adhesion) ou URL complète.' } },
          ],
        },
      ],
    },
  ],
}
```

`src/collections/Medias.ts` :

```ts
import type { CollectionConfig } from 'payload'
import { revalidateCollection } from '../hooks/revalidate'

export const Medias: CollectionConfig = {
  slug: 'medias',
  typescript: { interface: 'Media' },
  labels: { singular: 'Média', plural: 'Médias' },
  admin: { useAsTitle: 'filename', defaultColumns: ['filename', 'galerie', 'provisoire'] },
  access: { read: () => true },
  hooks: { afterChange: [revalidateCollection] },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'card', width: 800 },
      { name: 'hero', width: 1920 },
    ],
  },
  fields: [
    { name: 'alt', label: 'Texte alternatif', type: 'text', localized: true, admin: { description: 'Décrit l’image. Laisser vide si elle est décorative.' } },
    { name: 'caption', label: 'Légende', type: 'text', localized: true },
    { name: 'credit', label: 'Crédit', type: 'text' },
    { name: 'galerie', label: 'Afficher dans la médiathèque', type: 'checkbox', defaultValue: false },
    { name: 'provisoire', label: 'Image provisoire (à remplacer)', type: 'checkbox', defaultValue: false, admin: { description: 'Une image provisoire est toujours affichée comme décorative.' } },
  ],
}
```

`src/collections/Actualites.ts` :

```ts
import type { CollectionConfig } from 'payload'
import { revalidateCollection } from '../hooks/revalidate'

export const Actualites: CollectionConfig = {
  slug: 'actualites',
  typescript: { interface: 'Actualite' },
  labels: { singular: 'Actualité', plural: 'Actualités' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'dateLabel', 'publie', 'order'] },
  access: { read: () => true },
  hooks: { afterChange: [revalidateCollection] },
  defaultSort: 'order',
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'order', label: 'Ordre', type: 'number', required: true, defaultValue: 0 },
    { name: 'publie', label: 'Publiée', type: 'checkbox', defaultValue: true },
    { name: 'category', label: 'Catégorie', type: 'text', localized: true },
    { name: 'dateLabel', label: 'Date affichée', type: 'text', localized: true, admin: { description: 'Ex. « 8 août 2026 » ou « Initiative publiée ».' } },
    { name: 'date', label: 'Date (tri, facultatif)', type: 'date' },
    { name: 'excerpt', label: 'Résumé', type: 'textarea', localized: true },
    { name: 'body', label: 'Texte', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'medias' },
    {
      name: 'source',
      type: 'group',
      fields: [
        { name: 'label', label: 'Libellé du lien', type: 'text', localized: true },
        { name: 'url', label: 'URL', type: 'text' },
      ],
    },
  ],
}
```

`src/collections/Projets.ts` :

```ts
import type { CollectionConfig } from 'payload'
import { revalidateCollection } from '../hooks/revalidate'

export const PROJET_ICONS = ['graduation-cap', 'heart-pulse', 'trophy', 'handshake'] as const

export const Projets: CollectionConfig = {
  slug: 'projets',
  typescript: { interface: 'Projet' },
  labels: { singular: 'Projet', plural: 'Projets & actions' },
  admin: { useAsTitle: 'theme', defaultColumns: ['theme', 'title', 'order'] },
  access: { read: () => true },
  hooks: { afterChange: [revalidateCollection] },
  defaultSort: 'order',
  fields: [
    { name: 'theme', label: 'Thème', type: 'text', required: true, localized: true },
    { name: 'title', label: 'Titre', type: 'text', localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'order', label: 'Ordre', type: 'number', required: true, defaultValue: 0 },
    { name: 'icon', label: 'Icône', type: 'select', options: PROJET_ICONS.map((value) => ({ label: value, value })) },
    { name: 'summary', label: 'Résumé (accueil)', type: 'textarea', localized: true },
    { name: 'body', label: 'Texte', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'medias' },
    {
      name: 'source',
      type: 'group',
      fields: [
        { name: 'label', label: 'Libellé du lien', type: 'text', localized: true },
        { name: 'url', label: 'URL', type: 'text' },
      ],
    },
  ],
}
```

`src/globals/Reglages.ts` :

```ts
import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidate'

export const Reglages: GlobalConfig = {
  slug: 'reglages',
  typescript: { interface: 'Reglage' },
  label: 'Réglages du site',
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'facebookUrl', label: 'Page Facebook', type: 'text', required: true },
    { name: 'location', label: 'Localisation affichée', type: 'text', localized: true },
    { name: 'footerTagline', label: 'Texte du pied de page', type: 'textarea', localized: true },
    { name: 'heroImages', label: 'Images du diaporama d’accueil', type: 'upload', relationTo: 'medias', hasMany: true },
  ],
}
```

Dans `src/payload.config.ts`, importer et déclarer les nouvelles collections et le global :

```ts
import { Actualites } from './collections/Actualites'
import { Medias } from './collections/Medias'
import { Pages } from './collections/Pages'
import { Projets } from './collections/Projets'
import { Reglages } from './globals/Reglages'
// …
  collections: [Pages, Actualites, Projets, Medias, Users],
  globals: [Reglages],
```

- [ ] **Step 4 : accès aux données**

`src/lib/sections.ts` :

```ts
import type { Page } from '@/payload-types'

export type Section = NonNullable<Page['sections']>[number]

export function getSection(page: Pick<Page, 'sections'> | null | undefined, key: string): Section | undefined {
  return page?.sections?.find((section) => section.key === key)
}
```

`src/lib/content.ts` :

```ts
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Actualite, Media, Page, Projet, Reglage } from '@/payload-types'
import type { PageSlug } from '@/collections/Pages'
import type { Locale } from './i18n/config'

const client = cache(() => getPayload({ config }))

export const getPage = cache(async (slug: PageSlug, locale: Locale): Promise<Page | null> => {
  const payload = await client()
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, locale, limit: 1, depth: 1 })
  return res.docs[0] ?? null
})

export const getActualites = cache(async (locale: Locale): Promise<Actualite[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'actualites', where: { publie: { equals: true } }, sort: 'order', locale, depth: 1, limit: 100 })
  return res.docs
})

export const getActualite = cache(async (slug: string, locale: Locale): Promise<Actualite | null> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'actualites',
    where: { and: [{ slug: { equals: slug } }, { publie: { equals: true } }] },
    locale,
    depth: 1,
    limit: 1,
  })
  return res.docs[0] ?? null
})

export const getProjets = cache(async (locale: Locale): Promise<Projet[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'projets', sort: 'order', locale, depth: 1, limit: 100 })
  return res.docs
})

export const getProjet = cache(async (slug: string, locale: Locale): Promise<Projet | null> => {
  const payload = await client()
  const res = await payload.find({ collection: 'projets', where: { slug: { equals: slug } }, locale, depth: 1, limit: 1 })
  return res.docs[0] ?? null
})

export const getGalleryMedia = cache(async (locale: Locale): Promise<Media[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'medias', where: { galerie: { equals: true } }, sort: 'createdAt', locale, depth: 0, limit: 200 })
  return res.docs
})

export const getReglages = cache(async (locale: Locale): Promise<Reglage> => {
  const payload = await client()
  return payload.findGlobal({ slug: 'reglages', locale, depth: 1 })
})
```

- [ ] **Step 5 : migration et types**

```powershell
npm run migrate:create -- contenus
npm run migrate
npm run generate:types
npm run generate:importmap
```

Expected :
- un nouveau fichier `src/migrations/<horodatage>_contenus.ts` ;
- `src/payload-types.ts` contient les interfaces `Page`, `Actualite`, `Projet`, `Media` et `Reglage`.

- [ ] **Step 6 : tests et build**

Run : `npm test`
Expected : PASS.

Run : `npm run build`
Expected : succès sans erreur TypeScript.

- [ ] **Step 7 : vérification dans l'admin**

Run : `npm run dev`, ouvrir `/admin`, créer un premier utilisateur, puis vérifier que « Pages », « Actualités », « Projets & actions », « Médias » et « Réglages du site » apparaissent, avec le sélecteur de langue Français/English. Arrêter le serveur.

- [ ] **Step 8 : commit**

```powershell
git add -A
git commit -m "feat: modèle de contenu Payload (pages, actualités, projets, médias, réglages)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4 : Contenus FR/EN (Textes v1.3 + traduction)

**Files :**
- Create : `src/seed/data/types.ts`, `src/seed/data/fr.ts`, `src/seed/data/en.ts`
- Test : `tests/unit/seed-data.test.ts`

**Interfaces :**
- Consumes : `PageSlug`, `PAGE_SLUGS`, `PROJET_ICONS` (tâche 3) ; `isPlaceholder`, `stripEmphasis` (tâche 2).
- Produces :
  - les types `SeedImageKey`, `SeedSection`, `SeedPage`, `SeedActualite`, `SeedProjet`, `SeedReglages`, `LocaleContent` ;
  - les constantes `FACEBOOK_URL`, `fr: LocaleContent`, `en: LocaleContent`.

- [ ] **Step 1 : types**

`src/seed/data/types.ts` :

```ts
import type { PageSlug } from '@/collections/Pages'
import type { PROJET_ICONS } from '@/collections/Projets'

export type SeedImageKey = 'banner' | 'forest' | 'youth' | 'education' | 'sport' | 'health' | 'community' | 'solidarity'
export type SeedCta = { label: string; href: string }
export type SeedItem = { title?: string; text?: string }
export type SeedSection = { key: string; eyebrow?: string; heading?: string; body?: string; items?: SeedItem[]; ctas?: SeedCta[] }
export type SeedPage = { slug: PageSlug; seoTitle: string; metaDescription: string; h1: string; intro?: string; sections: SeedSection[] }
export type SeedSource = { label: string; url: string }
export type SeedActualite = {
  slug: string
  order: number
  date?: string
  image?: SeedImageKey
  title: string
  category: string
  dateLabel: string
  excerpt: string
  body?: string
  source: SeedSource
}
export type SeedProjet = {
  slug: string
  order: number
  icon: (typeof PROJET_ICONS)[number]
  image?: SeedImageKey
  theme: string
  title: string
  summary: string
  body: string
  source: SeedSource
}
export type SeedReglages = { location: string; footerTagline: string }
export type LocaleContent = { pages: SeedPage[]; actualites: SeedActualite[]; projets: SeedProjet[]; reglages: SeedReglages }
```

- [ ] **Step 2 : test de cohérence (doit échouer)**

`tests/unit/seed-data.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { PAGE_SLUGS } from '@/collections/Pages'
import { isPlaceholder } from '@/lib/text'
import { en } from '@/seed/data/en'
import { fr } from '@/seed/data/fr'

const allStrings = (value: unknown): string[] =>
  typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(allStrings) : value && typeof value === 'object' ? Object.values(value).flatMap(allStrings) : []

describe('contenus du seed', () => {
  it('une page par slug, dans les deux langues', () => {
    expect(fr.pages.map((p) => p.slug).sort()).toEqual([...PAGE_SLUGS].sort())
    expect(en.pages.map((p) => p.slug)).toEqual(fr.pages.map((p) => p.slug))
  })
  it('même structure de sections, mêmes liens', () => {
    for (const page of fr.pages) {
      const other = en.pages.find((p) => p.slug === page.slug)!
      expect(other.sections.map((s) => s.key), page.slug).toEqual(page.sections.map((s) => s.key))
      page.sections.forEach((section, i) => {
        const o = other.sections[i]
        expect(o.items?.length ?? 0, `${page.slug}.${section.key}.items`).toBe(section.items?.length ?? 0)
        expect(o.ctas?.map((c) => c.href), `${page.slug}.${section.key}.ctas`).toEqual(section.ctas?.map((c) => c.href))
      })
    }
  })
  it('mêmes actualités et projets, champs non traduits identiques', () => {
    const pick = <T extends object>(list: T[], keys: (keyof T)[]) => list.map((x) => keys.map((k) => JSON.stringify(x[k])))
    expect(pick(en.actualites, ['slug', 'order', 'date', 'image'])).toEqual(pick(fr.actualites, ['slug', 'order', 'date', 'image']))
    expect(en.actualites.map((a) => a.source.url)).toEqual(fr.actualites.map((a) => a.source.url))
    expect(pick(en.projets, ['slug', 'order', 'icon', 'image'])).toEqual(pick(fr.projets, ['slug', 'order', 'icon', 'image']))
    expect(en.projets.map((p) => p.source.url)).toEqual(fr.projets.map((p) => p.source.url))
  })
  it('aucun marqueur de brouillon [...] ni chaîne vide', () => {
    for (const s of [...allStrings(fr), ...allStrings(en)]) expect(isPlaceholder(s), s).toBe(false)
  })
  it('3 actualités et 4 projets', () => {
    expect(fr.actualites).toHaveLength(3)
    expect(fr.projets).toHaveLength(4)
  })
})
```

Run : `npm test -- seed-data`
Expected : FAIL (modules `@/seed/data/fr` et `en` introuvables).

- [ ] **Step 3 : saisir les contenus**

Créer `src/seed/data/fr.ts` et `src/seed/data/en.ts` en copiant **à l'identique** les deux blocs de code de l'annexe `docs/superpowers/plans/2026-10-05-lot1-contenus.md`.

- [ ] **Step 4 : lancer les tests**

Run : `npm test`
Expected : PASS.

- [ ] **Step 5 : commit**

```powershell
git add -A
git commit -m "feat: contenus FR (Textes v1.3) et traduction EN pour le seed" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5 : Seed idempotent, images et logos

**Files :**
- Create : `src/seed/images/*.jpg` (8 fichiers), `public/brand/logo-couleur.png`, `public/brand/logo-clair.png`, `public/brand/og.jpg`
- Create : `src/seed/upsert.ts`, `src/seed/index.ts`

**Interfaces :**
- Consumes : `fr`, `en`, `FACEBOOK_URL`, `SeedImageKey` (tâche 4) ; les collections de la tâche 3.
- Produces : `npm run seed`, qui crée ou met à jour 13 pages, 3 actualités, 4 projets, 8 médias, le global `reglages` et un compte admin.

- [ ] **Step 1 : récupérer les images**

```powershell
$imgs = @{
  forest     = 'photo-1511497584788-876760111969'
  youth      = 'photo-1542810634-71277d95dcbb'
  education  = 'photo-1509099836639-18ba1795216d'
  sport      = 'photo-1579952363873-27f3bade9f55'
  health     = 'photo-1576091160399-112ba8d25d1d'
  community  = 'photo-1531206715517-5c0ba140b2b8'
  solidarity = 'photo-1532629345422-7515f3d16bb6'
}
New-Item -ItemType Directory -Force 'src/seed/images', 'public/brand' | Out-Null
foreach ($k in $imgs.Keys) {
  Invoke-WebRequest "https://images.unsplash.com/$($imgs[$k])?auto=format&fit=crop&w=1800&q=80&fm=jpg" -OutFile "src/seed/images/$k.jpg"
}
Copy-Item '..\Source\banner.jpg' 'src/seed/images/banner.jpg'
Copy-Item '..\Source\banner.jpg' 'public/brand/og.jpg'
Copy-Item '..\Source\Logo Terre dAvenir KOMO-KANGO sur fond transparent.png' 'public/brand/logo-couleur.png'
Copy-Item '..\Source\Logo Terre d’Avenir sur fond transparent.png' 'public/brand/logo-clair.png'
Get-ChildItem src/seed/images, public/brand | Select-Object Name, Length
```

Expected : 8 fichiers JPG non vides dans `src/seed/images` et 3 fichiers dans `public/brand`. Les deux logos font 1779×884 et 1774×887. `logo-couleur` sert sur fond clair (en-tête), `logo-clair` sur fond vert (pied de page).

- [ ] **Step 2 : utilitaire d'upsert**

`src/seed/upsert.ts` :

```ts
import type { CollectionSlug, Payload, Where } from 'payload'

export const SEED_CONTEXT = { disableRevalidate: true }

/** Crée ou met à jour un document : données FR, puis données EN sur le même id. */
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
    ? await payload.update({ collection, id: existingId, data: fr as never, locale: 'fr', context: SEED_CONTEXT })
    : await payload.create({ collection, data: fr as never, locale: 'fr', context: SEED_CONTEXT })
  await payload.update({ collection, id: doc.id, data: en as never, locale: 'en', context: SEED_CONTEXT })
  return doc.id
}
```

- [ ] **Step 3 : script de seed**

`src/seed/index.ts` :

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import { en } from './data/en'
import { FACEBOOK_URL, fr } from './data/fr'
import type { SeedImageKey } from './data/types'
import { SEED_CONTEXT, upsertLocalized } from './upsert'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const IMAGES: Record<SeedImageKey, { altFr: string; altEn: string; provisoire: boolean; galerie: boolean; credit: string }> = {
  banner: {
    altFr: 'Bannière de Terre d’Avenir KOMO-KANGO',
    altEn: 'Terre d’Avenir KOMO-KANGO banner',
    provisoire: false,
    galerie: true,
    credit: 'Terre d’Avenir KOMO-KANGO',
  },
  forest: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  youth: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  education: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  sport: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  health: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  community: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  solidarity: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
}

const HERO_ORDER: SeedImageKey[] = ['forest', 'youth', 'community', 'education', 'sport', 'health', 'solidarity', 'banner']

async function seedMedia(payload: Payload): Promise<Record<SeedImageKey, number | string>> {
  const ids = {} as Record<SeedImageKey, number | string>
  for (const [key, meta] of Object.entries(IMAGES) as [SeedImageKey, (typeof IMAGES)[SeedImageKey]][]) {
    const filename = `${key}.jpg`
    const found = await payload.find({ collection: 'medias', where: { filename: { equals: filename } }, limit: 1, depth: 0 })
    const base = { credit: meta.credit, provisoire: meta.provisoire, galerie: meta.galerie }
    const doc =
      found.docs[0] ??
      (await payload.create({
        collection: 'medias',
        data: { ...base, alt: meta.altFr },
        filePath: path.join(dirname, 'images', filename),
        locale: 'fr',
        context: SEED_CONTEXT,
      }))
    await payload.update({ collection: 'medias', id: doc.id, data: { ...base, alt: meta.altFr }, locale: 'fr', context: SEED_CONTEXT })
    await payload.update({ collection: 'medias', id: doc.id, data: { alt: meta.altEn }, locale: 'en', context: SEED_CONTEXT })
    ids[key] = doc.id
  }
  return ids
}

async function seedAdmin(payload: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) {
    console.warn('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD absents : aucun compte admin créé.')
    return
  }
  const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (!found.docs[0]) await payload.create({ collection: 'users', data: { email, password } })
}

async function seed() {
  const payload = await getPayload({ config })
  const media = await seedMedia(payload)

  for (const page of fr.pages) {
    const enPage = en.pages.find((p) => p.slug === page.slug)!
    const { slug, ...frData } = page
    const { slug: _s, ...enData } = enPage
    await upsertLocalized(payload, 'pages', { slug: { equals: slug } }, { slug, ...frData }, enData)
  }

  for (const item of fr.actualites) {
    const enItem = en.actualites.find((a) => a.slug === item.slug)!
    const shared = { slug: item.slug, order: item.order, publie: true, date: item.date ?? null, image: item.image ? media[item.image] : null, source: { url: item.source.url } }
    const local = (a: typeof item) => ({ title: a.title, category: a.category, dateLabel: a.dateLabel, excerpt: a.excerpt, body: a.body ?? '', source: { label: a.source.label, url: a.source.url } })
    await upsertLocalized(payload, 'actualites', { slug: { equals: item.slug } }, { ...shared, ...local(item) }, local(enItem))
  }

  for (const item of fr.projets) {
    const enItem = en.projets.find((p) => p.slug === item.slug)!
    const shared = { slug: item.slug, order: item.order, icon: item.icon, image: item.image ? media[item.image] : null }
    const local = (p: typeof item) => ({ theme: p.theme, title: p.title, summary: p.summary, body: p.body, source: { label: p.source.label, url: p.source.url } })
    await upsertLocalized(payload, 'projets', { slug: { equals: item.slug } }, { ...shared, ...local(item) }, local(enItem))
  }

  const heroImages = HERO_ORDER.map((k) => media[k])
  await payload.updateGlobal({ slug: 'reglages', data: { facebookUrl: FACEBOOK_URL, heroImages, ...fr.reglages }, locale: 'fr', context: SEED_CONTEXT })
  await payload.updateGlobal({ slug: 'reglages', data: { ...en.reglages }, locale: 'en', context: SEED_CONTEXT })

  await seedAdmin(payload)

  const count = async (collection: 'pages' | 'actualites' | 'projets' | 'medias') => (await payload.count({ collection })).totalDocs
  console.log(`Seed terminé : pages=${await count('pages')} actualites=${await count('actualites')} projets=${await count('projets')} medias=${await count('medias')}`)
}

await seed()
process.exit(0)
```

- [ ] **Step 4 : lancer le seed deux fois** (vérifie l'idempotence)

```powershell
npm run seed
npm run seed
```

Expected : les deux exécutions affichent `Seed terminé : pages=13 actualites=3 projets=4 medias=8`. Les chiffres sont identiques à la seconde exécution, donc aucun doublon n'a été créé.

Si `payload run` ne résout pas l'alias `@/`, remplacer les imports `@/…` de `src/seed/data/types.ts` par des chemins relatifs (`../../collections/Pages`).

- [ ] **Step 5 : vérifier dans l'admin**

Run : `npm run dev`, se connecter à `/admin` avec `SEED_ADMIN_EMAIL`, ouvrir Pages → `accueil`, basculer Français/English.
Expected : les deux langues sont remplies, et les médias affichent leurs vignettes. Arrêter le serveur.

- [ ] **Step 6 : commit**

```powershell
git add -A
git commit -m "feat: seed idempotent des contenus, images provisoires et logos" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6 : Briques d'animation (TDD)

**Files :**
- Create : `src/components/motion/useReveal.ts`, `src/components/motion/Reveal.tsx`, `src/components/motion/RevealGroup.tsx`, `src/components/motion/no-js-guard.ts`
- Create : `src/app/(site)/motion.css`
- Test : `tests/unit/reveal.test.tsx`

**Interfaces :**
- Produces :
  - `Reveal({ as?, delay?, className?, id?, children })` et `RevealGroup({ as?, className?, children })` ;
  - `NO_JS_GUARD: string` (script inline) ;
  - les classes CSS `card-lift`, `card-media`, `btn-arrow`, `title-underline`, `page-enter` et `lightbox`.

- [ ] **Step 1 : tests (doivent échouer)**

`tests/unit/reveal.test.tsx` :

```tsx
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'

type Callback = (entries: { isIntersecting: boolean; target: Element }[]) => void
let callbacks: Callback[] = []

class FakeObserver {
  constructor(cb: Callback) {
    callbacks.push(cb)
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

describe('Reveal', () => {
  beforeEach(() => {
    callbacks = []
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('marque l’élément et le révèle à l’entrée dans l’écran', () => {
    render(<Reveal>Bonjour</Reveal>)
    const el = screen.getByText('Bonjour')
    expect(el).toHaveAttribute('data-reveal')
    expect(el).not.toHaveClass('is-visible')
    act(() => callbacks[0]([{ isIntersecting: true, target: el }]))
    expect(el).toHaveClass('is-visible')
  })

  it('révèle immédiatement si l’utilisateur réduit les animations', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    render(<Reveal>Calme</Reveal>)
    expect(screen.getByText('Calme')).toHaveClass('is-visible')
  })

  it('révèle immédiatement sans IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Reveal>Ancien</Reveal>)
    expect(screen.getByText('Ancien')).toHaveClass('is-visible')
  })

  it('applique un délai via variable CSS', () => {
    render(<Reveal delay={160}>Délai</Reveal>)
    expect(screen.getByText('Délai').style.getPropertyValue('--reveal-delay')).toBe('160ms')
  })

  it('RevealGroup marque le conteneur', () => {
    render(
      <RevealGroup className="grid">
        <div>A</div>
        <div>B</div>
      </RevealGroup>,
    )
    const group = screen.getByText('A').parentElement!
    expect(group).toHaveAttribute('data-reveal-group')
    act(() => callbacks[0]([{ isIntersecting: true, target: group }]))
    expect(group).toHaveClass('is-visible')
  })
})
```

Run : `npm test -- reveal`
Expected : FAIL (modules introuvables).

- [ ] **Step 2 : implémenter**

`src/components/motion/useReveal.ts` :

```ts
'use client'
import { useEffect, type RefObject } from 'react'

/** Ajoute « is-visible » à l'élément quand il entre dans l'écran (une seule fois). */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible')
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
}
```

`src/components/motion/Reveal.tsx` :

```tsx
'use client'
import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { useReveal } from './useReveal'

type Props = { as?: ElementType; delay?: number; className?: string; id?: string; children: ReactNode }

export function Reveal({ as: Tag = 'div', delay = 0, className, id, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const style = delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined
  return (
    <Tag ref={ref} id={id} data-reveal="" className={className} style={style}>
      {children}
    </Tag>
  )
}
```

`src/components/motion/RevealGroup.tsx` :

```tsx
'use client'
import { useRef, type ElementType, type ReactNode } from 'react'
import { useReveal } from './useReveal'

type Props = { as?: ElementType; className?: string; children: ReactNode }

/** Les enfants directs apparaissent l'un après l'autre (80 ms d'écart, voir motion.css). */
export function RevealGroup({ as: Tag = 'div', className, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <Tag ref={ref} data-reveal-group="" className={className}>
      {children}
    </Tag>
  )
}
```

`src/components/motion/no-js-guard.ts` :

```ts
/** Script inline placé dans <head> : l'état masqué des animations n'existe que si JS tourne. */
export const NO_JS_GUARD = "document.documentElement.classList.add('js')"
```

`src/app/(site)/motion.css` :

```css
:root {
  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
}

/* Apparition au défilement — uniquement quand JS est actif (classe .js sur <html>). */
.js [data-reveal],
.js [data-reveal-group] > * {
  transition:
    opacity 600ms var(--ease-out-soft),
    transform 600ms var(--ease-out-soft);
}
.js [data-reveal] {
  transition-delay: var(--reveal-delay, 0ms);
}
.js [data-reveal]:not(.is-visible),
.js [data-reveal-group]:not(.is-visible) > * {
  opacity: 0;
  transform: translateY(16px);
}
[data-reveal-group] > *:nth-child(2) { transition-delay: 80ms; }
[data-reveal-group] > *:nth-child(3) { transition-delay: 160ms; }
[data-reveal-group] > *:nth-child(4) { transition-delay: 240ms; }
[data-reveal-group] > *:nth-child(5) { transition-delay: 320ms; }
[data-reveal-group] > *:nth-child(6) { transition-delay: 400ms; }
[data-reveal-group] > *:nth-child(n + 7) { transition-delay: 480ms; }

/* Transition de page (template.tsx) */
.page-enter {
  animation: page-enter 200ms ease-out both;
}
@keyframes page-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Cartes */
.card-lift {
  transition:
    transform 250ms var(--ease-out-soft),
    box-shadow 250ms var(--ease-out-soft);
}
.card-lift:hover,
.card-lift:focus-within {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 62, 42, 0.12) !important;
}
.card-media { overflow: hidden; }
.card-media img { transition: transform 500ms var(--ease-out-soft); }
.card-lift:hover .card-media img,
.card-lift:focus-within .card-media img { transform: scale(1.04); }

/* Filet doré sous le titre au survol */
.title-underline {
  background-image: linear-gradient(#e6bf58, #e6bf58);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 100% 2px;
  transform-origin: left;
}
.card-lift .title-underline { background-size: 0 2px; transition: background-size 300ms var(--ease-out-soft); }
.card-lift:hover .title-underline,
.card-lift:focus-within .title-underline { background-size: 100% 2px; }

/* Boutons et liens avec flèche */
.btn-arrow { transition: filter 200ms ease, transform 200ms ease; }
.btn-arrow:hover { filter: brightness(1.06); }
.btn-arrow svg:last-child { transition: transform 200ms var(--ease-out-soft); }
.btn-arrow:hover svg:last-child,
.btn-arrow:focus-visible svg:last-child { transform: translateX(4px); }

/* En-tête compact au défilement */
.site-header {
  position: sticky;
  top: 0;
  transition:
    box-shadow 200ms ease,
    background-color 200ms ease;
}
.site-header .site-logo { transition: transform 200ms var(--ease-out-soft); transform-origin: left center; }
.site-header.is-compact { box-shadow: 0 6px 20px rgba(0, 62, 42, 0.1); }
.site-header.is-compact .site-logo { transform: scale(0.86); }

/* Visionneuse de la médiathèque */
.lightbox[open] { animation: lightbox-in 220ms var(--ease-out-soft) both; }
.lightbox::backdrop { background: rgba(0, 62, 42, 0.85); animation: page-enter 220ms ease-out both; }
@keyframes lightbox-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .js [data-reveal],
  .js [data-reveal-group] > * {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .page-enter,
  .lightbox[open],
  .lightbox::backdrop { animation: none; }
  .card-lift,
  .card-media img,
  .btn-arrow,
  .btn-arrow svg:last-child,
  .site-header,
  .site-header .site-logo { transition: none; }
  .card-lift:hover,
  .card-lift:focus-within,
  .card-lift:hover .card-media img,
  .btn-arrow:hover svg:last-child { transform: none; }
}
```

- [ ] **Step 3 : lancer les tests**

Run : `npm test`
Expected : PASS.

- [ ] **Step 4 : commit**

```powershell
git add -A
git commit -m "feat: briques d'animation Reveal/RevealGroup et styles de mouvement" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7 : Styles, layout localisé, en-tête, pied de page, pages d'erreur

**Files :**
- Replace : `src/app/(site)/globals.css` (portage de `72dc396:src/styles.css`)
- Replace : `src/app/(site)/[locale]/layout.tsx`
- Create : `src/app/(site)/[locale]/template.tsx`, `src/app/(site)/[locale]/error.tsx`, `src/app/(site)/[locale]/not-found.tsx`, `src/app/(site)/[locale]/[...rest]/page.tsx`, `src/app/(site)/[locale]/langue-indisponible/page.tsx`
- Create : `src/components/ui/Icon.tsx`, `src/components/ui/FacebookIcon.tsx`
- Create : `src/components/layout/SiteHeader.tsx`, `src/components/layout/LanguageSwitcher.tsx`, `src/components/layout/SiteFooter.tsx`
- Test : `tests/unit/language-switcher.test.tsx`, `tests/unit/site-header.test.tsx`

**Interfaces :**
- Consumes : `NO_JS_GUARD` et `motion.css` (tâche 6) ; `getDictionary`, `localizedHref`, `switchLocale`, `stripLocale`, `isActivePath`, `NAV_ITEMS`, `FOOTER_*` (tâche 2) ; `getReglages` (tâche 3).
- Produces :
  - `Icon({ i, size?, strokeWidth?, className?, style? })`, `FacebookIcon({ size?, color? })` ;
  - `SiteHeader({ locale, labels })`, `LanguageSwitcher({ locale, label })`, `SiteFooter({ locale, dict, reglages })`.

- [ ] **Step 1 : tests (doivent échouer)**

`tests/unit/language-switcher.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/fr/actualites/un-jeune-un-permis' }))

import LanguageSwitcher from '@/components/layout/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('propose chaque langue active en gardant la page', () => {
    render(<LanguageSwitcher locale="fr" label="Langue" />)
    expect(screen.getByRole('link', { name: /English/ })).toHaveAttribute('href', '/en/actualites/un-jeune-un-permis')
    expect(screen.getByRole('link', { name: /Français/ })).toHaveAttribute('aria-current', 'true')
  })
})
```

`tests/unit/site-header.test.tsx` :

```tsx
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/fr/actualites' }))

import SiteHeader from '@/components/layout/SiteHeader'
import { getDictionary } from '@/lib/i18n/dictionaries'

const dict = getDictionary('fr')

describe('SiteHeader', () => {
  it('liens localisés et rubrique active', () => {
    render(<SiteHeader locale="fr" labels={{ nav: dict.nav, header: dict.header }} />)
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' })
    const actu = nav.querySelector('a[href="/fr/actualites"]')!
    expect(actu).toHaveAttribute('aria-current', 'page')
    expect(nav.querySelector('a[href="/fr/ong"]')).not.toHaveAttribute('aria-current')
  })
  it('se compacte après 40 px de défilement', () => {
    const { container } = render(<SiteHeader locale="fr" labels={{ nav: dict.nav, header: dict.header }} />)
    const header = container.querySelector('header')!
    expect(header).not.toHaveClass('is-compact')
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 120, configurable: true })
      window.dispatchEvent(new Event('scroll'))
    })
    expect(header).toHaveClass('is-compact')
  })
  it('ouvre et ferme le menu mobile', async () => {
    render(<SiteHeader locale="fr" labels={{ nav: dict.nav, header: dict.header }} />)
    const button = screen.getByRole('button', { name: 'Ouvrir le menu' })
    await userEvent.click(button)
    expect(screen.getByRole('button', { name: 'Fermer le menu' })).toHaveAttribute('aria-expanded', 'true')
  })
})
```

Run : `npm test -- language-switcher site-header`
Expected : FAIL (modules introuvables).

- [ ] **Step 2 : porter la feuille de style**

Utiliser le terminal Bash, pour garder l'encodage UTF-8 :

```bash
git show 72dc396:src/styles.css > "src/app/(site)/globals.css"
```

Puis éditer `src/app/(site)/globals.css` :

1. Supprimer la ligne 1 (`@import url('https://fonts.googleapis.com/...DM+Sans...')`).
2. Juste après `@import 'tailwindcss';`, ajouter `@import './motion.css';`.
3. Remplacer chaque occurrence de `'DM Sans', sans-serif` par `var(--font-dm-sans), 'DM Sans', sans-serif`.
4. Dans la règle `.site-header { … }`, remplacer `position: relative;` par `position: sticky;`, puis ajouter `top: 0;`.
5. Ajouter à la fin :

```css
.media-fallback {
  background:
    radial-gradient(circle at 72% 18%, rgba(230, 191, 88, 0.42), transparent 28%),
    linear-gradient(135deg, #315c46, #003e2a 55%, #1f342b);
}

.skip-link {
  position: absolute;
  left: 16px;
  top: -60px;
  z-index: 100;
  padding: 10px 16px;
  border-radius: 6px;
  background: #e6bf58;
  color: #17372c;
  font-weight: 700;
}
.skip-link:focus { top: 12px; }

[aria-disabled='true'],
:disabled { cursor: not-allowed; }
```

- [ ] **Step 3 : icônes**

`src/components/ui/Icon.tsx` : reprendre `git show 72dc396:src/global/Icon.jsx` à l'identique (mêmes imports lucide et même `iconMap`), en TypeScript :

```tsx
import type { CSSProperties } from 'react'
import {
  ArrowRight, ArrowUpRight, Award, Book, Bookmark, Check, ChevronDown, ChevronLeft, ChevronRight, Circle, CircleCheck, Clock,
  Filter, Globe, GraduationCap, Grid3X3, Handshake, Heart, HeartPulse, Image as ImageIcon, Info, Leaf, Link2,
  Lock, Mail, MapPin, Menu, Newspaper, Phone, Play, Plus, Quote, Rows3, Send, Target, Trophy, Upload, UserPlus, Users,
  Video, Vote, X,
} from 'lucide-react'

const iconMap = {
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  award: Award,
  book: Book,
  bookmark: Bookmark,
  check: Check,
  'check-circle': CircleCheck,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  clock: Clock,
  filter: Filter,
  globe: Globe,
  'graduation-cap': GraduationCap,
  'grid-3x3': Grid3X3,
  handshake: Handshake,
  heart: Heart,
  'heart-pulse': HeartPulse,
  image: ImageIcon,
  info: Info,
  leaf: Leaf,
  'link-2': Link2,
  lock: Lock,
  mail: Mail,
  'map-pin': MapPin,
  menu: Menu,
  newspaper: Newspaper,
  phone: Phone,
  play: Play,
  plus: Plus,
  quote: Quote,
  'rows-3': Rows3,
  send: Send,
  target: Target,
  trophy: Trophy,
  upload: Upload,
  'user-plus': UserPlus,
  users: Users,
  video: Video,
  vote: Vote,
  x: X,
} as const

export type IconName = keyof typeof iconMap

type Props = { i: IconName | string; size?: number; strokeWidth?: number; className?: string; style?: CSSProperties }

export default function Icon({ i, size = 20, strokeWidth = 2, className, style }: Props) {
  const LucideIcon = iconMap[i as IconName] ?? Circle
  return <LucideIcon size={size} strokeWidth={strokeWidth} aria-hidden="true" className={className} style={style} />
}
```

`src/components/ui/FacebookIcon.tsx` (le SVG du prototype, `NewsCard.jsx`) :

```tsx
export default function FacebookIcon({ size = 18, color = '#1877F2' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  )
}
```

- [ ] **Step 4 : sélecteur de langue et en-tête**

`src/components/layout/LanguageSwitcher.tsx` :

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LOCALES, NATIVE_NAMES, type Locale } from '@/lib/i18n/config'
import { switchLocale } from '@/lib/i18n/paths'

export default function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname()
  return (
    <nav aria-label={label} className="flex items-center border border-border rounded-md overflow-hidden text-xs font-body">
      {LOCALES.map((code) => {
        const active = code === locale
        return (
          <Link
            key={code}
            href={switchLocale(pathname, code)}
            hrefLang={code}
            lang={code}
            title={NATIVE_NAMES[code]}
            aria-current={active ? 'true' : undefined}
            className={`px-3 py-1.5 uppercase transition-colors ${active ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-primary'}`}
          >
            <span aria-hidden="true">{code}</span>
            <span className="sr-only">{NATIVE_NAMES[code]}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

`src/components/layout/SiteHeader.tsx` (portage de `72dc396:src/components/SiteHeader.jsx` ; le markup et les classes sont conservés) :

```tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Icon from '@/components/ui/Icon'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { isActivePath, localizedHref, stripLocale } from '@/lib/i18n/paths'
import { NAV_ITEMS } from '@/lib/routes'
import LanguageSwitcher from './LanguageSwitcher'

type Props = { locale: Locale; labels: Pick<Dictionary, 'nav' | 'header'> }

export default function SiteHeader({ locale, labels }: Props) {
  const pathname = usePathname()
  const current = stripLocale(pathname)
  const [openFor, setOpenFor] = useState<string | null>(null)
  const isOpen = openFor === pathname
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const joinHref = localizedHref(locale, '/adhesion')

  return (
    <header className={`site-header bg-background border-b border-border w-full ${compact ? 'is-compact' : ''}`}>
      <div className="site-header-inner max-w-[1280px] mx-auto px-6 flex items-center justify-between h-20">
        <Link href={localizedHref(locale, '/')} className="flex items-center gap-3 flex-shrink-0" aria-label={labels.header.home}>
          <Image src="/brand/logo-couleur.png" alt="" width={1779} height={884} priority className="site-logo h-14 w-auto object-contain" />
        </Link>

        <nav className="desktop-navigation items-center" aria-label={labels.header.mainNav}>
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(current, item.href)
            return (
              <Link
                key={item.key}
                href={localizedHref(locale, item.href)}
                aria-current={active ? 'page' : undefined}
                className={`px-3 py-2 text-sm font-body font-medium transition-colors ${
                  active ? 'text-primary font-bold border-b-2 border-primary' : 'text-foreground hover:text-primary'
                }`}
              >
                {labels.nav[item.key]}
              </Link>
            )
          })}
        </nav>

        <div className="desktop-actions items-center gap-3">
          <LanguageSwitcher locale={locale} label={labels.header.language} />
          <Link
            href={joinHref}
            className="btn-arrow text-sm font-bold px-5 py-2.5 rounded-md font-body transition-transform hover:-translate-y-0.5"
            style={{ background: '#E6BF58', color: '#003E2A' }}
          >
            {labels.header.join}
          </Link>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label={isOpen ? labels.header.closeMenu : labels.header.openMenu}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setOpenFor(isOpen ? null : pathname)}
        >
          <Icon i={isOpen ? 'x' : 'menu'} size={25} />
        </button>
      </div>

      <div id="mobile-navigation" className={`mobile-navigation ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen} inert={!isOpen}>
        <nav aria-label={labels.header.mobileNav}>
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(current, item.href)
            return (
              <Link key={item.key} href={localizedHref(locale, item.href)} aria-current={active ? 'page' : undefined} className={active ? 'is-active' : ''}>
                {labels.nav[item.key]}
                <Icon i="arrow-up-right" size={17} />
              </Link>
            )
          })}
        </nav>
        <div className="mobile-navigation-footer">
          <LanguageSwitcher locale={locale} label={labels.header.language} />
          <Link href={joinHref} className="mobile-join-button">
            <Icon i="user-plus" size={18} />
            {labels.header.joinLong}
          </Link>
          <p>Komo-Kango, Gabon</p>
        </div>
      </div>
    </header>
  )
}
```

Le menu mobile se ferme quand on change de page, car `openFor` mémorise le chemin où il a été ouvert : aucun `setState` n'est appelé dans un effet.

- [ ] **Step 5 : pied de page**

`src/components/layout/SiteFooter.tsx` (portage de `72dc396:src/components/SiteFooter.jsx`, sans l'e-mail inventé ni la note interne) :

```tsx
import Image from 'next/image'
import Link from 'next/link'
import FacebookIcon from '@/components/ui/FacebookIcon'
import Icon from '@/components/ui/Icon'
import type { Reglage } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import { FOOTER_PRIMARY, FOOTER_UTILITY } from '@/lib/routes'
import { isPlaceholder } from '@/lib/text'

type Props = { locale: Locale; dict: Dictionary; reglages: Reglage | null }

export default function SiteFooter({ locale, dict, reglages }: Props) {
  const columns = [
    { title: dict.footer.navigation, links: FOOTER_PRIMARY },
    { title: dict.footer.useful, links: FOOTER_UTILITY },
  ]
  return (
    <footer className="bg-deep text-accent-foreground font-body">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-4 gap-12 footer-grid">
          <div>
            <Link href={localizedHref(locale, '/')} className="inline-block mb-4" aria-label={dict.header.home}>
              <Image src="/brand/logo-clair.png" alt="" width={1774} height={887} className="h-16 w-auto object-contain" />
            </Link>
            {!isPlaceholder(reglages?.footerTagline) && (
              <p className="text-sm text-accent-foreground opacity-80 leading-relaxed max-w-[280px]">{reglages?.footerTagline}</p>
            )}
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wide">{column.title}</h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.key}>
                    <Link href={localizedHref(locale, link.href)} className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                      {dict.nav[link.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wide">{dict.footer.contact}</h2>
            {!isPlaceholder(reglages?.location) && (
              <p className="flex items-center gap-2 text-sm opacity-80">
                <Icon i="map-pin" size={15} /> {reglages?.location}
              </p>
            )}
            {reglages?.facebookUrl && (
              <div className="mt-5">
                <p className="text-xs opacity-50 mb-3">{dict.footer.follow}</p>
                <a
                  href={reglages.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-arrow inline-flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-bold"
                  style={{ background: '#1877F2', color: '#fff' }}
                >
                  <FacebookIcon size={16} color="#fff" />
                  {dict.footer.facebook}
                  <span className="sr-only"> {dict.common.newTab}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="border-t mt-12 pt-6 flex items-center justify-between gap-5 footer-bottom" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <p className="text-xs opacity-60">{dict.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 6 : layout, template, erreurs**

`src/app/(site)/[locale]/layout.tsx` :

```tsx
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteHeader from '@/components/layout/SiteHeader'
import { NO_JS_GUARD } from '@/components/motion/no-js-guard'
import { getReglages } from '@/lib/content'
import { isLocale, localeDir } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import '../globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm-sans', display: 'swap' })

export const revalidate = 3600

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  icons: { icon: '/brand/logo-couleur.png' },
}

export function generateStaticParams() {
  return []
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const reglages = await getReglages(locale).catch(() => null)

  return (
    <html lang={locale} dir={localeDir(locale)} className={dmSans.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_JS_GUARD }} />
      </head>
      <body className="bg-background text-foreground font-body">
        <a href="#contenu" className="skip-link">
          {dict.skipToContent}
        </a>
        <SiteHeader locale={locale} labels={{ nav: dict.nav, header: dict.header }} />
        <main id="contenu">{children}</main>
        <SiteFooter locale={locale} dict={dict} reglages={reglages} />
      </body>
    </html>
  )
}
```

`src/app/(site)/[locale]/template.tsx` :

```tsx
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>
}
```

`src/app/(site)/[locale]/error.tsx` :

```tsx
'use client'
import { useParams } from 'next/navigation'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale } from '@/lib/i18n/config'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const params = useParams<{ locale: string }>()
  const dict = getDictionary(isLocale(params.locale) ? params.locale : 'fr')
  return (
    <section className="py-24">
      <div className="max-w-[1280px] mx-auto px-6">
        <p className="text-lg text-foreground mb-6">{dict.common.error}</p>
        <button type="button" onClick={reset} className="btn-arrow font-bold px-6 py-3 rounded-md bg-primary text-primary-foreground">
          {dict.common.retry}
        </button>
      </div>
    </section>
  )
}
```

`src/app/(site)/[locale]/not-found.tsx` :

```tsx
'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'

export default function NotFound() {
  const params = useParams<{ locale: string }>()
  const locale = isLocale(params?.locale ?? '') ? (params.locale as 'fr' | 'en') : 'fr'
  const dict = getDictionary(locale)
  return (
    <section className="py-24" style={{ background: '#F7F8F4' }}>
      <div className="max-w-[720px] mx-auto px-6 text-center flex flex-col items-center gap-6">
        <p className="text-6xl font-bold text-primary font-headings">404</p>
        <h1 className="text-4xl font-bold text-foreground font-headings">{dict.notFound.title}</h1>
        <p className="text-lg text-muted-foreground">{dict.notFound.text}</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href={localizedHref(locale, '/')} className="btn-arrow font-bold px-7 py-3 rounded-md bg-primary text-primary-foreground flex items-center gap-2">
            {dict.notFound.home}
          </Link>
          <Link href={localizedHref(locale, '/projets')} className="btn-arrow font-bold px-7 py-3 rounded-md border-2 border-primary text-primary flex items-center gap-2">
            {dict.notFound.actions} <Icon i="arrow-right" size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}
```

`src/app/(site)/[locale]/[...rest]/page.tsx` (les URL inconnues sous une langue s'affichent dans la 404 localisée) :

```tsx
import { notFound } from 'next/navigation'

export default function CatchAll() {
  notFound()
}
```

`src/app/(site)/[locale]/langue-indisponible/page.tsx` :

```tsx
import Link from 'next/link'
import { LOCALES, NATIVE_NAMES } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false } }

export default async function LanguageUnavailable({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams
  return (
    <section className="py-24" style={{ background: '#F7F8F4' }}>
      <div className="max-w-[720px] mx-auto px-6 flex flex-col gap-10">
        {LOCALES.map((locale) => {
          const dict = getDictionary(locale)
          return (
            <div key={locale} lang={locale} className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold text-foreground font-headings">{dict.languageUnavailable.title}</h1>
              <p className="text-lg text-muted-foreground">{dict.languageUnavailable.text}</p>
            </div>
          )
        })}
        <ul className="flex gap-4 flex-wrap" aria-label={lang ? NATIVE_NAMES[lang] : undefined}>
          {LOCALES.map((locale) => (
            <li key={locale}>
              <Link href={`/${locale}`} hrefLang={locale} lang={locale} className="btn-arrow font-bold px-6 py-3 rounded-md bg-primary text-primary-foreground inline-flex">
                {NATIVE_NAMES[locale]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

Mettre à jour la page provisoire `src/app/(site)/[locale]/page.tsx` : elle sera remplacée à la tâche 9. Pour l'instant, retirer son `<main>`, qui ferait doublon avec celui du layout :

```tsx
export default function Home() {
  return <section className="py-24 max-w-[1280px] mx-auto px-6">Terre d’Avenir KOMO-KANGO</section>
}
```

- [ ] **Step 7 : tests et vérification visuelle**

Run : `npm test`
Expected : PASS.

Run : `npm run dev`, puis ouvrir `/fr`, `/en`, `/fr/nimporte-quoi` et `/es/contact`. Vérifier :
- l'en-tête et le pied de page correspondent à la maquette ;
- l'en-tête se compacte au défilement ;
- le menu mobile s'ouvre (fenêtre à 390 px) ;
- la 404 est localisée ;
- la page « Version non publiée » s'affiche.

- [ ] **Step 8 : commit**

```powershell
git add -A
git commit -m "feat: layout localisé, en-tête animé, pied de page, 404 et langue indisponible" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8 : Composants d'interface partagés (TDD)

**Files :**
- Create (dans `src/components/ui/`) : `GoldDivider.tsx`, `SectionHeader.tsx`, `Cta.tsx`, `Paragraphs.tsx`, `MediaImage.tsx`, `EmphasisText.tsx`, `PageHero.tsx`, `ContentSection.tsx`, `CtaBand.tsx`, `ActionThemeCard.tsx`, `NewsCard.tsx`
- Test : `tests/unit/ui.test.tsx`

**Interfaces :**
- Consumes : `Icon`, `FacebookIcon` (tâche 7) ; `Reveal`, `RevealGroup` (tâche 6) ; `localizedHref`, `isExternal`, `paragraphs`, `emphasisParts`, `isPlaceholder` (tâche 2) ; `Section` (tâche 3) ; les types `Media`, `Actualite`, `Projet`.
- Produces :
  - `GoldDivider({ className? })` ;
  - `SectionHeader({ overline?, title, subtitle?, centered? })` ;
  - `Cta({ locale, href, label, variant?, icon?, newTabLabel?, className? })`, avec `variant` parmi `'gold'|'primary'|'outline'|'outline-light'|'link'` ;
  - `CtaList({ locale, ctas, newTabLabel?, dark? })` ;
  - `Paragraphs({ text, className? })`, `EmphasisText({ text })` ;
  - `MediaImage({ media, className?, sizes?, eager?, fill?, decorative? })` ;
  - `PageHero({ eyebrow?, title, intro?, image? })` ;
  - `ContentSection({ locale, section, tone?, id?, newTabLabel?, children? })` ;
  - `CtaBand({ locale, title?, text?, ctas, newTabLabel? })` ;
  - `ActionThemeCard({ locale, projet, linkLabel })` ;
  - `NewsCard({ locale, actualite, labels: { readArticle: string; newTab: string } })`.

- [ ] **Step 1 : tests (doivent échouer)**

`tests/unit/ui.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: ({ fill: _f, priority: _p, ...props }: Record<string, unknown>) => <img {...(props as object)} />,
}))

import { Cta, CtaList } from '@/components/ui/Cta'
import { EmphasisText } from '@/components/ui/EmphasisText'
import { MediaImage } from '@/components/ui/MediaImage'
import { Paragraphs } from '@/components/ui/Paragraphs'

describe('Cta', () => {
  it('localise les liens internes', () => {
    render(<Cta locale="en" href="/adhesion" label="Join us" />)
    expect(screen.getByRole('link', { name: /Join us/ })).toHaveAttribute('href', '/en/adhesion')
  })
  it('ouvre les liens externes dans un nouvel onglet, annoncé aux lecteurs d’écran', () => {
    render(<Cta locale="fr" href="https://www.facebook.com/x" label="Facebook" newTabLabel="(nouvel onglet)" />)
    const link = screen.getByRole('link', { name: /Facebook.*nouvel onglet/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
  it('CtaList ne rend rien sans boutons', () => {
    const { container } = render(<CtaList locale="fr" ctas={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('Paragraphs', () => {
  it('rend les paragraphes et masque les brouillons', () => {
    render(<Paragraphs text={'Premier.\n\nSecond [À CONFIRMER].\n\nTroisième.'} />)
    expect(screen.getByText('Premier.')).toBeInTheDocument()
    expect(screen.getByText('Troisième.')).toBeInTheDocument()
    expect(screen.queryByText(/CONFIRMER/)).toBeNull()
  })
})

describe('EmphasisText', () => {
  it('met en doré le passage entre astérisques', () => {
    render(<EmphasisText text="Du monde, *faisons grandir* la solidarité." />)
    expect(screen.getByText('faisons grandir').tagName).toBe('SPAN')
  })
})

describe('MediaImage', () => {
  const media = { id: 1, url: '/api/medias/file/sport.jpg', alt: 'Un tournoi', width: 1800, height: 1200, provisoire: false } as never
  it('utilise le texte alternatif du média', () => {
    render(<MediaImage media={media} />)
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Un tournoi')
  })
  it('rend une image provisoire décorative', () => {
    const { container } = render(<MediaImage media={{ ...(media as object), provisoire: true } as never} />)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })
  it('affiche un fond de repli sans média', () => {
    const { container } = render(<MediaImage media={null} className="h-40" />)
    expect(container.querySelector('.media-fallback')).not.toBeNull()
  })
})
```

Run : `npm test -- ui`
Expected : FAIL.

- [ ] **Step 2 : composants de base**

`src/components/ui/GoldDivider.tsx` :

```tsx
export default function GoldDivider({ className = '' }: { className?: string }) {
  return <div className={`w-16 h-0.5 bg-secondary ${className}`} />
}
```

`src/components/ui/SectionHeader.tsx` (portage à l'identique, avec `overline` facultatif) :

```tsx
type Props = { overline?: string | null; title: string; subtitle?: string | null; centered?: boolean }

export default function SectionHeader({ overline, title, subtitle, centered = false }: Props) {
  return (
    <div className={`flex flex-col gap-3 ${centered ? 'items-center text-center' : ''}`}>
      {overline && (
        <span
          className="text-xs font-bold font-body uppercase"
          style={{
            letterSpacing: '0.14em',
            color: '#005C38',
            background: '#E6BF5820',
            border: '1px solid #E6BF5850',
            borderRadius: 4,
            padding: '3px 10px',
            display: 'inline-block',
            alignSelf: centered ? 'center' : 'flex-start',
          }}
        >
          {overline}
        </span>
      )}
      <h2 className="text-4xl font-bold text-foreground font-headings" style={{ lineHeight: 1.15 }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-muted-foreground leading-relaxed font-body" style={{ maxWidth: 560 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
```

`src/components/ui/Paragraphs.tsx` :

```tsx
import { paragraphs } from '@/lib/text'

export function Paragraphs({ text, className = 'text-lg text-muted-foreground leading-relaxed' }: { text?: string | null; className?: string }) {
  const list = paragraphs(text)
  if (list.length === 0) return null
  return (
    <div className="flex flex-col gap-4">
      {list.map((p, i) => (
        <p key={i} className={`whitespace-pre-line font-body ${className}`}>
          {p}
        </p>
      ))}
    </div>
  )
}
```

`src/components/ui/EmphasisText.tsx` :

```tsx
import { emphasisParts } from '@/lib/text'

export function EmphasisText({ text }: { text: string }) {
  return (
    <>
      {emphasisParts(text).map((part, i) =>
        part.em ? (
          <span key={i} style={{ color: '#E6BF58' }}>
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}
```

Le test vérifie que « faisons grandir » est dans un `SPAN` : c'est vrai pour les deux branches, et seule la branche `em` porte la couleur dorée.

`src/components/ui/MediaImage.tsx` :

```tsx
import Image from 'next/image'
import type { Media } from '@/payload-types'

type Props = {
  media?: Media | number | null
  className?: string
  sizes?: string
  eager?: boolean
  fill?: boolean
  decorative?: boolean
}

export function MediaImage({ media, className = '', sizes = '100vw', eager = false, fill = false, decorative = false }: Props) {
  if (!media || typeof media === 'number' || !media.url) {
    return <div className={`media-fallback ${className}`} aria-hidden="true" />
  }
  const alt = decorative || media.provisoire ? '' : (media.alt ?? '')
  const loading = eager ? 'eager' : 'lazy'
  const fetchPriority = eager ? 'high' : undefined
  if (fill) {
    return <Image src={media.url} alt={alt} fill sizes={sizes} loading={loading} fetchPriority={fetchPriority} className={className} />
  }
  return (
    <Image
      src={media.url}
      alt={alt}
      width={media.width ?? 1600}
      height={media.height ?? 900}
      sizes={sizes}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
    />
  )
}
```

`src/components/ui/Cta.tsx` :

```tsx
import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { isExternal, localizedHref } from '@/lib/i18n/paths'
import FacebookIcon from './FacebookIcon'
import Icon from './Icon'

export type CtaVariant = 'gold' | 'primary' | 'outline' | 'outline-light' | 'link'

const BUTTON = 'font-bold text-base px-7 py-3 rounded-md font-body inline-flex items-center gap-2'
const VARIANTS: Record<CtaVariant, { className: string; style?: CSSProperties; light: boolean }> = {
  gold: { className: BUTTON, style: { background: '#E6BF58', color: '#17372C' }, light: false },
  primary: { className: `${BUTTON} bg-primary text-primary-foreground`, light: true },
  outline: { className: `${BUTTON} text-primary`, style: { border: '1.5px solid #005C38' }, light: false },
  'outline-light': { className: `${BUTTON} text-primary-foreground`, style: { border: '1.5px solid rgba(255,255,255,0.5)' }, light: true },
  link: { className: 'text-sm font-bold text-primary inline-flex items-center gap-1', light: false },
}

type Props = {
  locale: Locale
  href: string
  label: string
  variant?: CtaVariant
  icon?: string
  newTabLabel?: string
  className?: string
}

export function Cta({ locale, href, label, variant = 'primary', icon, newTabLabel, className = '' }: Props) {
  const v = VARIANTS[variant]
  const external = isExternal(href)
  const size = variant === 'link' ? 13 : 17
  const content = (
    <>
      {icon ? <Icon i={icon} size={size} /> : /facebook\.com/.test(href) ? <FacebookIcon size={16} color={v.light ? '#fff' : '#1877F2'} /> : null}
      <span>{label}</span>
      {external && newTabLabel && <span className="sr-only">{newTabLabel}</span>}
      <Icon i={external ? 'arrow-up-right' : 'arrow-right'} size={size} />
    </>
  )
  const cls = `btn-arrow ${v.className} ${className}`
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={v.style}>
        {content}
      </a>
    )
  }
  return (
    <Link href={localizedHref(locale, href)} className={cls} style={v.style}>
      {content}
    </Link>
  )
}

type ListProps = { locale: Locale; ctas?: { label: string; href: string; id?: string | null }[] | null; newTabLabel?: string; dark?: boolean }

/** Le premier bouton est principal, les suivants secondaires. */
export function CtaList({ locale, ctas, newTabLabel, dark = false }: ListProps) {
  if (!ctas || ctas.length === 0) return null
  return (
    <div className="flex gap-4 flex-wrap">
      {ctas.map((cta, i) => (
        <Cta
          key={cta.id ?? `${cta.href}-${i}`}
          locale={locale}
          href={cta.href}
          label={cta.label}
          newTabLabel={newTabLabel}
          variant={i === 0 ? (dark ? 'gold' : 'primary') : dark ? 'outline-light' : 'outline'}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3 : blocs de page**

`src/components/ui/PageHero.tsx` (portage exact du hero de `72dc396:src/screens/ContactDesktop.jsx`, lignes 48-75) :

```tsx
import { Reveal } from '@/components/motion/Reveal'
import type { Media } from '@/payload-types'
import { isPlaceholder } from '@/lib/text'
import { EmphasisText } from './EmphasisText'
import { MediaImage } from './MediaImage'

type Props = { eyebrow?: string | null; title: string; intro?: string | null; image?: Media | number | null }

export default function PageHero({ eyebrow, title, intro, image }: Props) {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: '#003E2A', minHeight: 380 }}>
      <div className="absolute inset-0 z-0" style={{ opacity: 0.38 }}>
        <MediaImage media={image} fill decorative eager sizes="100vw" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(105deg, #003E2Ae8 30%, #003E2Acc 55%, #003E2A99 100%)' }} />
      <Reveal className="relative z-10 max-w-[1280px] mx-auto px-6">
        {eyebrow && (
          <span
            className="text-xs font-bold font-body uppercase"
            style={{ letterSpacing: '0.14em', color: '#E6BF58', background: 'rgba(230,191,88,0.14)', border: '1px solid rgba(230,191,88,0.4)', borderRadius: 4, padding: '4px 12px', display: 'inline-block', marginBottom: 16 }}
          >
            {eyebrow}
          </span>
        )}
        <h1 className="text-5xl font-bold text-primary-foreground font-headings mb-4" style={{ lineHeight: 1.1 }}>
          <EmphasisText text={title} />
        </h1>
        {!isPlaceholder(intro) && (
          <p className="text-lg text-primary-foreground" style={{ opacity: 0.88, maxWidth: 640 }}>
            {intro}
          </p>
        )}
      </Reveal>
    </section>
  )
}
```

`src/components/ui/ContentSection.tsx` :

```tsx
import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'
import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'
import { CtaList } from './Cta'
import { Paragraphs } from './Paragraphs'
import SectionHeader from './SectionHeader'

type Props = { locale: Locale; section?: Section; tone?: 'white' | 'light'; id?: string; newTabLabel?: string; children?: ReactNode }

/** Section générique des pages composées : titre, texte, éléments, boutons. */
export default function ContentSection({ locale, section, tone = 'white', id, newTabLabel, children }: Props) {
  if (!section) return null
  const items = (section.items ?? []).filter((item) => !isPlaceholder(item.title) || !isPlaceholder(item.text))
  return (
    <section id={id} className={`py-20 ${tone === 'white' ? 'bg-background' : ''}`} style={tone === 'light' ? { background: '#F7F8F4' } : undefined}>
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-8">
        {section.heading && (
          <Reveal>
            <SectionHeader overline={section.eyebrow} title={section.heading} />
          </Reveal>
        )}
        {section.body && (
          <Reveal className="max-w-[760px]">
            <Paragraphs text={section.body} />
          </Reveal>
        )}
        {items.length > 0 && (
          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item, i) => (
              <div key={item.id ?? i} className="card-lift bg-background rounded-lg border border-border p-6 flex flex-col gap-2" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {!isPlaceholder(item.title) && <h3 className="text-lg font-bold text-foreground font-headings">{item.title}</h3>}
                {!isPlaceholder(item.text) && <Paragraphs text={item.text} className="text-base text-muted-foreground leading-relaxed" />}
              </div>
            ))}
          </RevealGroup>
        )}
        {children}
        <Reveal>
          <CtaList locale={locale} ctas={section.ctas} newTabLabel={newTabLabel} />
        </Reveal>
      </div>
    </section>
  )
}
```

`src/components/ui/CtaBand.tsx` (portage de la bande CTA de `ContactDesktop.jsx`, lignes 388-419) :

```tsx
import { Reveal } from '@/components/motion/Reveal'
import type { Locale } from '@/lib/i18n/config'
import { isPlaceholder } from '@/lib/text'
import { CtaList } from './Cta'

type Props = { locale: Locale; title?: string | null; text?: string | null; ctas?: { label: string; href: string; id?: string | null }[] | null; newTabLabel?: string }

export default function CtaBand({ locale, title, text, ctas, newTabLabel }: Props) {
  if (!ctas?.length) return null
  return (
    <section className="py-16" style={{ background: '#003E2A' }}>
      <Reveal className="max-w-[1280px] mx-auto px-6 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div>
          {title && <h2 className="text-3xl font-bold text-primary-foreground font-headings mb-2">{title}</h2>}
          {!isPlaceholder(text) && (
            <p className="text-base text-primary-foreground font-body" style={{ opacity: 0.82 }}>
              {text}
            </p>
          )}
        </div>
        <div className="w-full lg:w-auto lg:flex-shrink-0">
          <CtaList locale={locale} ctas={ctas} newTabLabel={newTabLabel} dark />
        </div>
      </Reveal>
    </section>
  )
}
```

`src/components/ui/ActionThemeCard.tsx` (portage ; le lien pointe vers la fiche du projet) :

```tsx
import Link from 'next/link'
import type { Projet } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { localizedHref } from '@/lib/i18n/paths'
import Icon from './Icon'

export default function ActionThemeCard({ locale, projet, linkLabel }: { locale: Locale; projet: Projet; linkLabel: string }) {
  return (
    <div className="card-lift bg-background rounded-lg border border-border p-6 flex flex-col gap-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="w-11 h-11 rounded-md flex items-center justify-center" style={{ background: '#F0F5EF' }}>
        <Icon i={projet.icon ?? 'target'} size={22} className="text-primary" />
      </div>
      <div>
        <h3 className="text-base font-bold text-foreground font-headings mb-2">
          <span className="title-underline">{projet.theme}</span>
        </h3>
        {projet.summary && <p className="text-sm text-muted-foreground leading-relaxed font-body">{projet.summary}</p>}
      </div>
      <Link href={localizedHref(locale, `/projets/${projet.slug}`)} className="btn-arrow text-sm font-bold text-primary flex items-center gap-1 mt-auto">
        {linkLabel} <Icon i="arrow-right" size={13} />
      </Link>
    </div>
  )
}
```

Note : le `textAlign: 'justify'` du prototype est retiré, car il crée de grands espaces sur mobile.

`src/components/ui/NewsCard.tsx` (portage ; le lien Facebook pointe vers la source réelle de l'actualité) :

```tsx
import Link from 'next/link'
import type { Actualite } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { localizedHref } from '@/lib/i18n/paths'
import FacebookIcon from './FacebookIcon'
import Icon from './Icon'
import { MediaImage } from './MediaImage'

type Props = { locale: Locale; actualite: Actualite; labels: { readArticle: string; newTab: string } }

export default function NewsCard({ locale, actualite, labels }: Props) {
  const source = actualite.source
  return (
    <article className="card-lift bg-background rounded-lg border border-border overflow-hidden flex flex-col" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="card-media" style={{ height: 196 }}>
        <MediaImage media={actualite.image} sizes="(min-width: 1024px) 400px, 100vw" className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        {actualite.category && <span className="text-xs font-bold text-primary uppercase tracking-widest font-body">{actualite.category}</span>}
        <h3 className="text-base font-bold text-foreground leading-snug font-headings">
          <span className="title-underline">{actualite.title}</span>
        </h3>
        {actualite.dateLabel && <p className="text-sm text-muted-foreground font-body">{actualite.dateLabel}</p>}
        <div className="flex items-center justify-between gap-3 mt-auto pt-3">
          <Link href={localizedHref(locale, `/actualites/${actualite.slug}`)} className="btn-arrow text-sm font-bold text-primary flex items-center gap-1">
            {labels.readArticle} <Icon i="arrow-right" size={13} />
          </Link>
          {source?.url && source.label && (
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-body font-medium" style={{ color: '#1877F2' }}>
              {/facebook\.com/.test(source.url) && <FacebookIcon size={18} />}
              {source.label}
              <span className="sr-only">{labels.newTab}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 4 : tests**

Run : `npm test`
Expected : PASS.

- [ ] **Step 5 : commit**

```powershell
git add -A
git commit -m "feat: composants d'interface partagés (CTA, sections, cartes, hero de page)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9 : Infrastructure e2e, métadonnées et page d'accueil

**Files :**
- Create : `playwright.config.ts`, `scripts/e2e-server.ts`
- Create : `src/lib/seo.ts`, `src/lib/page.ts`
- Create : `src/components/home/HeroSlider.tsx`, `MissionStrip.tsx`, `AncrageSection.tsx`, `MotTeaser.tsx`, `ThemesSection.tsx`, `NewsSection.tsx`, `ParticiperSection.tsx`
- Replace : `src/app/(site)/[locale]/page.tsx`
- Test : `tests/unit/seo.test.ts`, `tests/e2e/accueil.spec.ts`

**Interfaces :**
- Consumes :
  - les tâches 2 à 8 ;
  - le prototype `72dc396:src/components/HeroSlider.jsx` et `72dc396:src/screens/AccueilDesktop.jsx` ;
  - les styles `hero-*` et `mission-strip` de `globals.css`.
- Produces :
  - `pageMetadata({ locale, path, title?, description?, image? }): Metadata` ;
  - `type LocaleParams = { params: Promise<{ locale: string }> }`, `resolveLocale(params): Promise<Locale>` ;
  - `metadataFor(slug: PageSlug, path: string): (props: LocaleParams) => Promise<Metadata>` ;
  - `npm run test:e2e` (build, puis Playwright sur le port 3100).

- [ ] **Step 1 : test de `pageMetadata` (doit échouer)**

`tests/unit/seo.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { pageMetadata } from '@/lib/seo'

describe('pageMetadata', () => {
  it('canonique, hreflang et Open Graph', () => {
    const meta = pageMetadata({ locale: 'en', path: '/contact', title: 'Contact — X', description: 'Desc' })
    expect(meta.title).toBe('Contact — X')
    expect(meta.description).toBe('Desc')
    expect(meta.alternates?.canonical).toBe('/en/contact')
    expect(meta.alternates?.languages).toEqual({ fr: '/fr/contact', en: '/en/contact', 'x-default': '/fr/contact' })
    expect(meta.openGraph).toMatchObject({ locale: 'en_GB', siteName: 'Terre d’Avenir KOMO-KANGO', url: '/en/contact' })
  })
  it('retire les astérisques d’emphase du titre', () => {
    expect(pageMetadata({ locale: 'fr', path: '/', title: 'A *b* c' }).title).toBe('A b c')
  })
})
```

Run : `npm test -- seo`
Expected : FAIL.

- [ ] **Step 2 : implémenter `seo.ts` et `page.ts`**

`src/lib/seo.ts` :

```ts
import type { Metadata } from 'next'
import type { Locale } from './i18n/config'
import { alternates, localizedHref } from './i18n/paths'
import { stripEmphasis } from './text'

const OG_LOCALES: Record<Locale, string> = { fr: 'fr_FR', en: 'en_GB' }
export const SITE_NAME = 'Terre d’Avenir KOMO-KANGO'

type Args = { locale: Locale; path: string; title?: string | null; description?: string | null; image?: string | null }

export function pageMetadata({ locale, path, title, description, image }: Args): Metadata {
  const cleanTitle = title ? stripEmphasis(title) : SITE_NAME
  const url = localizedHref(locale, path)
  return {
    title: cleanTitle,
    description: description ?? undefined,
    alternates: { canonical: url, languages: alternates(path) },
    openGraph: {
      title: cleanTitle,
      description: description ?? undefined,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      type: 'website',
      images: [image ?? '/brand/og.jpg'],
    },
  }
}
```

`src/lib/page.ts` :

```ts
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { PageSlug } from '@/collections/Pages'
import { getPage } from './content'
import { isLocale, type Locale } from './i18n/config'
import { pageMetadata } from './seo'

export type LocaleParams = { params: Promise<{ locale: string }> }

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return locale
}

export function metadataFor(slug: PageSlug, path: string) {
  return async ({ params }: LocaleParams): Promise<Metadata> => {
    const locale = await resolveLocale(params)
    const page = await getPage(slug, locale)
    return pageMetadata({ locale, path, title: page?.seoTitle, description: page?.metaDescription })
  }
}
```

Run : `npm test -- seo`
Expected : PASS.

- [ ] **Step 3 : serveur et configuration Playwright**

`scripts/e2e-server.ts` :

```ts
import { spawn } from 'node:child_process'
import { startDatabase } from './lib/embedded-db'

const run = (command: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(command, { shell: true, stdio: 'inherit' })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${command} → code ${code}`))))
  })

const pg = await startDatabase()
await run('npm run migrate')
await run('npm run seed')
const server = spawn('npx next start -p 3100', { shell: true, stdio: 'inherit' })

const stop = async () => {
  server.kill()
  await pg.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
```

`playwright.config.ts` :

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:3100', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npx tsx scripts/e2e-server.ts',
    url: 'http://localhost:3100/fr',
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
  },
})
```

Arrêter `npm run db` s'il tourne : le serveur e2e démarre sa propre instance sur le même port 5433.

```powershell
npx playwright install chromium
```

- [ ] **Step 4 : test e2e de l'accueil (doit échouer)**

`tests/e2e/accueil.spec.ts` :

```ts
import { expect, test } from '@playwright/test'

test('accueil FR : contenus des Textes v1.3', async ({ page }) => {
  await page.goto('/fr')
  await expect(page).toHaveTitle(/ONG, solidarité et développement local/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('faisons grandir')
  await expect(page.getByText('Depuis février 2025')).toBeVisible()
  await expect(page.getByRole('link', { name: /Lire le mot de la présidente/ })).toHaveAttribute('href', '/fr/mot-de-la-presidente')
  await expect(page.locator('article')).toHaveCount(3)
  await expect(page.getByRole('link', { name: /Jeunesse & opportunités|En savoir plus/ }).first()).toBeVisible()
})

test('accueil FR : aucun contenu inventé de la maquette', async ({ page }) => {
  await page.goto('/fr')
  for (const text of ['Fondée au Komo-Kango', 'Membres actifs', 'Demandes reçues', 'Données à connecter', 'Portrait à valider']) {
    await expect(page.getByText(text)).toHaveCount(0)
  }
})

test('accueil EN', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('let’s grow')
  await expect(page.getByRole('link', { name: /Join us/ }).first()).toHaveAttribute('href', '/en/adhesion')
})
```

Run : `npm run test:e2e -- accueil`
Expected : FAIL (la page provisoire n'a pas ces contenus).

- [ ] **Step 5 : porter les sections de l'accueil**

Appliquer les règles de portage P1 à P10 et la table « Contenus inventés à supprimer ». Pour chaque composant :

| Composant (`src/components/home/`) | Source (commit `72dc396`) | Props | Liaisons |
|---|---|---|---|
| `HeroSlider.tsx` | `src/components/HeroSlider.jsx` (entier) | `{ locale: Locale; title: string; intro?: string \| null; section?: Section; images: Media[] }` | voir ci-dessous |
| `MissionStrip.tsx` | `AccueilDesktop.jsx` l.25-40 | `{ items: { title?: string \| null; text?: string \| null; id?: string \| null }[] }` | chaque élément : `title` en gras, `text` en libellé ; grille à 3 colonnes au lieu de 4 |
| `AncrageSection.tsx` | `AccueilDesktop.jsx` l.43-86 | `{ locale: Locale; section?: Section; image?: Media; linkLabel: string }` | `SectionHeader overline={section.eyebrow} title={section.heading}`, `<Paragraphs text={section.body} />`, image en `MediaImage` ; les 3 puces sont supprimées ; le lien « L'ONG en détail » devient `<Cta variant="link" href="/ong" label={linkLabel} />` |
| `MotTeaser.tsx` | `AccueilDesktop.jsx` l.89-145 | `{ locale: Locale; section?: Section }` | le portrait devient un bloc vert `#003E2A` (carré arrondi) avec `<Icon i="quote" size={64} style={{ color: '#E6BF58' }} />` ; la citation vient de `section.body` ; le titre de `section.heading` ; la signature est supprimée ; le bouton est `section.ctas[0]` (`Cta variant="primary"`) |
| `ThemesSection.tsx` | `AccueilDesktop.jsx` l.148-182 | `{ locale: Locale; section?: Section; projets: Projet[]; overline: string; linkLabel: string }` | `SectionHeader overline={overline} title={section.heading}` ; le lien « Tous les projets » devient `section.ctas[0]` (`variant="link"`) ; la grille est un `RevealGroup` d'`ActionThemeCard` |
| `NewsSection.tsx` | `AccueilDesktop.jsx` l.185-220 | `{ locale: Locale; section?: Section; actualites: Actualite[]; overline: string; labels: { readArticle: string; newTab: string } }` | même logique, avec un `RevealGroup` de `NewsCard` |
| `ParticiperSection.tsx` | `AccueilDesktop.jsx` l.241-279 | `{ locale: Locale; section?: Section; newTabLabel: string }` | en tête : `SectionHeader title={section.heading}` et `<Paragraphs text={section.body} />`. Les deux cartes gardent leur style ; carte 1 : titre `ctas[0].label`, bouton `Cta variant="gold" icon="user-plus"` ; carte 2 : titre `ctas[1].label`, bouton `Cta variant="outline" icon="handshake"`. Les textes inventés des cartes sont supprimés. |

Liaisons propres à `HeroSlider.tsx` :
- les 3 `hero-slide` affichent `images[0]`, `images[1]` et `images[2]` via `<MediaImage fill decorative />`, le premier avec `eager` ;
- les 9 photos du collage (blob `b`, photo `p`) affichent `images[(3 + b * 3 + p) % images.length]` ;
- le badge vient de `section.eyebrow`, le `h1` de `<EmphasisText text={title} />` (en supprimant le `<br />` et les `<span>` codés en dur), et le paragraphe de `intro` ;
- les deux liens deviennent `section.ctas[0]` (`Cta variant="gold" icon="user-plus"`) et `section.ctas[1]` (`Cta variant="outline-light"`) ;
- le bloc de statistiques (lignes 100-111) est supprimé ;
- si `images` est vide, `MediaImage` affiche son fond de repli ;
- le composant reste un Server Component, car le diaporama est entièrement en CSS.

Contraintes communes : les classes `hero-*`, `mission-strip`, `py-24` et la structure DOM sont conservées ; pour les contenus, seules les props sont utilisées.

- [ ] **Step 6 : page d'accueil**

`src/app/(site)/[locale]/page.tsx` :

```tsx
import { notFound } from 'next/navigation'
import AncrageSection from '@/components/home/AncrageSection'
import HeroSlider from '@/components/home/HeroSlider'
import MissionStrip from '@/components/home/MissionStrip'
import MotTeaser from '@/components/home/MotTeaser'
import NewsSection from '@/components/home/NewsSection'
import ParticiperSection from '@/components/home/ParticiperSection'
import ThemesSection from '@/components/home/ThemesSection'
import CtaBand from '@/components/ui/CtaBand'
import type { Media } from '@/payload-types'
import { getActualites, getPage, getProjets, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('accueil', '/')

export default async function HomePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, projets, actualites, reglages] = await Promise.all([
    getPage('accueil', locale),
    getProjets(locale),
    getActualites(locale),
    getReglages(locale),
  ])
  if (!page) notFound()
  const section = (key: string) => getSection(page, key)
  const images = (reglages.heroImages ?? []).filter((m): m is Media => typeof m === 'object' && m !== null)
  const transparence = section('transparence')

  return (
    <>
      <HeroSlider locale={locale} title={page.h1 ?? ''} intro={page.intro} section={section('hero')} images={images} />
      <MissionStrip items={section('hero')?.items ?? []} />
      <AncrageSection locale={locale} section={section('ancrage')} image={images[2]} linkLabel={dict.nav.ong} />
      <MotTeaser locale={locale} section={section('mot')} />
      <ThemesSection locale={locale} section={section('engagements')} projets={projets} overline={dict.nav.projets} linkLabel={dict.common.learnMore} />
      <NewsSection
        locale={locale}
        section={section('actualites')}
        actualites={actualites.slice(0, 3)}
        overline={dict.nav.actualites}
        labels={{ readArticle: dict.common.readArticle, newTab: dict.common.newTab }}
      />
      <ParticiperSection locale={locale} section={section('participer')} newTabLabel={dict.common.newTab} />
      <CtaBand locale={locale} title={transparence?.heading} text={transparence?.body} ctas={transparence?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
```

- [ ] **Step 7 : tests**

Run : `npm test`, puis `npm run test:e2e -- accueil`
Expected : PASS (3 tests × 2 projets).

- [ ] **Step 8 : contrôle visuel**

Comparer `/fr` (avec `npm run dev`) à l'écran Banani correspondant (MCP Banani, outil `banani_get_selected_designs`, ou `.banani-export/screens/AccueilDesktop.jsx`). Vérifier :
- même hiérarchie et mêmes couleurs ;
- le diaporama du hero tourne ;
- les sections apparaissent en fondu au défilement ;
- les cartes se soulèvent au survol.

- [ ] **Step 9 : commit**

```powershell
git add -A
git commit -m "feat: page d'accueil portée de la maquette, métadonnées et tests e2e" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10 : Actualités (liste et article)

**Files :**
- Create : `src/components/article/ArticleHero.tsx`, `src/components/article/ArticleBody.tsx`, `src/components/article/ShareButtons.tsx`, `src/components/news/ActualitesHero.tsx`
- Create : `src/app/(site)/[locale]/actualites/page.tsx`, `src/app/(site)/[locale]/actualites/[slug]/page.tsx`
- Test : `tests/unit/share-buttons.test.tsx`, `tests/e2e/actualites.spec.ts`

**Interfaces :**
- Consumes : les tâches 2 à 9.
- Produces (réutilisés par la tâche 11) :
  - `ArticleHero({ image, category?, title, dateLabel?, source?, newTabLabel })` ;
  - `ArticleBody({ lead?, body?, meta, source?, share })`, avec `meta: { label: string; value: string }[]` et `share: { url: string; labels: { share: string; copyLink: string; linkCopied: string } }` ;
  - `ShareButtons({ url, labels })`.

- [ ] **Step 1 : test des boutons de partage (doit échouer)**

`tests/unit/share-buttons.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ShareButtons from '@/components/article/ShareButtons'

const labels = { share: 'Partager :', copyLink: 'Copier le lien', linkCopied: 'Lien copié' }

describe('ShareButtons', () => {
  it('lien de partage Facebook encodé', () => {
    render(<ShareButtons url="https://site.org/fr/actualites/a" labels={labels} />)
    expect(screen.getByRole('link', { name: /Facebook/ })).toHaveAttribute(
      'href',
      'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fsite.org%2Ffr%2Factualites%2Fa',
    )
  })
  it('copie le lien et le confirme', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<ShareButtons url="https://site.org/x" labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: 'Copier le lien' }))
    expect(writeText).toHaveBeenCalledWith('https://site.org/x')
    expect(screen.getByRole('status')).toHaveTextContent('Lien copié')
  })
})
```

Run : `npm test -- share-buttons`
Expected : FAIL.

- [ ] **Step 2 : `ShareButtons`**

`src/components/article/ShareButtons.tsx` :

```tsx
'use client'
import { useState } from 'react'
import FacebookIcon from '@/components/ui/FacebookIcon'
import Icon from '@/components/ui/Icon'

type Props = { url: string; labels: { share: string; copyLink: string; linkCopied: string } }

export default function ShareButtons({ url, labels }: Props) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-bold text-foreground">{labels.share}</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-arrow inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold"
        style={{ background: '#1877F2', color: '#fff' }}
      >
        <FacebookIcon size={15} color="#fff" /> Facebook
      </a>
      <button type="button" onClick={copy} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold border border-border text-foreground">
        <Icon i="link-2" size={15} /> {labels.copyLink}
      </button>
      <span role="status" className="text-sm text-primary font-medium">
        {copied ? labels.linkCopied : ''}
      </span>
    </div>
  )
}
```

Run : `npm test -- share-buttons`
Expected : PASS.

- [ ] **Step 3 : porter les blocs de l'article et de la liste**

Appliquer les règles P1 à P10 :

| Composant | Source (`72dc396`) | Props | Liaisons |
|---|---|---|---|
| `src/components/article/ArticleHero.tsx` | `ArticleDesktop.jsx` l.34-88 | `{ image?: Media \| number \| null; category?: string \| null; title: string; dateLabel?: string \| null; source?: { label?: string \| null; url?: string \| null } \| null; newTabLabel: string }` | image en fond via `MediaImage fill decorative eager` ; badge = `category` ; `h1` = `title` ; date = `dateLabel` ; le bouton « Voir sur Facebook » devient `<Cta variant="gold" href={source.url} label={source.label} />`, affiché seulement si les deux existent |
| `src/components/article/ArticleBody.tsx` | `ArticleDesktop.jsx` l.91-180 | `{ lead?: string \| null; body?: string \| null; meta: { label: string; value: string }[]; source?: { label?: string \| null; url?: string \| null } \| null; share: { url: string; labels: … } }` | colonne principale : `lead` en `text-xl` puis `<Paragraphs text={body} />` ; tous les intertitres et textes d'exemple (« Le contexte », « Déroulement », « Résultats », « Perspectives ») sont supprimés. Encadré latéral : la liste `meta` (lignes Catégorie et Date du prototype) et le lien source ; la ligne « Partenaires : À préciser » est supprimée ; `ShareButtons` remplace les boutons de partage du prototype |
| `src/components/news/ActualitesHero.tsx` | `ActualitesDesktop.jsx` l.19-110 | `{ eyebrow: string; title: string; intro?: string \| null; images: Media[] }` | badge = `eyebrow`, `h1` = `<EmphasisText text={title} />`, intro ; images décoratives prises dans l'ordre de `images` |

- [ ] **Step 4 : test e2e (doit échouer)**

`tests/e2e/actualites.spec.ts` :

```ts
import { expect, test } from '@playwright/test'

test('liste des actualités FR', async ({ page }) => {
  await page.goto('/fr/actualites')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('La vie de Terre d’Avenir')
  await expect(page.locator('article')).toHaveCount(3)
  await expect(page.getByRole('link', { name: /Toutes les publications sur Facebook/ })).toHaveAttribute('target', '_blank')
})

test('article FR avec sa source', async ({ page }) => {
  await page.goto('/fr/actualites')
  await page.getByRole('link', { name: 'Lire l’article' }).first().click()
  await expect(page).toHaveURL(/\/fr\/actualites\/tournoi-komo-kango-terre-davenir$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Le tournoi Komo-Kango Terre d’Avenir')
  await expect(page.getByText('8 août 2026').first()).toBeVisible()
  await expect(page.getByText('Le contexte')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Sur Facebook/ }).first()).toHaveAttribute('href', /facebook\.com/)
})

test('article EN et slug inconnu', async ({ page }) => {
  await page.goto('/en/actualites/un-jeune-un-permis')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('One young person, one licence')
  const res = await page.goto('/fr/actualites/inexistant')
  expect(res?.status()).toBe(404)
  await expect(page.getByText('Page introuvable')).toBeVisible()
})
```

Run : `npm run test:e2e -- actualites`
Expected : FAIL.

- [ ] **Step 5 : pages**

`src/app/(site)/[locale]/actualites/page.tsx` :

```tsx
import { notFound } from 'next/navigation'
import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'
import ActualitesHero from '@/components/news/ActualitesHero'
import { CtaList } from '@/components/ui/Cta'
import CtaBand from '@/components/ui/CtaBand'
import NewsCard from '@/components/ui/NewsCard'
import { Paragraphs } from '@/components/ui/Paragraphs'
import SectionHeader from '@/components/ui/SectionHeader'
import type { Media } from '@/payload-types'
import { getActualites, getPage, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('actualites', '/actualites')

export default async function ActualitesPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, actualites, reglages] = await Promise.all([getPage('actualites', locale), getActualites(locale), getReglages(locale)])
  if (!page) notFound()
  const liste = getSection(page, 'liste')
  const fin = getSection(page, 'fin')
  const images = (reglages.heroImages ?? []).filter((m): m is Media => typeof m === 'object' && m !== null)

  return (
    <>
      <ActualitesHero eyebrow={dict.nav.actualites} title={page.h1 ?? ''} intro={page.intro} images={images} />
      <section className="bg-background py-24">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {liste?.heading && <SectionHeader overline={liste.eyebrow} title={liste.heading} />}
            <CtaList locale={locale} ctas={liste?.ctas} newTabLabel={dict.common.newTab} />
          </Reveal>
          {actualites.length > 0 ? (
            <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actualites.map((a) => (
                <NewsCard key={a.id} locale={locale} actualite={a} labels={{ readArticle: dict.common.readArticle, newTab: dict.common.newTab }} />
              ))}
            </RevealGroup>
          ) : (
            <Paragraphs text={getSection(page, 'vide')?.body} />
          )}
        </div>
      </section>
      <CtaBand locale={locale} ctas={fin?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
```

`src/app/(site)/[locale]/actualites/[slug]/page.tsx` :

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleBody from '@/components/article/ArticleBody'
import ArticleHero from '@/components/article/ArticleHero'
import { RevealGroup } from '@/components/motion/RevealGroup'
import CtaBand from '@/components/ui/CtaBand'
import NewsCard from '@/components/ui/NewsCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { getActualite, getActualites, getPage } from '@/lib/content'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import { getSection } from '@/lib/sections'
import { SITE_NAME, pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const actualite = await getActualite(slug, locale)
  if (!actualite) return {}
  const image = typeof actualite.image === 'object' ? actualite.image?.url : undefined
  return pageMetadata({ locale, path: `/actualites/${slug}`, title: `${actualite.title} — ${SITE_NAME}`, description: actualite.excerpt, image })
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const [actualite, all, listPage] = await Promise.all([getActualite(slug, locale), getActualites(locale), getPage('actualites', locale)])
  if (!actualite) notFound()
  const others = all.filter((a) => a.slug !== slug).slice(0, 3)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const meta = [
    actualite.category ? { label: dict.common.category, value: actualite.category } : null,
    actualite.dateLabel ? { label: dict.common.date, value: actualite.dateLabel } : null,
  ].filter((m): m is { label: string; value: string } => m !== null)

  return (
    <>
      <ArticleHero
        image={actualite.image}
        category={actualite.category}
        title={actualite.title}
        dateLabel={actualite.dateLabel}
        source={actualite.source}
        newTabLabel={dict.common.newTab}
      />
      <ArticleBody
        lead={actualite.excerpt}
        body={actualite.body}
        meta={meta}
        source={actualite.source}
        share={{ url: siteUrl + localizedHref(locale, `/actualites/${slug}`), labels: { share: dict.common.share, copyLink: dict.common.copyLink, linkCopied: dict.common.linkCopied } }}
      />
      {others.length > 0 && (
        <section className="bg-background py-20">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
            <SectionHeader overline={dict.nav.actualites} title={dict.common.otherNews} />
            <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.map((a) => (
                <NewsCard key={a.id} locale={locale} actualite={a} labels={{ readArticle: dict.common.readArticle, newTab: dict.common.newTab }} />
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
      <CtaBand locale={locale} ctas={getSection(listPage, 'fin')?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
```

- [ ] **Step 6 : tests**

Run : `npm test`, puis `npm run test:e2e -- actualites`
Expected : PASS.

- [ ] **Step 7 : commit**

```powershell
git add -A
git commit -m "feat: actualités (liste et article) avec sources et partage" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11 : Projets & actions (liste et fiche)

**Files :**
- Create : `src/components/ui/ProjetCard.tsx`
- Create : `src/app/(site)/[locale]/projets/page.tsx`, `src/app/(site)/[locale]/projets/[slug]/page.tsx`
- Test : `tests/e2e/projets.spec.ts`

**Interfaces :**
- Consumes : `ArticleHero` et `ArticleBody` (tâche 10), `PageHero`, `CtaBand`, `MediaImage` (tâche 8).
- Produces : `ProjetCard({ locale, projet, linkLabel })`.

- [ ] **Step 1 : test e2e (doit échouer)**

`tests/e2e/projets.spec.ts` :

```ts
import { expect, test } from '@playwright/test'

test('liste et fiche projet FR', async ({ page }) => {
  await page.goto('/fr/projets')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Des initiatives à découvrir')
  await expect(page.locator('article')).toHaveCount(4)
  await page.getByRole('link', { name: /Santé & sensibilisation/ }).click()
  await expect(page).toHaveURL(/\/fr\/projets\/sante-sensibilisation$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Faire circuler l’information utile.')
  await expect(page.getByText(/Société Gabonaise de Périnatologie/)).toBeVisible()
  await expect(page.getByRole('link', { name: /Consulter la publication/ }).first()).toHaveAttribute('target', '_blank')
})

test('fiche projet EN', async ({ page }) => {
  await page.goto('/en/projets/sport-cohesion')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Coming together around football.')
})
```

Run : `npm run test:e2e -- projets`
Expected : FAIL.

- [ ] **Step 2 : carte projet**

`src/components/ui/ProjetCard.tsx` (même structure visuelle que `NewsCard`, issue de la maquette) :

```tsx
import Link from 'next/link'
import type { Projet } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { localizedHref } from '@/lib/i18n/paths'
import Icon from './Icon'
import { MediaImage } from './MediaImage'

export default function ProjetCard({ locale, projet, linkLabel }: { locale: Locale; projet: Projet; linkLabel: string }) {
  const href = localizedHref(locale, `/projets/${projet.slug}`)
  return (
    <article className="card-lift bg-background rounded-lg border border-border overflow-hidden flex flex-col" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="card-media relative" style={{ height: 196 }}>
        <MediaImage media={projet.image} sizes="(min-width: 1024px) 400px, 100vw" className="w-full h-full object-cover" />
        <span className="absolute left-4 top-4 w-11 h-11 rounded-md flex items-center justify-center" style={{ background: '#F0F5EF' }}>
          <Icon i={projet.icon ?? 'target'} size={22} className="text-primary" />
        </span>
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h2 className="text-lg font-bold text-foreground leading-snug font-headings">
          <Link href={href} className="title-underline">
            {projet.theme}
          </Link>
        </h2>
        {projet.summary && <p className="text-sm text-muted-foreground font-body leading-relaxed">{projet.summary}</p>}
        <Link href={href} className="btn-arrow text-sm font-bold text-primary flex items-center gap-1 mt-auto pt-3" aria-hidden="true" tabIndex={-1}>
          {linkLabel} <Icon i="arrow-right" size={13} />
        </Link>
      </div>
    </article>
  )
}
```

Le second lien est masqué aux technologies d'assistance (`aria-hidden`, `tabIndex={-1}`) : le titre est le lien accessible, ce qui évite d'annoncer deux fois le même lien.

- [ ] **Step 3 : pages**

`src/app/(site)/[locale]/projets/page.tsx` :

```tsx
import { notFound } from 'next/navigation'
import { RevealGroup } from '@/components/motion/RevealGroup'
import CtaBand from '@/components/ui/CtaBand'
import PageHero from '@/components/ui/PageHero'
import { Paragraphs } from '@/components/ui/Paragraphs'
import ProjetCard from '@/components/ui/ProjetCard'
import { getPage, getProjets, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('projets', '/projets')

export default async function ProjetsPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, projets, reglages] = await Promise.all([getPage('projets', locale), getProjets(locale), getReglages(locale)])
  if (!page) notFound()
  return (
    <>
      <PageHero eyebrow={dict.nav.projets} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[3]} />
      <section className="bg-background py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          {projets.length > 0 ? (
            <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projets.map((p) => (
                <ProjetCard key={p.id} locale={locale} projet={p} linkLabel={dict.common.learnMore} />
              ))}
            </RevealGroup>
          ) : (
            <Paragraphs text={getSection(page, 'vide')?.body} />
          )}
        </div>
      </section>
      <CtaBand locale={locale} ctas={getSection(page, 'fin')?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
```

`src/app/(site)/[locale]/projets/[slug]/page.tsx` :

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleBody from '@/components/article/ArticleBody'
import ArticleHero from '@/components/article/ArticleHero'
import { RevealGroup } from '@/components/motion/RevealGroup'
import CtaBand from '@/components/ui/CtaBand'
import ProjetCard from '@/components/ui/ProjetCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { getPage, getProjet, getProjets } from '@/lib/content'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import { getSection } from '@/lib/sections'
import { SITE_NAME, pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const projet = await getProjet(slug, locale)
  if (!projet) return {}
  return pageMetadata({ locale, path: `/projets/${slug}`, title: `${projet.theme} — ${SITE_NAME}`, description: projet.summary })
}

export default async function ProjetPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const [projet, all, listPage] = await Promise.all([getProjet(slug, locale), getProjets(locale), getPage('projets', locale)])
  if (!projet) notFound()
  const others = all.filter((p) => p.slug !== slug)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return (
    <>
      <ArticleHero image={projet.image} category={projet.theme} title={projet.title ?? projet.theme} source={projet.source} newTabLabel={dict.common.newTab} />
      <ArticleBody
        body={projet.body}
        meta={[{ label: dict.common.category, value: projet.theme }]}
        source={projet.source}
        share={{ url: siteUrl + localizedHref(locale, `/projets/${slug}`), labels: { share: dict.common.share, copyLink: dict.common.copyLink, linkCopied: dict.common.linkCopied } }}
      />
      {others.length > 0 && (
        <section className="py-20" style={{ background: '#F7F8F4' }}>
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
            <SectionHeader overline={dict.nav.projets} title={dict.common.otherProjects} />
            <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {others.map((p) => (
                <ProjetCard key={p.id} locale={locale} projet={p} linkLabel={dict.common.learnMore} />
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
      <CtaBand locale={locale} ctas={getSection(listPage, 'fin')?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
```

- [ ] **Step 4 : tests**

Run : `npm test`, puis `npm run test:e2e -- projets`
Expected : PASS.

- [ ] **Step 5 : commit**

```powershell
git add -A
git commit -m "feat: projets & actions (liste et fiches documentées)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12 : L'ONG, Mot de la présidente, Organisation

**Files :**
- Create : `src/components/ong/OngHero.tsx`, `src/components/ui/FaqList.tsx`, `src/components/ui/QuoteMark.tsx`
- Create : `src/app/(site)/[locale]/ong/page.tsx`, `src/app/(site)/[locale]/mot-de-la-presidente/page.tsx`, `src/app/(site)/[locale]/organisation/page.tsx`
- Modify : `src/components/home/MotTeaser.tsx` (utilise `QuoteMark`)
- Test : `tests/unit/faq-list.test.tsx`, `tests/e2e/institution.spec.ts`

**Interfaces :**
- Consumes : `MissionStrip`, `ThemesSection`, `ParticiperSection` (tâche 9) ; `ContentSection`, `PageHero`, `CtaList`, `Paragraphs` (tâche 8).
- Produces :
  - `FaqList({ section, headingLevel? })` ;
  - `QuoteMark({ size? })`, le bloc typographique vert à guillemet doré, qui remplace tout portrait non autorisé ;
  - `OngHero({ eyebrow, title, intro?, image? })`.

- [ ] **Step 1 : test de `FaqList` (doit échouer)**

`tests/unit/faq-list.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import FaqList from '@/components/ui/FaqList'

const section = {
  key: 'faq',
  heading: 'Avant de déposer votre demande',
  items: [
    { title: 'L’envoi du formulaire me rend-il membre ?', text: 'Non.' },
    { title: '[QUESTION À VALIDER]', text: 'x' },
  ],
}

describe('FaqList', () => {
  it('affiche les questions validées, repliées par défaut', async () => {
    render(<FaqList section={section as never} />)
    expect(screen.getByRole('heading', { name: 'Avant de déposer votre demande' })).toBeInTheDocument()
    expect(screen.queryByText(/QUESTION À VALIDER/)).toBeNull()
    const summary = screen.getByText('L’envoi du formulaire me rend-il membre ?')
    expect(summary.closest('details')).not.toHaveAttribute('open')
    await userEvent.click(summary)
    expect(summary.closest('details')).toHaveAttribute('open')
  })
})
```

Run : `npm test -- faq-list`
Expected : FAIL.

- [ ] **Step 2 : composants**

`src/components/ui/FaqList.tsx` :

```tsx
import { Reveal } from '@/components/motion/Reveal'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'
import Icon from './Icon'
import { Paragraphs } from './Paragraphs'

export default function FaqList({ section, headingLevel = 2 }: { section?: Section; headingLevel?: 2 | 3 }) {
  const items = (section?.items ?? []).filter((item) => !isPlaceholder(item.title) && !isPlaceholder(item.text))
  if (items.length === 0) return null
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <Reveal className="flex flex-col gap-6">
      {section?.heading && <Heading className="text-3xl font-bold text-foreground font-headings">{section.heading}</Heading>}
      <div className="border-t border-border">
        {items.map((item, i) => (
          <details key={item.id ?? i} className="group border-b border-border py-5">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-lg font-bold text-foreground font-headings">
              {item.title}
              <Icon i="chevron-down" size={20} className="text-primary flex-shrink-0 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="pt-3">
              <Paragraphs text={item.text} className="text-base text-muted-foreground leading-relaxed" />
            </div>
          </details>
        ))}
      </div>
    </Reveal>
  )
}
```

`src/components/ui/QuoteMark.tsx` :

```tsx
import Icon from './Icon'

/** Composition typographique sans visage (Textes v1.3, PAGE-02 : pas de portrait non autorisé). */
export default function QuoteMark({ size = 64 }: { size?: number }) {
  return (
    <div className="w-full aspect-square max-w-[360px] rounded-xl flex items-center justify-center" style={{ background: '#003E2A' }} aria-hidden="true">
      <Icon i="quote" size={size} style={{ color: '#E6BF58' }} />
    </div>
  )
}
```

Dans `src/components/home/MotTeaser.tsx`, remplacer le bloc vert créé à la tâche 9 par `<QuoteMark />`.

`src/components/ong/OngHero.tsx` : portage de `72dc396:src/screens/OngDetailAdhesionDesktop.jsx`, lignes 59-102 (règles P1 à P10). Props : `{ eyebrow: string; title: string; intro?: string | null; image?: Media | number | null }`. Liaisons :
- le badge « Qui sommes-nous » devient `eyebrow` ;
- le `h1` devient `<EmphasisText text={title} />` ;
- le paragraphe devient `intro` ;
- l'image devient `MediaImage fill decorative eager` ;
- les boutons du hero, s'il y en a, sont supprimés (les liens sont dans les sections).

- [ ] **Step 3 : test e2e (doit échouer)**

`tests/e2e/institution.spec.ts` :

```ts
import { expect, test } from '@playwright/test'

test('L’ONG', async ({ page }) => {
  await page.goto('/fr/ong')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terre d’Avenir KOMO-KANGO')
  await expect(page.getByRole('heading', { name: 'Une ONG ancrée dans son territoire' })).toBeVisible()
  for (const text of ['Nos valeurs', 'Fondée en 2022', 'Durabilité']) await expect(page.getByText(text)).toHaveCount(0)
})

test('Mot de la présidente sans signature non validée', async ({ page }) => {
  await page.goto('/fr/mot-de-la-presidente')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Le mot de la présidente')
  await expect(page.getByText('Chères filles et chers fils du Komo-Kango,', { exact: false })).toBeVisible()
  await expect(page.getByText(/À CONFIRMER/)).toHaveCount(0)
  await expect(page.locator('main img:not([alt=""])')).toHaveCount(0) // aucun portrait ni image signifiante
})

test('Organisation : état « en préparation » et FAQ', async ({ page }) => {
  await page.goto('/en/organisation')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our organization')
  await expect(page.getByText('The presentation of our organization is being prepared.', { exact: false })).toBeVisible()
  await page.getByText('How can I contact the NGO?').click()
  await expect(page.getByText(/not published automatically/)).toBeVisible()
})
```

Run : `npm run test:e2e -- institution`
Expected : FAIL.

- [ ] **Step 4 : pages**

`src/app/(site)/[locale]/ong/page.tsx` :

```tsx
import { notFound } from 'next/navigation'
import MissionStrip from '@/components/home/MissionStrip'
import ParticiperSection from '@/components/home/ParticiperSection'
import ThemesSection from '@/components/home/ThemesSection'
import OngHero from '@/components/ong/OngHero'
import ContentSection from '@/components/ui/ContentSection'
import { getPage, getProjets, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('ong', '/ong')

export default async function OngPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, projets, reglages] = await Promise.all([getPage('ong', locale), getProjets(locale), getReglages(locale)])
  if (!page) notFound()
  const section = (key: string) => getSection(page, key)
  return (
    <>
      <OngHero eyebrow={dict.nav.ong} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[2]} />
      <MissionStrip items={section('reperes')?.items ?? []} />
      <ContentSection locale={locale} section={section('ancrage')} newTabLabel={dict.common.newTab} />
      <ThemesSection locale={locale} section={section('engagements')} projets={projets} overline={dict.nav.projets} linkLabel={dict.common.learnMore} />
      <ContentSection locale={locale} section={section('demarche')} tone="light" newTabLabel={dict.common.newTab} />
      <ParticiperSection locale={locale} section={section('participer')} newTabLabel={dict.common.newTab} />
    </>
  )
}
```

`src/app/(site)/[locale]/mot-de-la-presidente/page.tsx` :

```tsx
import { notFound } from 'next/navigation'
import { Reveal } from '@/components/motion/Reveal'
import { CtaList } from '@/components/ui/Cta'
import PageHero from '@/components/ui/PageHero'
import { Paragraphs } from '@/components/ui/Paragraphs'
import QuoteMark from '@/components/ui/QuoteMark'
import { getPage, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('mot-de-la-presidente', '/mot-de-la-presidente')

export default async function MotPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, reglages] = await Promise.all([getPage('mot-de-la-presidente', locale), getReglages(locale)])
  if (!page) notFound()
  const message = getSection(page, 'message')
  return (
    <>
      <PageHero eyebrow={dict.nav.mot} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[0]} />
      <section className="bg-background py-24">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-16 items-start">
          <Reveal className="lg:sticky lg:top-28">
            <QuoteMark />
          </Reveal>
          <Reveal className="flex flex-col gap-10 max-w-[720px]">
            <Paragraphs text={message?.body} className="text-lg text-foreground leading-relaxed" />
            <CtaList locale={locale} ctas={message?.ctas} newTabLabel={dict.common.newTab} />
          </Reveal>
        </div>
      </section>
    </>
  )
}
```

`src/app/(site)/[locale]/organisation/page.tsx` :

```tsx
import { notFound } from 'next/navigation'
import ContentSection from '@/components/ui/ContentSection'
import FaqList from '@/components/ui/FaqList'
import PageHero from '@/components/ui/PageHero'
import { getPage, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('organisation', '/organisation')

export default async function OrganisationPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, reglages] = await Promise.all([getPage('organisation', locale), getReglages(locale)])
  if (!page) notFound()
  return (
    <>
      <PageHero eyebrow={dict.nav.organisation} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[6]} />
      <ContentSection locale={locale} section={getSection(page, 'organigramme')} newTabLabel={dict.common.newTab} />
      <ContentSection locale={locale} section={getSection(page, 'demarche')} tone="light" newTabLabel={dict.common.newTab} />
      <section className="bg-background py-20">
        <div className="max-w-[880px] mx-auto px-6">
          <FaqList section={getSection(page, 'faq')} />
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 5 : tests**

Run : `npm test`, puis `npm run test:e2e -- institution`
Expected : PASS.

- [ ] **Step 6 : commit**

```powershell
git add -A
git commit -m "feat: pages L'ONG, Mot de la présidente et Organisation" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13 : Adhésion et Contact (formulaires affichés, désactivés)

**Files :**
- Create : `src/components/forms/ClosedNotice.tsx`, `src/components/forms/AdhesionForm.tsx`, `src/components/forms/ContactForm.tsx`, `src/components/forms/StepsSection.tsx`
- Create : `src/app/(site)/[locale]/adhesion/page.tsx`, `src/app/(site)/[locale]/contact/page.tsx`
- Test : `tests/unit/forms.test.tsx`, `tests/e2e/formulaires.spec.ts`

**Interfaces :**
- Consumes : `Dictionary['adhesionForm']`, `Dictionary['contactForm']` (tâche 2) ; `FaqList` (tâche 12) ; `PageHero`, `CtaList`, `Paragraphs` (tâche 8).
- Produces :
  - `ClosedNotice({ locale, text?, ctas?, newTabLabel })` ;
  - `AdhesionForm({ locale, labels })`, `ContactForm({ labels })` ;
  - `StepsSection({ section })`.

- [ ] **Step 1 : test des formulaires (doit échouer)**

`tests/unit/forms.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AdhesionForm from '@/components/forms/AdhesionForm'
import ContactForm from '@/components/forms/ContactForm'
import { getDictionary } from '@/lib/i18n/dictionaries'

const dict = getDictionary('fr')

describe('formulaires du lot 1', () => {
  it('adhésion : champs des Textes v1.3, tous désactivés, sans action', () => {
    const { container } = render(<AdhesionForm locale="fr" labels={dict.adhesionForm} />)
    const form = container.querySelector('form')!
    expect(form).not.toHaveAttribute('action')
    expect(form.querySelector('fieldset')).toBeDisabled()
    for (const label of ['Nom *', 'Prénom(s) *', 'Téléphone avec indicatif international *', 'Votre motivation (facultatif)']) {
      expect(screen.getByLabelText(label)).toBeDisabled()
    }
    expect(screen.getAllByRole('checkbox')).toHaveLength(6) // 5 centres d’intérêt + la case d’information
    expect(screen.getByRole('button', { name: 'Envoyer ma demande' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.queryByLabelText(/Genre|Date de naissance/)).toBeNull()
  })
  it('contact : désactivé', () => {
    render(<ContactForm labels={dict.contactForm} />)
    expect(screen.getByLabelText('Votre message')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Envoyer le message' })).toBeDisabled()
  })
})
```

Run : `npm test -- forms`
Expected : FAIL.

- [ ] **Step 2 : composants de formulaire**

Les classes des champs reprennent celles des champs du prototype (`72dc396:src/screens/OngDetailAdhesionDesktop.jsx`, l.288-420, par exemple l'input `#member-name`). Avant d'écrire `FIELD`, ouvrir ce passage et copier la chaîne `className` exacte de l'input et du label.

`src/components/forms/AdhesionForm.tsx` :

```tsx
import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { localizedHref } from '@/lib/i18n/paths'

const LABEL = 'block text-sm font-bold text-foreground mb-2'
const FIELD = 'w-full rounded-md border border-border bg-input px-4 py-3 text-base text-foreground disabled:opacity-70'
const HELP = 'mt-1.5 text-xs text-muted-foreground'

type Props = { locale: Locale; labels: Dictionary['adhesionForm'] }

/** Formulaire affiché pour information : l'adhésion en ligne n'est pas encore ouverte (lot 1). */
export default function AdhesionForm({ locale, labels }: Props) {
  return (
    <form noValidate aria-disabled="true" className="bg-background rounded-lg border border-border p-8 flex flex-col gap-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <fieldset disabled className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="adh-nom" className={LABEL}>{labels.lastName}</label>
          <input id="adh-nom" name="nom" autoComplete="family-name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="adh-prenoms" className={LABEL}>{labels.firstNames}</label>
          <input id="adh-prenoms" name="prenoms" autoComplete="given-name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="adh-tel" className={LABEL}>{labels.phone}</label>
          <input id="adh-tel" name="telephone" type="tel" autoComplete="tel" aria-describedby="adh-tel-aide" className={FIELD} />
          <p id="adh-tel-aide" className={HELP}>{labels.helpPhone}</p>
        </div>
        <div>
          <label htmlFor="adh-email" className={LABEL}>{labels.email}</label>
          <input id="adh-email" name="email" type="email" autoComplete="email" aria-describedby="adh-email-aide" className={FIELD} />
          <p id="adh-email-aide" className={HELP}>{labels.helpEmail}</p>
        </div>
        <div>
          <label htmlFor="adh-pays" className={LABEL}>{labels.country}</label>
          <input id="adh-pays" name="pays" autoComplete="country-name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="adh-ville" className={LABEL}>{labels.city}</label>
          <input id="adh-ville" name="ville" autoComplete="address-level2" className={FIELD} />
        </div>
        <fieldset className="md:col-span-2" aria-describedby="adh-interets-aide">
          <legend className={LABEL}>{labels.interests}</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {labels.interestOptions.map((option, i) => (
              <label key={option} htmlFor={`adh-interet-${i}`} className="inline-flex items-center gap-2 text-base text-foreground">
                <input id={`adh-interet-${i}`} type="checkbox" name="interets" value={option} className="h-5 w-5 accent-[#005C38]" />
                {option}
              </label>
            ))}
          </div>
          <p id="adh-interets-aide" className={HELP}>{labels.helpInterests}</p>
        </fieldset>
        <div className="md:col-span-2">
          <label htmlFor="adh-motivation" className={LABEL}>{labels.motivation}</label>
          <textarea id="adh-motivation" name="motivation" rows={5} maxLength={1000} aria-describedby="adh-motivation-aide" className={FIELD} />
          <p id="adh-motivation-aide" className={HELP}>{labels.helpMotivation}</p>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="adh-notice" className="inline-flex items-start gap-3 text-base text-foreground">
            <input id="adh-notice" type="checkbox" name="notice" className="mt-1 h-5 w-5 accent-[#005C38]" />
            <span>{labels.notice}</span>
          </label>
        </div>
      </fieldset>
      <p className="text-sm">
        <Link href={localizedHref(locale, '/confidentialite')} className="font-bold text-primary underline">
          {labels.noticeLink}
        </Link>
      </p>
      <div>
        <button type="button" aria-disabled="true" className="font-bold text-base px-8 py-3 rounded-md font-body opacity-60" style={{ background: '#E6BF58', color: '#17372C' }}>
          {labels.submit}
        </button>
      </div>
    </form>
  )
}
```

Le bouton reste focalisable (`aria-disabled` plutôt que `disabled`), pour que les lecteurs d'écran l'annoncent. Il est de type `button` et sans gestionnaire : aucun envoi n'est possible.

`src/components/forms/ContactForm.tsx` :

```tsx
import type { Dictionary } from '@/lib/i18n/dictionaries'

const LABEL = 'block text-sm font-bold text-foreground mb-2'
const FIELD = 'w-full rounded-md border border-border bg-input px-4 py-3 text-base text-foreground disabled:opacity-70'

export default function ContactForm({ labels }: { labels: Dictionary['contactForm'] }) {
  return (
    <form noValidate aria-disabled="true" className="flex flex-col gap-5">
      <fieldset disabled className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="ct-nom" className={LABEL}>{labels.lastName}</label>
          <input id="ct-nom" autoComplete="family-name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="ct-prenom" className={LABEL}>{labels.firstName}</label>
          <input id="ct-prenom" autoComplete="given-name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="ct-email" className={LABEL}>{labels.email}</label>
          <input id="ct-email" type="email" autoComplete="email" className={FIELD} />
        </div>
        <div>
          <label htmlFor="ct-tel" className={LABEL}>{labels.phone}</label>
          <input id="ct-tel" type="tel" autoComplete="tel" className={FIELD} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="ct-org" className={LABEL}>{labels.organisation}</label>
          <input id="ct-org" autoComplete="organization" className={FIELD} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="ct-message" className={LABEL}>{labels.message}</label>
          <textarea id="ct-message" rows={6} className={FIELD} />
        </div>
        <div>
          <button type="button" disabled className="font-bold text-base px-8 py-3 rounded-md font-body bg-primary text-primary-foreground opacity-60">
            {labels.submit}
          </button>
        </div>
      </fieldset>
    </form>
  )
}
```

`src/components/forms/ClosedNotice.tsx` :

```tsx
import { CtaList } from '@/components/ui/Cta'
import Icon from '@/components/ui/Icon'
import type { Locale } from '@/lib/i18n/config'
import { isPlaceholder } from '@/lib/text'

type Props = { locale: Locale; text?: string | null; ctas?: { label: string; href: string; id?: string | null }[] | null; newTabLabel: string }

export default function ClosedNotice({ locale, text, ctas, newTabLabel }: Props) {
  if (isPlaceholder(text)) return null
  return (
    <div role="note" className="rounded-lg p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between" style={{ background: '#E6BF5826', border: '1px solid #E6BF58' }}>
      <p className="flex items-start gap-3 text-base text-foreground font-medium">
        <Icon i="lock" size={20} className="text-primary flex-shrink-0 mt-0.5" />
        {text}
      </p>
      <CtaList locale={locale} ctas={ctas} newTabLabel={newTabLabel} />
    </div>
  )
}
```

`src/components/forms/StepsSection.tsx` :

```tsx
import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'
import SectionHeader from '@/components/ui/SectionHeader'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'

export default function StepsSection({ section }: { section?: Section }) {
  const steps = (section?.items ?? []).filter((item) => !isPlaceholder(item.text))
  if (!section || steps.length === 0) return null
  return (
    <section className="py-20" style={{ background: '#F7F8F4' }}>
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
        {section.heading && (
          <Reveal>
            <SectionHeader title={section.heading} />
          </Reveal>
        )}
        <RevealGroup as="ol" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <li key={step.id ?? i} className="card-lift bg-background rounded-lg border border-border p-6 flex flex-col gap-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <span className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: '#E6BF58', color: '#003E2A' }} aria-hidden="true">
                {i + 1}
              </span>
              <p className="text-base text-foreground leading-relaxed">{step.text}</p>
            </li>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
```

Run : `npm test -- forms`
Expected : PASS.

- [ ] **Step 3 : test e2e (doit échouer)**

`tests/e2e/formulaires.spec.ts` :

```ts
import { expect, test } from '@playwright/test'

test('adhésion : non ouverte, aucun envoi possible', async ({ page }) => {
  const posts: string[] = []
  page.on('request', (r) => {
    if (r.method() !== 'GET') posts.push(r.url())
  })
  await page.goto('/fr/adhesion')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rejoindre Terre d’Avenir KOMO-KANGO')
  await expect(page.getByRole('note')).toContainText('ne sont pas encore ouvertes')
  await expect(page.getByLabel('Nom *')).toBeDisabled()
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click({ force: true })
  await page.getByText('Une cotisation est-elle prévue ?').click()
  await expect(page.getByText('Aucun paiement n’est demandé dans ce formulaire.')).toBeVisible()
  expect(posts).toEqual([])
})

test('contact : orientations, ancre partenariat, aucune coordonnée inventée', async ({ page }) => {
  await page.goto('/fr/contact')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Entrons en contact')
  await expect(page.locator('#partenariat')).toContainText('Partenariat et presse')
  await expect(page.getByLabel('Votre message')).toBeDisabled()
  for (const text of ['contact@terredavenir-komokango.org', '+241 XX', 'WhatsApp', 'BP :']) await expect(page.getByText(text)).toHaveCount(0)
})
```

Run : `npm run test:e2e -- formulaires`
Expected : FAIL.

- [ ] **Step 4 : pages**

`src/app/(site)/[locale]/adhesion/page.tsx` :

```tsx
import { notFound } from 'next/navigation'
import AdhesionForm from '@/components/forms/AdhesionForm'
import ClosedNotice from '@/components/forms/ClosedNotice'
import StepsSection from '@/components/forms/StepsSection'
import { Reveal } from '@/components/motion/Reveal'
import FaqList from '@/components/ui/FaqList'
import PageHero from '@/components/ui/PageHero'
import { Paragraphs } from '@/components/ui/Paragraphs'
import SectionHeader from '@/components/ui/SectionHeader'
import { getPage, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('adhesion', '/adhesion')

export default async function AdhesionPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, reglages] = await Promise.all([getPage('adhesion', locale), getReglages(locale)])
  if (!page) notFound()
  const section = (key: string) => getSection(page, key)
  const indisponible = section('indisponible')
  const formulaire = section('formulaire')
  return (
    <>
      <PageHero eyebrow={dict.nav.adhesion} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[1]} />
      <section className="bg-background pt-12">
        <div className="max-w-[1280px] mx-auto px-6">
          <ClosedNotice locale={locale} text={indisponible?.body} ctas={indisponible?.ctas} newTabLabel={dict.common.newTab} />
        </div>
      </section>
      <StepsSection section={section('etapes')} />
      <section id="formulaire" className="bg-background py-20">
        <div className="max-w-[960px] mx-auto px-6 flex flex-col gap-8">
          <Reveal className="flex flex-col gap-4">
            {formulaire?.heading && <SectionHeader title={formulaire.heading} />}
            <Paragraphs text={formulaire?.body} className="text-base text-muted-foreground" />
          </Reveal>
          <Reveal>
            <AdhesionForm locale={locale} labels={dict.adhesionForm} />
          </Reveal>
        </div>
      </section>
      <section className="py-20" style={{ background: '#F7F8F4' }}>
        <div className="max-w-[880px] mx-auto px-6">
          <FaqList section={section('faq')} />
        </div>
      </section>
    </>
  )
}
```

`src/app/(site)/[locale]/contact/page.tsx`. La mise en page à deux colonnes reprend `ContactDesktop.jsx` l.78-359 (grille `lg:grid-cols-3`) : la colonne gauche contient les 3 cartes d'orientation, à la place du bloc « Informations » inventé, et la colonne droite (2/3) le formulaire. Le bloc de localisation porte les lignes 362-385, avec une image décorative.

```tsx
import { notFound } from 'next/navigation'
import ClosedNotice from '@/components/forms/ClosedNotice'
import ContactForm from '@/components/forms/ContactForm'
import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'
import { CtaList } from '@/components/ui/Cta'
import Icon from '@/components/ui/Icon'
import { MediaImage } from '@/components/ui/MediaImage'
import PageHero from '@/components/ui/PageHero'
import { Paragraphs } from '@/components/ui/Paragraphs'
import { getPage, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('contact', '/contact')

const ORIENTATIONS = [
  { key: 'adhesion', icon: 'user-plus', anchor: undefined },
  { key: 'partenariat', icon: 'handshake', anchor: 'partenariat' },
  { key: 'question', icon: 'mail', anchor: undefined },
] as const

export default async function ContactPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, reglages] = await Promise.all([getPage('contact', locale), getReglages(locale)])
  if (!page) notFound()
  const section = (key: string) => getSection(page, key)
  const formulaire = section('formulaire')
  const localisation = section('localisation')

  return (
    <>
      <PageHero eyebrow={dict.nav.contact} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[0]} />
      <section className="bg-background py-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <RevealGroup className="flex flex-col gap-6">
            {ORIENTATIONS.map(({ key, icon, anchor }) => {
              const s = section(key)
              if (!s) return null
              return (
                <div key={key} id={anchor} className="card-lift bg-background rounded-lg border border-border p-6 flex flex-col gap-3 scroll-mt-28" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div className="w-11 h-11 rounded-md flex items-center justify-center" style={{ background: '#F0F5EF' }}>
                    <Icon i={icon} size={22} className="text-primary" />
                  </div>
                  {s.heading && <h2 className="text-xl font-bold text-foreground font-headings">{s.heading}</h2>}
                  <Paragraphs text={s.body} className="text-base text-muted-foreground leading-relaxed" />
                  <CtaList locale={locale} ctas={s.ctas} newTabLabel={dict.common.newTab} />
                </div>
              )
            })}
          </RevealGroup>
          <Reveal className="lg:col-span-2 bg-background rounded-lg border border-border p-8 flex flex-col gap-6" >
            {formulaire?.heading && <h2 className="text-2xl font-bold text-foreground font-headings">{formulaire.heading}</h2>}
            <ClosedNotice locale={locale} text={formulaire?.body} ctas={formulaire?.ctas} newTabLabel={dict.common.newTab} />
            <ContactForm labels={dict.contactForm} />
          </Reveal>
        </div>
      </section>
      {localisation && (
        <section className="bg-background pb-24">
          <Reveal className="max-w-[1280px] mx-auto px-6">
            {localisation.heading && <h2 className="text-2xl font-bold text-foreground font-headings mb-6">{localisation.heading}</h2>}
            <div className="relative w-full rounded-lg overflow-hidden flex items-center justify-center" style={{ height: 320, background: '#F7F8F4', border: '1px solid #e8e8e8' }}>
              <div className="absolute inset-0" style={{ opacity: 0.7 }}>
                <MediaImage media={reglages.heroImages?.[0]} fill decorative sizes="100vw" className="w-full h-full object-cover" />
              </div>
              <div className="absolute flex flex-col items-center gap-2">
                <div className="rounded-full w-12 h-12 flex items-center justify-center" style={{ background: '#005C38' }}>
                  <Icon i="map-pin" size={24} style={{ color: '#E6BF58' }} />
                </div>
                <div className="rounded-md px-4 py-2" style={{ background: '#003E2A', color: '#fff' }}>
                  <p className="text-sm font-bold font-body">{localisation.body}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}
    </>
  )
}
```

- [ ] **Step 5 : tests**

Run : `npm test`, puis `npm run test:e2e -- formulaires`
Expected : PASS.

- [ ] **Step 6 : commit**

```powershell
git add -A
git commit -m "feat: pages Adhésion et Contact avec formulaires affichés mais désactivés" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14 : Médiathèque et visionneuse

**Files :**
- Create : `src/components/media/Gallery.tsx`, `src/components/media/MediathequeHero.tsx`
- Create : `src/app/(site)/[locale]/mediatheque/page.tsx`
- Test : `tests/unit/gallery.test.tsx`, `tests/e2e/mediatheque.spec.ts`

**Interfaces :**
- Consumes : `getGalleryMedia`, `getReglages` (tâche 3) ; `Dictionary['gallery']` (tâche 2) ; `CtaBand`, `Paragraphs` (tâche 8).
- Produces :
  - `type GalleryItem = { id: string | number; url: string; alt: string; caption?: string | null; width: number; height: number }` ;
  - `Gallery({ items, labels })`.

- [ ] **Step 1 : test de la visionneuse (doit échouer)**

`tests/unit/gallery.test.tsx` :

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: ({ fill: _f, priority: _p, ...props }: Record<string, unknown>) => <img {...(props as object)} />,
}))

import Gallery from '@/components/media/Gallery'

beforeAll(() => {
  // jsdom n'implémente pas <dialog>.showModal()/close()
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

const labels = { open: 'Agrandir l’image', dialog: 'Visionneuse d’images', close: 'Fermer', previous: 'Image précédente', next: 'Image suivante' }
const items = [
  { id: 1, url: '/a.jpg', alt: 'Image A', caption: 'Légende A', width: 800, height: 600 },
  { id: 2, url: '/b.jpg', alt: 'Image B', caption: null, width: 800, height: 600 },
]

describe('Gallery', () => {
  it('ouvre, navigue au clavier et ferme', async () => {
    const { container } = render(<Gallery items={items} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: /Agrandir l’image : Image A/ }))
    const dialog = container.querySelector('dialog')!
    expect(dialog).toHaveAttribute('open')
    expect(screen.getByText('Légende A')).toBeInTheDocument()
    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(dialog.querySelector('figure img')).toHaveAttribute('alt', 'Image B')
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })
    expect(dialog.querySelector('figure img')).toHaveAttribute('alt', 'Image A')
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(dialog).not.toHaveAttribute('open')
  })
})
```

Run : `npm test -- gallery`
Expected : FAIL.

- [ ] **Step 2 : `Gallery`**

`src/components/media/Gallery.tsx` :

```tsx
'use client'
import Image from 'next/image'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { RevealGroup } from '@/components/motion/RevealGroup'
import Icon from '@/components/ui/Icon'

export type GalleryItem = { id: string | number; url: string; alt: string; caption?: string | null; width: number; height: number }
type Labels = { open: string; dialog: string; close: string; previous: string; next: string }

export default function Gallery({ items, labels }: { items: GalleryItem[]; labels: Labels }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (index !== null && !dialog.open) dialog.showModal()
    if (index === null && dialog.open) dialog.close()
  }, [index])

  const go = (delta: number) => setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length))
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') go(1)
    if (event.key === 'ArrowLeft') go(-1)
  }
  const current = index === null ? null : items[index]

  return (
    <>
      <RevealGroup as="ul" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={item.alt ? `${labels.open} : ${item.alt}` : labels.open}
              className="card-lift card-media block w-full rounded-lg overflow-hidden border border-border bg-light"
            >
              <Image src={item.url} alt="" width={item.width} height={item.height} sizes="(min-width: 1024px) 300px, 50vw" className="w-full aspect-square object-cover" />
            </button>
          </li>
        ))}
      </RevealGroup>

      <dialog
        ref={dialogRef}
        aria-label={labels.dialog}
        onClose={() => setIndex(null)}
        onKeyDown={onKeyDown}
        className="lightbox m-auto w-[min(96vw,1100px)] max-h-[92vh] bg-transparent p-0 text-primary-foreground"
      >
        {current && (
          <figure className="flex flex-col gap-3">
            <Image src={current.url} alt={current.alt} width={current.width} height={current.height} sizes="96vw" className="w-full max-h-[80vh] object-contain rounded-lg" />
            {current.caption && <figcaption className="text-center text-sm opacity-90">{current.caption}</figcaption>}
          </figure>
        )}
        <div className="mt-4 flex items-center justify-center gap-3">
          {items.length > 1 && (
            <button type="button" onClick={() => go(-1)} aria-label={labels.previous} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#E6BF58', color: '#003E2A' }}>
              <Icon i="chevron-left" size={22} />
            </button>
          )}
          <button type="button" onClick={() => setIndex(null)} aria-label={labels.close} className="w-11 h-11 rounded-full flex items-center justify-center bg-background text-foreground">
            <Icon i="x" size={22} />
          </button>
          {items.length > 1 && (
            <button type="button" onClick={() => go(1)} aria-label={labels.next} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#E6BF58', color: '#003E2A' }}>
              <Icon i="chevron-right" size={22} />
            </button>
          )}
        </div>
      </dialog>
    </>
  )
}
```

Run : `npm test -- gallery`
Expected : PASS.

- [ ] **Step 3 : hero de la médiathèque**

`src/components/media/MediathequeHero.tsx` : portage de `72dc396:src/screens/MediathequeDesktop.jsx`, lignes 189-247 (règles P1 à P10). Props : `{ eyebrow: string; title: string; intro?: string | null; image?: Media | number | null }`. Les compteurs et onglets éventuels du hero (Photos/Vidéos) sont supprimés. La barre de filtres (l.250-295) et le bloc « Contribuer » (l.362-410) ne sont pas portés.

- [ ] **Step 4 : test e2e (doit échouer)**

`tests/e2e/mediatheque.spec.ts` :

```ts
import { expect, test } from '@playwright/test'

test('médiathèque : médias réels uniquement, visionneuse', async ({ page }) => {
  await page.goto('/fr/mediatheque')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Médiathèque')
  const thumbs = page.getByRole('button', { name: /Agrandir l’image/ })
  await expect(thumbs).toHaveCount(1) // seule la bannière est marquée « galerie »
  await thumbs.first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  for (const text of ['Tournoi de football communautaire', 'Proposer un média']) await expect(page.getByText(text)).toHaveCount(0)
})
```

Run : `npm run test:e2e -- mediatheque`
Expected : FAIL.

- [ ] **Step 5 : page**

`src/app/(site)/[locale]/mediatheque/page.tsx` :

```tsx
import { notFound } from 'next/navigation'
import Gallery, { type GalleryItem } from '@/components/media/Gallery'
import MediathequeHero from '@/components/media/MediathequeHero'
import CtaBand from '@/components/ui/CtaBand'
import { Paragraphs } from '@/components/ui/Paragraphs'
import { getGalleryMedia, getPage, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('mediatheque', '/mediatheque')

export default async function MediathequePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, medias, reglages] = await Promise.all([getPage('mediatheque', locale), getGalleryMedia(locale), getReglages(locale)])
  if (!page) notFound()
  const items: GalleryItem[] = medias
    .filter((m) => m.url)
    .map((m) => ({
      id: m.id,
      url: m.url!,
      alt: m.provisoire ? '' : (m.alt ?? ''),
      caption: m.caption,
      width: m.width ?? 1600,
      height: m.height ?? 900,
    }))
  const facebook = getSection(page, 'facebook')

  return (
    <>
      <MediathequeHero eyebrow={dict.nav.mediatheque} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[4]} />
      <section className="bg-background py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          {items.length > 0 ? <Gallery items={items} labels={dict.gallery} /> : <Paragraphs text={getSection(page, 'vide')?.body} />}
        </div>
      </section>
      <CtaBand locale={locale} title={facebook?.heading} text={facebook?.body} ctas={facebook?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
```

- [ ] **Step 6 : tests**

Run : `npm test`, puis `npm run test:e2e -- mediatheque`
Expected : PASS.

- [ ] **Step 7 : commit**

```powershell
git add -A
git commit -m "feat: médiathèque avec visionneuse accessible" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15 : Partenariats, Transparence, Confidentialité, Mentions légales

**Files :**
- Create : `src/components/ui/TextPage.tsx`
- Create : `src/app/(site)/[locale]/partenariats/page.tsx`, `src/app/(site)/[locale]/transparence/page.tsx`, `src/app/(site)/[locale]/confidentialite/page.tsx`, `src/app/(site)/[locale]/mentions-legales/page.tsx`
- Test : `tests/e2e/pages-texte.spec.ts`

**Interfaces :**
- Consumes : `PageHero`, `ContentSection`, `CtaBand` (tâche 8) ; `getPage`, `getReglages` (tâche 3) ; `metadataFor` et `resolveLocale` (tâche 9).
- Produces : `TextPage({ slug, eyebrowKey, imageIndex, params })`, un Server Component asynchrone qui rend une page composée.

- [ ] **Step 1 : test e2e (doit échouer)**

`tests/e2e/pages-texte.spec.ts` :

```ts
import { expect, test } from '@playwright/test'

const PAGES = [
  { path: '/fr/partenariats', h1: 'Construire des coopérations utiles', must: 'Presse et information' },
  { path: '/fr/transparence', h1: 'Comprendre notre démarche', must: 'Aucun document public n’est disponible' },
  { path: '/fr/confidentialite', h1: 'Informations sur vos données personnelles', must: 'Liens externes' },
  { path: '/fr/mentions-legales', h1: 'Mentions légales', must: 'Terre d’Avenir KOMO-KANGO, ONG.' },
  { path: '/en/partenariats', h1: 'Building useful partnerships', must: 'Press and information' },
]

for (const { path, h1, must } of PAGES) {
  test(`page ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1)
    await expect(page.getByText(must, { exact: false }).first()).toBeVisible()
    await expect(page.getByText(/\[[^\]]+\]/)).toHaveCount(0)
    await expect(page.getByText('Stéphane')).toHaveCount(0)
  })
}
```

Run : `npm run test:e2e -- pages-texte`
Expected : FAIL.

- [ ] **Step 2 : gabarit commun**

`src/components/ui/TextPage.tsx` :

```tsx
import { notFound } from 'next/navigation'
import type { PageSlug } from '@/collections/Pages'
import { getPage, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { resolveLocale } from '@/lib/page'
import type { NavKey } from '@/lib/routes'
import ContentSection from './ContentSection'
import CtaBand from './CtaBand'
import PageHero from './PageHero'

type Props = { slug: PageSlug; eyebrowKey: NavKey; imageIndex: number; params: Promise<{ locale: string }> }

/** Page composée : hero + sections alternées ; une section « fin » devient la bande d'appel finale. */
export default async function TextPage({ slug, eyebrowKey, imageIndex, params }: Props) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, reglages] = await Promise.all([getPage(slug, locale), getReglages(locale)])
  if (!page) notFound()
  const sections = (page.sections ?? []).filter((s) => s.key !== 'fin')
  const fin = page.sections?.find((s) => s.key === 'fin')
  return (
    <>
      <PageHero eyebrow={dict.nav[eyebrowKey]} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[imageIndex]} />
      {sections.map((section, i) => (
        <ContentSection key={section.id ?? section.key} locale={locale} section={section} tone={i % 2 === 0 ? 'white' : 'light'} newTabLabel={dict.common.newTab} />
      ))}
      <CtaBand locale={locale} title={fin?.heading} text={fin?.body} ctas={fin?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
```

- [ ] **Step 3 : les quatre pages**

`src/app/(site)/[locale]/partenariats/page.tsx` :

```tsx
import TextPage from '@/components/ui/TextPage'
import { metadataFor, type LocaleParams } from '@/lib/page'

export const generateMetadata = metadataFor('partenariats', '/partenariats')

export default function PartenariatsPage({ params }: LocaleParams) {
  return <TextPage slug="partenariats" eyebrowKey="partenariats" imageIndex={6} params={params} />
}
```

`src/app/(site)/[locale]/transparence/page.tsx` :

```tsx
import TextPage from '@/components/ui/TextPage'
import { metadataFor, type LocaleParams } from '@/lib/page'

export const generateMetadata = metadataFor('transparence', '/transparence')

export default function TransparencePage({ params }: LocaleParams) {
  return <TextPage slug="transparence" eyebrowKey="transparence" imageIndex={2} params={params} />
}
```

`src/app/(site)/[locale]/confidentialite/page.tsx` :

```tsx
import TextPage from '@/components/ui/TextPage'
import { metadataFor, type LocaleParams } from '@/lib/page'

export const generateMetadata = metadataFor('confidentialite', '/confidentialite')

export default function ConfidentialitePage({ params }: LocaleParams) {
  return <TextPage slug="confidentialite" eyebrowKey="confidentialite" imageIndex={0} params={params} />
}
```

`src/app/(site)/[locale]/mentions-legales/page.tsx` :

```tsx
import TextPage from '@/components/ui/TextPage'
import { metadataFor, type LocaleParams } from '@/lib/page'

export const generateMetadata = metadataFor('mentions-legales', '/mentions-legales')

export default function MentionsLegalesPage({ params }: LocaleParams) {
  return <TextPage slug="mentions-legales" eyebrowKey="mentions" imageIndex={0} params={params} />
}
```

- [ ] **Step 4 : tests**

Run : `npm run test:e2e -- pages-texte`
Expected : PASS (5 pages × 2 projets).

- [ ] **Step 5 : commit**

```powershell
git add -A
git commit -m "feat: pages Partenariats, Transparence, Confidentialité et Mentions légales" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16 : Sitemap et robots.txt

**Files :**
- Modify : `src/lib/seo.ts` (ajout de `buildSitemapEntries`)
- Create : `src/app/sitemap.ts`, `src/app/robots.ts`
- Test : `tests/unit/seo.test.ts` (ajout)

**Interfaces :**
- Consumes : `STATIC_PATHS` (tâche 2) ; `getActualites`, `getProjets` (tâche 3).
- Produces : `buildSitemapEntries(baseUrl: string, paths: string[]): MetadataRoute.Sitemap`.

- [ ] **Step 1 : test (doit échouer)**

Ajouter à `tests/unit/seo.test.ts` :

```ts
import { buildSitemapEntries } from '@/lib/seo'

describe('buildSitemapEntries', () => {
  it('une entrée par langue active, avec alternates hreflang', () => {
    const entries = buildSitemapEntries('https://site.org', ['/', '/contact'])
    expect(entries.map((e) => e.url)).toEqual(['https://site.org/fr', 'https://site.org/en', 'https://site.org/fr/contact', 'https://site.org/en/contact'])
    expect(entries[2].alternates?.languages).toEqual({ fr: 'https://site.org/fr/contact', en: 'https://site.org/en/contact' })
  })
})
```

Run : `npm test -- seo`
Expected : FAIL (`buildSitemapEntries` n'est pas exportée).

- [ ] **Step 2 : implémenter**

Ajouter à `src/lib/seo.ts` :

```ts
import type { MetadataRoute } from 'next'
import { LOCALES } from './i18n/config'

export function buildSitemapEntries(baseUrl: string, paths: string[]): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: baseUrl + localizedHref(locale, path),
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, baseUrl + localizedHref(l, path)])) },
    })),
  )
}
```

(Regrouper ces imports avec ceux déjà en tête du fichier.)

`src/app/sitemap.ts` :

```ts
import type { MetadataRoute } from 'next'
import { getActualites, getProjets } from '@/lib/content'
import { STATIC_PATHS } from '@/lib/routes'
import { buildSitemapEntries } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const [actualites, projets] = await Promise.all([getActualites('fr'), getProjets('fr')])
  return buildSitemapEntries(base, [
    ...STATIC_PATHS,
    ...actualites.map((a) => `/actualites/${a.slug}`),
    ...projets.map((p) => `/projets/${p.slug}`),
  ])
}
```

`src/app/robots.ts` :

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${base}/sitemap.xml`,
  }
}
```

- [ ] **Step 3 : vérifier**

Run : `npm test`
Expected : PASS.

Run : `npm run dev`, puis ouvrir `/sitemap.xml` et `/robots.txt`.
Expected :
- le sitemap contient 40 URL (13 pages + 3 actualités + 4 projets, × 2 langues), avec des `xhtml:link hreflang` ;
- `robots.txt` interdit `/admin` et `/api`.

- [ ] **Step 4 : commit**

```powershell
git add -A
git commit -m "feat: sitemap multilingue et robots.txt" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17 : Recette transverse (accessibilité, sans JS, liens, mouvement réduit, captures)

**Files :**
- Create : `tests/e2e/helpers.ts`, `tests/e2e/transverse.spec.ts`, `tests/e2e/accessibilite.spec.ts`, `tests/e2e/captures.spec.ts`
- Create : `docs/recette/lot1.md` (rapport de recette)

**Interfaces :**
- Consumes : `STATIC_PATHS` (tâche 2) et l'ensemble des pages.
- Produces : `ALL_PATHS(locale): string[]`, la liste des URL publiques d'une langue (pages statiques, actualités et projets du seed).

- [ ] **Step 1 : liste des URL**

`tests/e2e/helpers.ts` :

```ts
import { STATIC_PATHS } from '../../src/lib/routes'

const ACTUALITES = ['tournoi-komo-kango-terre-davenir', 'un-jeune-un-permis', 'assemblee-generale-decembre-2025']
const PROJETS = ['jeunesse-opportunites', 'sante-sensibilisation', 'sport-cohesion', 'solidarite-vie-locale']

export function ALL_PATHS(locale: 'fr' | 'en'): string[] {
  const paths = [...STATIC_PATHS, ...ACTUALITES.map((s) => `/actualites/${s}`), ...PROJETS.map((s) => `/projets/${s}`)]
  return paths.map((p) => (p === '/' ? `/${locale}` : `/${locale}${p}`))
}
```

- [ ] **Step 2 : tests transverses**

`tests/e2e/transverse.spec.ts` :

```ts
import { expect, test } from '@playwright/test'
import { ALL_PATHS } from './helpers'

test.describe('toutes les pages', () => {
  for (const locale of ['fr', 'en'] as const) {
    test(`répondent en 200 avec lang, canonique et hreflang (${locale})`, async ({ page }) => {
      for (const path of ALL_PATHS(locale)) {
        const res = await page.goto(path)
        expect(res?.status(), path).toBe(200)
        await expect(page.locator('html'), path).toHaveAttribute('lang', locale)
        await expect(page.locator('h1'), path).toHaveCount(1)
        await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute('href', new RegExp(`${path}$`))
        await expect(page.locator('link[rel="alternate"][hreflang="en"]'), path).toHaveCount(1)
      }
    })
  }

  test('aucun lien interne de l’en-tête ou du pied de page ne mène à une 404', async ({ page, request }) => {
    for (const locale of ['fr', 'en']) {
      await page.goto(`/${locale}`)
      const hrefs = await page.locator('header a[href^="/"], footer a[href^="/"]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('href')!))])
      for (const href of hrefs) {
        const res = await request.get(href)
        expect(res.status(), href).toBe(200)
      }
    }
  })

  test('le sélecteur de langue garde la page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'sélecteur dans le menu mobile, couvert par le test unitaire')
    await page.goto('/fr/actualites/un-jeune-un-permis')
    await page.getByRole('link', { name: 'English' }).first().click()
    await expect(page).toHaveURL(/\/en\/actualites\/un-jeune-un-permis$/)
  })

  test('redirections et langue non publiée', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/fr$/)
    await page.goto('/contact')
    await expect(page).toHaveURL(/\/fr\/contact$/)
    await page.goto('/es')
    await expect(page.getByText('Cette version linguistique n’est pas encore publiée.', { exact: false })).toBeVisible()
  })
})

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('le contenu animé reste visible', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.locator('html')).not.toHaveClass(/\bjs\b/)
    const reveal = page.locator('[data-reveal]').first()
    await expect(reveal).toBeVisible()
    expect(await reveal.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })
})

test.describe('mouvement réduit', () => {
  test.use({ reducedMotion: 'reduce' })
  test('le contenu est affiché sans transition', async ({ page }) => {
    await page.goto('/fr/projets')
    const card = page.locator('[data-reveal-group] > *').first()
    expect(await card.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    expect(await card.evaluate((el) => getComputedStyle(el).transitionDuration)).toMatch(/^0s/)
  })
})

test('animations : apparition au défilement et en-tête compact', async ({ page, isMobile }) => {
  test.skip(isMobile, 'vérifié en desktop')
  await page.goto('/fr')
  const lastGroup = page.locator('[data-reveal-group]').last()
  await expect(lastGroup).not.toHaveClass(/is-visible/)
  await lastGroup.scrollIntoViewIfNeeded()
  await expect(lastGroup).toHaveClass(/is-visible/)
  await expect(page.locator('header.site-header')).toHaveClass(/is-compact/)
})
```

`tests/e2e/accessibilite.spec.ts` :

```ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ALL_PATHS } from './helpers'

test.use({ reducedMotion: 'reduce' })

for (const path of ALL_PATHS('fr')) {
  test(`axe ${path}`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(blocking.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
  })
}
```

`tests/e2e/captures.spec.ts` :

```ts
import { test } from '@playwright/test'

const PAGES = ['/fr', '/fr/ong', '/fr/actualites', '/fr/actualites/tournoi-komo-kango-terre-davenir', '/fr/contact', '/fr/mediatheque', '/fr/adhesion', '/en']

test.use({ reducedMotion: 'reduce' })

for (const path of PAGES) {
  test(`capture ${path}`, async ({ page }, info) => {
    await page.goto(path)
    await page.screenshot({ path: `test-results/captures/${info.project.name}${path.replace(/\//g, '_')}.png`, fullPage: true })
  })
}
```

- [ ] **Step 3 : lancer la suite complète**

Run : `npm run test:e2e`
Expected : tous les tests passent en `desktop` et en `mobile`.

Une violation axe doit être corrigée dans le composant concerné (contraste, nom accessible, etc.), puis la suite relancée. Les couleurs de la charte ne se modifient pas sans accord : si une violation de contraste vient d'une couleur de la maquette, la consigner dans le rapport de recette et la signaler.

- [ ] **Step 4 : comparaison visuelle**

Ouvrir les captures de `test-results/captures/` et les comparer aux écrans Banani (MCP Banani ou `.banani-export/screens/`) pour Accueil, Actualités, Article, Contact, Médiathèque et L'ONG, en desktop et en mobile. Lister les écarts dans `docs/recette/lot1.md` ; corriger ceux qui viennent du portage, et non d'une suppression de contenu volontaire.

- [ ] **Step 5 : Lighthouse mobile sur l'accueil**

Le serveur e2e doit tourner, avec les données de seed :

```powershell
Start-Process -NoNewWindow npx -ArgumentList 'tsx','scripts/e2e-server.ts'
npx --yes lighthouse http://localhost:3100/fr --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,seo --chrome-flags="--headless=new" --output=json --output-path=./test-results/lighthouse-accueil.json --quiet
node -e "const r=require('./test-results/lighthouse-accueil.json');for(const [k,v] of Object.entries(r.categories))console.log(k,Math.round(v.score*100))"
```

Expected : `performance >= 90`, `accessibility >= 90`, `seo >= 90`.

Si Chrome n'est pas trouvé, définir `$env:CHROME_PATH` vers le Chromium de Playwright :

```powershell
$env:CHROME_PATH = (Get-ChildItem "$env:LOCALAPPDATA\ms-playwright" -Recurse -Filter chrome.exe | Select-Object -First 1).FullName
```

Si un score est sous 90, appliquer d'abord les recommandations Lighthouse (taille d'images via `sizes`, `fetchPriority` de l'image LCP du hero), puis relancer. Arrêter ensuite le serveur.

- [ ] **Step 6 : rapport de recette**

Créer `docs/recette/lot1.md` avec :
- la date ;
- le résultat de `npm test` (nombre de tests) et de `npm run test:e2e` ;
- les 3 scores Lighthouse ;
- la liste des écarts visuels (corrigés ou acceptés) ;
- les violations axe éventuellement consignées ;
- la liste des contenus en attente de l'ONG (section 9 de la spec).

- [ ] **Step 7 : commit**

```powershell
git add -A
git commit -m "test: recette transverse du lot 1 (accessibilité, sans JS, liens, mouvement réduit)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 18 : Production Docker et README

**Files :**
- Create : `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `README.md`

**Interfaces :**
- Consumes : les scripts npm `build`, `migrate`, `seed`, `start`.
- Produces : `docker compose up -d --build`, qui lance PostgreSQL 18 et l'application sur le port 3000.

- [ ] **Step 1 : fichiers Docker**

`Dockerfile` :

```dockerfile
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
RUN mkdir -p media && chown -R node:node media
USER node
EXPOSE 3000
CMD ["sh", "-c", "npm run migrate && npm run start -- -p 3000"]
```

`.dockerignore` :

```
node_modules
.next
.data
media
.git
.env
test-results
playwright-report
.banani-export
docs
```

`docker-compose.yml` :

```yaml
services:
  postgres:
    image: postgres:18
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?définir POSTGRES_PASSWORD}
      POSTGRES_DB: terredavenir
    volumes:
      - pgdata:/var/lib/postgresql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres -d terredavenir']
      interval: 5s
      timeout: 5s
      retries: 10

  app:
    build: .
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URI: postgres://postgres:${POSTGRES_PASSWORD}@postgres:5432/terredavenir
      PAYLOAD_SECRET: ${PAYLOAD_SECRET:?définir PAYLOAD_SECRET}
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}
      SEED_ADMIN_EMAIL: ${SEED_ADMIN_EMAIL:-}
      SEED_ADMIN_PASSWORD: ${SEED_ADMIN_PASSWORD:-}
    ports:
      - '3000:3000'
    volumes:
      - media:/app/media

volumes:
  pgdata:
  media:
```

Note : Docker n'est pas installé sur le poste de développement, ces fichiers ne peuvent donc pas être testés localement. Les signaler comme **non vérifiés** dans le rapport de recette, avec la procédure de premier déploiement :

```
docker compose up -d --build
docker compose exec app npm run seed
```

- [ ] **Step 2 : README**

`README.md` (en français), avec les sections suivantes :
- **Présentation :** une phrase sur le projet, puis un lien vers la spec et le plan.
- **Prérequis :** Node.js 22 LTS ou plus récent, npm.
- **Démarrage en développement :**
  1. `npm install`
  2. `copy .env.example .env`, puis générer `PAYLOAD_SECRET`
  3. `npm run db` dans un terminal séparé
  4. `npm run migrate`
  5. `npm run seed`
  6. `npm run dev`, puis ouvrir `http://localhost:3000` et `/admin`
- **Scripts :** tableau de chaque script npm et de son rôle.
- **Contenus :** tout se modifie dans `/admin`. Un champ vide ou contenant `[...]` est masqué sur le site. Les images marquées « provisoire » sont à remplacer.
- **Langues :** fr et en actives. Pour ajouter une langue, il faut l'ajouter à `LOCALES` (`src/lib/i18n/config.ts`), créer son dictionnaire, puis lancer `npm run migrate:create` et `npm run migrate`.
- **Tests :** `npm test` et `npm run test:e2e`.
- **Production :** Docker Compose (voir ci-dessus), avec les variables `POSTGRES_PASSWORD`, `PAYLOAD_SECRET` et `NEXT_PUBLIC_SITE_URL`.
- **Référence :** le prototype de maquette est le commit `72dc396` et `.banani-export/`.

- [ ] **Step 3 : vérification finale**

```powershell
npm run lint
npm test
npm run build
```

Expected : aucune erreur.

- [ ] **Step 4 : commit**

```powershell
git add -A
git commit -m "chore: configuration Docker de production et README" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Couverture de la spec

| Exigence de la spec | Tâche |
|---|---|
| §4.1 Migration du prototype, conservation de la référence | 1, règles de portage |
| §4.2 Stack, Docker, `.env` | 1, 18 |
| §4.4 Multilingue (routes, langue inactive, `lang`/`dir`, hreflang, sélecteur) | 2, 7, 9, 16 |
| §4.5 Modèle de contenu | 3 |
| §4.6 ISR et revalidation | 3 (hooks), 7 (`revalidate`), 10-11 (`generateStaticParams`) |
| §4.7 Seed idempotent | 4, 5 |
| §5 Pages et routes | 7 (404, langue indisponible), 9 à 15 |
| §6 Animations | 6, 7 (en-tête), 8 (survols), 14 (visionneuse), 17 (vérifications) |
| §7 Gestion des erreurs | 7 (`error.tsx`, 404), 8 (`MediaImage`), 13 (formulaires) |
| §8.1 Tests | chaque tâche, 17 |
| §8.2 Critères d'acceptation | 17 (Lighthouse, axe, sitemap, aucune collecte) |
