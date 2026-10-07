# Formulaires par e-mail, organigramme administrable et compte admin unique — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** activer les formulaires d'adhésion et de contact (enregistrement dans l'admin, puis e-mail si l'envoi est configuré), livrer un organigramme administrable avec brouillons et aperçu, et limiter l'admin à un seul compte.

**Architecture:** les envois passent par deux Route Handlers Next (`POST /api/formulaires/adhesion` et `/api/formulaires/contact`). Ils délèguent à une fonction serveur pure, `traiterEnvoi`, qui contrôle l'envoi, l'enregistre par l'API locale de Payload dans la collection `messages`, puis notifie par e-mail via l'adaptateur Payload. Les règles de validation sont partagées entre le navigateur et le serveur (`src/lib/formulaires/schema.ts`, sans dépendance serveur). L'organigramme est une collection `postes` avec brouillons. Les hooks Payload valident les rattachements. La page publique construit l'arbre avec une fonction pure (`construireArbre`) et l'affiche deux fois : un schéma décoratif et une liste accessible.

**Tech Stack:** Next.js 16.3.8 (App Router, Route Handlers, `draftMode`), React 19, Payload 3.90.2 (`@payloadcms/db-postgres`, versions et brouillons, `@payloadcms/email-nodemailer` 3.90.2 à installer), PostgreSQL 18 embarqué (dev sur 5433, e2e sur 5434), Tailwind v4, TypeScript 6, Vitest, Playwright, axe-core.

**Spec :** `docs/superpowers/specs/2026-10-07-vitrine-formulaires-organigramme-design.md`

**Modèle suivi :** `docs/superpowers/plans/2026-10-06-admin-contenus-kpi.md` (mêmes conventions de migration, d'e2e et de commit).

## Décisions prises dans ce plan (précisions de la spec)

1. **Route Handler plutôt que Server Action** (§2.2). Le traitement doit renvoyer de vrais statuts HTTP (400, 429, 415). L'idempotence, le pot de miel et la limite doivent pouvoir se tester par l'API avec Playwright. Les Server Functions sont de toute façon joignables par POST direct (doc Next `01-app/01-getting-started/07-mutating-data.md`). Les deux routes sont statiques (`(site)/api/formulaires/adhesion/route.ts` et `.../contact/route.ts`), sur le modèle de `(site)/api/apercu` qui gagne déjà sur le catch-all de Payload.
2. **Locale** (§2.1) : elle est déduite de l'en-tête `Referer` (`/fr/...` ou `/en/...`), avec `fr` par défaut. Aucun champ `locale` du corps n'est lu.
3. **IP pour la limite de débit** : premier élément de `X-Forwarded-For`, puis `X-Real-IP`, sinon `inconnue`. Next 16 n'expose plus `request.ip` et ne pose `X-Forwarded-For` que s'il est absent (`base-server.js`). Le client peut donc le falsifier : la limite est un garde-fou anti-spam au mieux, pas une sécurité. C'est documenté dans le README. Les tests e2e s'en servent pour isoler chaque test avec une IP aléatoire.
4. **Ordre des contrôles :** requête bien formée, pot de miel, idempotence, limite, validation. Une clé déjà connue renvoie sa référence même au-delà de la limite : un nouvel essai après une erreur réseau ne doit pas être bloqué. Seul un envoi réellement enregistré compte dans la limite. La limite est partagée entre les deux formulaires (singleton sur `globalThis`, car chaque route a son propre bundle).
5. **Envoi de l'e-mail synchrone**, avant la réponse, comme l'ordre du §2.2. Les délais SMTP sont plafonnés (10 s de connexion, 20 s de socket). Le message est créé avec `emailEtat = 'echec'` et `emailErreur = 'Envoi non terminé.'`, puis mis à jour : `envoye`, `echec` ou `non_configure`. Un arrêt brutal laisse ainsi un état honnête et renvoyable.
6. **« Transport configuré »** veut dire `SMTP_HOST` ou `EMAIL_CAPTURE_DIR` (faux transport e2e) renseigné. Sans `email` dans la config, Payload utilise son adaptateur console : notre code ne s'y fie pas et passe à `non_configure`.
7. **Faux transport e2e :** un adaptateur Payload maison écrit chaque e-mail en JSON dans `EMAIL_CAPTURE_DIR` (`.data/e2e-emails`). Le serveur e2e (`next start`) et les tests Playwright sont deux processus : un fichier est le seul canal simple entre eux.
8. **Champ `nom` ajouté à `messages`** (lecture seule) pour la colonne « Nom » de la liste. Il contient « prénom(s) nom ».
9. **Compte unique** (§4) : `registerFirstUser` de Payload crée le premier compte avec `overrideAccess: true` et refuse dès qu'un compte existe (`node_modules/payload/dist/auth/operations/registerFirstUser.js`). L'accès `create` peut donc compter les comptes sans gêner ce parcours.
10. **Validation des rattachements dans `beforeValidate`** et non dans `validate` du champ : Payload saute la validation des champs pour les brouillons, alors que les hooks tournent toujours.
11. **Page organisation :** le schéma en arbre est `aria-hidden` et visible à partir de `xl` (1280 px). La liste imbriquée est toujours dans le DOM : visible sous `xl`, masquée visuellement (`xl:sr-only`) au-delà. Les lecteurs d'écran lisent donc une seule fois le même contenu, dans le même ordre. Un poste publié dont le parent n'est pas publié remonte à la racine. Une boucle éventuelle en base est cassée à l'affichage.
12. **Textes :** les messages d'adhésion reprennent mot pour mot les Textes v1.3 (« États et messages exacts »). La notice sous le bouton reprend l'esprit des sections « Utilisation » et « Accès » de PAGE-09, en version courte FR/EN. Les textes du contact et de l'organigramme sont rédigés ici.
13. **KPI :** la carte « Adhésions (KPI-01 à KPI-10) — disponible au lot 2 » est retirée de `NO_SOURCE`, car remplacée par la carte réelle « Messages non traités ». Les autres cartes sans source ne changent pas.
14. **Seed de l'organigramme :** un poste existant (même `cle`) n'est jamais réécrit, pour ne pas écraser une saisie réelle de l'admin. Les portraits (médias) sont mis à jour comme les autres médias du seed. La Présidente est seedée sous le nom public « Laurence Ndong ».
15. **Bandeau « pas encore ouvertes » :** la section `indisponible` (adhésion) n'est plus rendue. Le texte d'information du formulaire de contact passe dans le dictionnaire. Une base existante non re-seedée n'affiche donc plus jamais l'ancien texte. Le seed retire ces textes obsolètes.

## Global Constraints

- **Fond et forme :** les Textes v1.3 dictent le fond. Aucune information n'est inventée. Toute chaîne vide ou contenant `[...]` est un brouillon masqué côté site (`isPlaceholder` de `src/lib/text.ts`). Dans les textes affichés (dictionnaires, seed, libellés admin), on utilise l'apostrophe typographique `’`.
- **Périmètre vitrine :** un seul compte admin. Pas de rôles, ni de registre de membres, ni de transactions, ni de sauvegardes BO-14.
- **Données personnelles :** elles ne sont collectées que par les deux formulaires et stockées dans `messages`. Elles ne sont jamais lisibles sans session admin. Aucun accusé de réception n'est envoyé au visiteur, et aucun texte public ne dit qu'un e-mail a été envoyé.
- **Langues :** français et anglais. Toute nouvelle clé de dictionnaire existe dans `fr.ts` et `en.ts`, **dans le même ordre**. `tests/unit/dictionaries.test.ts` vérifie la parité et interdit les feuilles non textuelles ou vides : les variables s'écrivent `{reference}`, `{max}`, `{n}` et sont remplacées dans le composant.
- **Admin :** en français uniquement.
- **KPI :** aucun chiffre fictif. Trois états : valeur réelle (y compris 0), « Indisponible » et « Aucune source configurée ».
- **Base de données :** `push: false`. Une migration par chantier : `messages`, `reglages_emails`, `postes`.
  - `npm run migrate:create <nom>` est interactif : à chaque question de drizzle (« created or renamed ? »), répondre **create**.
  - Le SQL de données éventuel s'écrit à la main dans `up` **et** `down` (aucune reprise n'est nécessaire dans ce plan : tables et colonnes nouvelles).
  - Chaque migration est testée `up` / `down` / `up` sur une base jetable du serveur 5433 (`scripts/base-jetable.ts`, tâche 2), puis cette base est supprimée.
  - **Ne jamais lancer `migrate:reset`** (bug de Payload 3.90, voir README).
- **Build :** `npm run build` (lancé par `npm run test:e2e`) pré-rend les pages avec la base du `.env` (dev, 5433). Après chaque migration, appliquer `npm run migrate` sur la base de dev **avant** tout build.
- **Plateforme :** Windows (PowerShell et Git Bash), sans Docker en local.
  - **Ne jamais tuer les ports 3000 (serveur de dev de l'utilisateur) et 5433 (base de dev).**
  - L'e2e utilise 3100 et 5434, gérés par le globalSetup (`scripts/e2e-server.ts`).
- **Next.js :** « This is NOT the Next.js you know ». Avant d'écrire du code Next, lire le guide dans `node_modules/next/dist/docs/` : `01-app/01-getting-started/15-route-handlers.md`, `01-app/03-api-reference/03-file-conventions/route.md`, `01-app/03-api-reference/04-functions/draft-mode.md`, `after.md`, `headers.md`.
- **Revalidation :** les hooks `revalidateCollection` et `revalidateCollectionDelete` de `src/hooks/revalidate.ts` reportent déjà la revalidation avec `after()`. Ne pas en écrire d'autres.
- **Aperçu :** réutiliser `previewUrl` (`src/lib/preview.ts`), la route `src/app/(site)/api/apercu`, `isPreviewing()` (`src/lib/content.ts`, qui re-vérifie la session) et `PreviewBanner`.
- **Imports :** dans les modules chargés par `payload.config.ts` (collections, hooks et ce qu'ils importent), les imports **à l'exécution** sont relatifs (`../lib/...`). `import type ... from '@/payload-types'` reste permis, car il est effacé. Les composants admin et les pages Next peuvent utiliser `@/`.
- **E2E :**
  - **Session admin partagée :** `adminToken()` et `loginAdmin(page)` de `tests/e2e/admin-helpers.ts`. Aucun nouveau login ni logout (sauf le test existant de `admin.spec.ts`).
  - Toute spec qui crée ou modifie des données : `test.describe(..., { tag: '@desktop' }, ...)`, plus `test.skip(({ isMobile }) => isMobile, ...)`. Le projet mobile a `grepInvert: /@desktop/`.
  - Données de test préfixées `e2e-<spec>-` (un préfixe distinct par `describe`), nettoyées en `beforeAll` (reste d'un run interrompu) et en `afterAll`. Ne jamais compter strictement des données partagées.
  - Tout `describe` qui purge ou partage des données est **sérialisé** (`test.describe.configure({ mode: 'serial' })` dans le `describe`). Sinon, `fullyParallel: true` répartit ses tests sur plusieurs workers, et le `beforeAll` d'un worker purge les données d'un test en cours sur un autre.
  - Pour lire une page publique juste après une écriture : `expect(...).toPass({ timeout: 20_000 })` ou `expect.poll(..., { timeout: 20_000 })`.
  - Chaque test qui envoie un formulaire utilise une IP aléatoire (`X-Forwarded-For`), pour ne pas épuiser la limite de 5 envois.
- **Seed :** idempotent. Les fichiers téléversés sont nommés `<slug>-N-photo.jpg` (Payload renumérote les noms finissant par `-N`).
- **Commits :**
  - En français, préfixés (`feat:`, `fix:`, `test:`, `docs:`, `chore:`), avec un corps qui se termine par une ligne vide puis `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Fichiers listés explicitement : **jamais `git add -A`**.
  - Ne jamais commiter `.env` ni `.superpowers/`.
- **Vérifications avant chaque commit de tâche :** `npx tsc --noEmit`, `npm test`, `npm run lint` (0 erreur), puis `npm run test:e2e` (suite complète) pour les tâches qui ont des tests e2e.

---

## Carte des fichiers

| Fichier | Rôle | Tâche |
|---|---|---|
| `src/collections/Users.ts` | accès `create` et `delete` du compte unique | 1 |
| `tests/e2e/compte-unique.spec.ts` | second compte refusé (REST, admin) | 1 |
| `scripts/base-jetable.ts` | création et suppression de la base jetable `terredavenir_jetable` (5433) | 2 |
| `src/lib/email/adaptateur.ts` | adaptateur e-mail : SMTP (Nodemailer), capture e2e ou aucun | 2 |
| `src/collections/Messages.ts` | collection « Messages reçus » | 2, 6 |
| `src/globals/Reglages.ts` | champs `emailAdhesions` et `emailContact` | 2 |
| `tests/e2e/email-capture.ts` | lecture des e-mails capturés en e2e | 2 |
| `src/lib/formulaires/schema.ts` | types, limites et validation partagés navigateur et serveur | 3 |
| `src/lib/formulaires/pays.ts` | codes ISO 3166-1 et noms traduits (`Intl.DisplayNames`) | 3 |
| `src/lib/formulaires/libelles.ts` | libellés FR des champs, rendu lisible des données | 3 |
| `src/lib/formulaires/limite.ts` | limite de débit en mémoire | 3 |
| `src/lib/formulaires/reference.ts` | référence `ADH-XXXXXX` ou `CT-XXXXXX` | 3 |
| `src/lib/formulaires/email.ts` | composition et envoi de la notification, mise à jour de l'état | 3 |
| `src/lib/formulaires/traitement.ts` | traitement d'un envoi (pur, Payload injecté) | 3 |
| `src/lib/formulaires/entetes.ts` | IP et locale depuis les en-têtes | 3 |
| `src/lib/formulaires/repondre.ts` | adaptation HTTP du traitement | 3 |
| `src/app/(site)/api/formulaires/{adhesion,contact}/route.ts` | Route Handlers | 3 |
| `tests/e2e/formulaires-helpers.ts` | IP aléatoire, envoi par l'API, lecture et purge des messages | 3 |
| `src/components/forms/useEnvoiFormulaire.ts`, `ChampErreur.tsx`, `SuccesEnvoi.tsx`, `texte-erreur.ts` | états client communs | 4 |
| `src/components/forms/ContactForm.tsx` | formulaire de contact actif | 4 |
| `src/components/forms/AdhesionForm.tsx` | formulaire d'adhésion actif | 5 |
| `src/components/forms/ClosedNotice.tsx` | supprimé | 5 |
| `src/components/admin/DonneesLisibles.tsx` | affichage lisible de `donnees` | 6 |
| `src/components/admin/RenvoyerEmail.tsx`, `src/lib/formulaires/renvoi.ts` | bouton et endpoint « Renvoyer l'e-mail » | 6 |
| `src/lib/kpi/*`, `src/components/admin/KpiDashboard.tsx` | carte « Messages non traités » | 6 |
| `src/lib/organigramme.ts` | règles de rattachement et construction de l'arbre (pur) | 7, 8 |
| `src/hooks/postes.ts` | hooks `beforeValidate` et `beforeDelete` des postes | 7 |
| `src/collections/Postes.ts` | collection « Organigramme » | 7 |
| `tests/e2e/postes-helpers.ts` | création et purge des postes de test | 7 |
| `src/components/organisation/Organigramme.tsx` | arbre et liste accessible | 8 |
| `src/app/(site)/[locale]/organisation/page.tsx` | page publique | 8 |
| `src/seed/media.ts` | `upsertMedia`, déplacée depuis `src/seed/index.ts` | 9 |
| `src/seed/data/organigramme.ts`, `src/seed/organigramme.ts`, `src/seed/images/organigramme/*` | contenu de départ de l'organigramme | 9 |

---

### Task 1 : Compte admin unique

**Files:**
- Modify: `src/collections/Users.ts`
- Modify: `tests/unit/access.test.ts`
- Create: `tests/e2e/compte-unique.spec.ts`
- Modify: `README.md` (section Administration)

**Interfaces:**
- Consumes: `adminToken`, `loginAdmin` (`tests/e2e/admin-helpers.ts`) ; `ADMIN_EMAIL` (`tests/e2e/admin-credentials.ts`).
- Produces :
  - `creationCompte: Access` (vrai si aucun compte n'existe) ;
  - `suppressionCompte: Access` (vrai si connecté **et** s'il existe plus d'un compte).
  - Les deux sont exportés par `src/collections/Users.ts`.

- [ ] **Step 1 : Tests unitaires, à écrire avant le code**

Dans `tests/unit/access.test.ts`, ajouter l'import `import { Users } from '@/collections/Users'` puis ce bloc à la fin du fichier :

```ts
describe('compte admin unique', () => {
  const req = (user: unknown, totalDocs: number) => ({ req: { user, payload: { count: async () => ({ totalDocs }) } } }) as never

  it('création : seulement tant qu’aucun compte n’existe, même pour un admin connecté', async () => {
    const create = Users.access!.create!
    expect(await create(req(null, 0))).toBe(true)
    expect(await create(req(null, 1))).toBe(false)
    expect(await create(req({ id: 1 }, 1))).toBe(false)
  })

  it('suppression : jamais le dernier compte, jamais sans connexion', async () => {
    const del = Users.access!.delete!
    expect(await del(req({ id: 1 }, 1))).toBe(false)
    expect(await del(req({ id: 1 }, 2))).toBe(true)
    expect(await del(req(null, 2))).toBe(false)
  })
})
```

Run: `npx vitest run tests/unit/access.test.ts`

Expected: FAIL, car `Users.access` est `undefined`.

- [ ] **Step 2 : Test e2e, à écrire avant le code**

`tests/e2e/compte-unique.spec.ts` :

```ts
import { expect, test, type APIRequestContext } from '@playwright/test'
import { ADMIN_EMAIL } from './admin-credentials'
import { adminToken, loginAdmin } from './admin-helpers'

const SECOND = { email: 'e2e-second-compte@terredavenir.local', password: 'e2e-second-mot-de-passe' }

test.describe('compte admin unique', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  // Un run en échec (avant l’implémentation) crée ce compte dans la base e2e persistante : on le retire avant et après.
  // Supprimer un compte reste permis tant qu’il en existe plus d’un.
  async function purger(request: APIRequestContext) {
    const headers = { Authorization: `JWT ${await adminToken(request)}` }
    const res = await request.get(`/api/users?where[email][equals]=${encodeURIComponent(SECOND.email)}`, { headers })
    for (const u of (await res.json()).docs as { id: number }[]) await request.delete(`/api/users/${u.id}`, { headers })
  }
  test.beforeAll(async ({ request }) => purger(request))
  test.afterAll(async ({ request }) => purger(request))

  test('REST : un second compte est refusé, avec ou sans jeton admin', async ({ request }) => {
    const headers = { Authorization: `JWT ${await adminToken(request)}` }
    expect((await request.post('/api/users', { data: SECOND })).status()).toBe(403)
    expect((await request.post('/api/users', { headers, data: SECOND })).status()).toBe(403)
    // Parcours « premier utilisateur » fermé dès qu’un compte existe (refus natif de Payload).
    expect((await request.post('/api/users/first-register', { data: SECOND })).status()).toBe(403)
    const found = await request.get(`/api/users?where[email][equals]=${encodeURIComponent(SECOND.email)}`, { headers })
    expect((await found.json()).totalDocs).toBe(0)
  })

  test('admin : la liste des utilisateurs n’offre pas de bouton de création', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/collections/users')
    await expect(page.getByRole('link', { name: ADMIN_EMAIL })).toBeVisible()
    await expect(page.getByText('Créer un(e) nouveau ou nouvelle')).toHaveCount(0)
  })
})
```

Le libellé « Créer un(e) nouveau ou nouvelle » est la traduction FR de `general:createNew` dans Payload (`@payloadcms/translations/dist/languages/fr.js`).

Run: `npm run test:e2e -- tests/e2e/compte-unique.spec.ts --project=desktop`

Expected: FAIL. Le POST avec jeton crée le compte (statut 201) et le bouton de création est visible. Le compte créé est retiré par `afterAll`.

- [ ] **Step 3 : Implémenter l'accès**

Remplacer `src/collections/Users.ts` par :

```ts
import type { Access, CollectionConfig, PayloadRequest } from 'payload'

async function nombreComptes(req: PayloadRequest): Promise<number> {
  const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
  return totalDocs
}

/**
 * Création : uniquement tant qu’aucun compte n’existe. Le parcours « premier utilisateur » de Payload
 * (registerFirstUser) crée de toute façon le compte avec overrideAccess et refuse dès qu’un compte existe.
 * Le seed et l’e2e passent par l’API locale, qui contourne l’accès.
 */
export const creationCompte: Access = async ({ req }) => (await nombreComptes(req)) === 0

/** Suppression : jamais sans connexion, jamais le dernier compte. */
export const suppressionCompte: Access = async ({ req }) => Boolean(req.user) && (await nombreComptes(req)) > 1

export const Users: CollectionConfig = {
  slug: 'users',
  typescript: { interface: 'User' },
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: { useAsTitle: 'email', group: 'Administration' },
  auth: true,
  access: { create: creationCompte, delete: suppressionCompte },
  fields: [],
}
```

Run: `npx vitest run tests/unit/access.test.ts`

Expected: PASS.

- [ ] **Step 4 : README**

Dans `README.md`, section « Administration », ajouter après la puce « Admin » :

```markdown
- **Compte unique :** l'administration n'a qu'un seul compte. Il est créé par le seed (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) ou par la page « premier utilisateur ». Aucun autre compte ne peut être créé, et le dernier compte ne peut pas être supprimé. Pour changer d'adresse ou de mot de passe, modifier ce compte dans *Administration > Utilisateurs*.
- **Mot de passe oublié :** le lien de la page de connexion envoie un e-mail de réinitialisation **uniquement si le SMTP est configuré** (voir « Envoi des e-mails »). Sans SMTP, la page reste accessible mais aucun e-mail ne part.
```

- [ ] **Step 5 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected: tout passe, y compris `compte-unique.spec.ts`. `admin.spec.ts` (vrai login) reste vert.

- [ ] **Step 6 : Commit**

```bash
git add src/collections/Users.ts tests/unit/access.test.ts tests/e2e/compte-unique.spec.ts README.md
git commit -F - <<'EOF'
feat: compte admin unique (création et suppression du dernier compte refusées)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2 : Collection `messages`, adresses e-mail des Réglages et adaptateur e-mail

**Files:**
- Run: `npm install @payloadcms/email-nodemailer@3.90.2` (modifie `package.json`, `package-lock.json`)
- Create: `scripts/base-jetable.ts`
- Create: `src/lib/email/adaptateur.ts`, `tests/unit/email-adaptateur.test.ts`
- Create: `src/collections/Messages.ts`
- Modify: `src/globals/Reglages.ts`, `src/payload.config.ts`
- Modify: `tests/unit/access.test.ts`, `tests/e2e/api-acces.spec.ts`
- Create: `tests/e2e/email-capture.ts` ; Modify: `scripts/e2e-server.ts`
- Create (générés) : `src/migrations/<horodatage>_messages.ts` et `.json`, `src/migrations/<horodatage>_reglages_emails.ts` et `.json` ; Modify : `src/migrations/index.ts`, `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`
- Modify: `.env.example`, `docker-compose.yml`, `README.md`

**Interfaces:**
- Produces :
  - `src/lib/email/adaptateur.ts` :
    - `NOM_EXPEDITEUR_DEFAUT: string` ;
    - `lireExpediteur(valeur: string | undefined): { nom: string; adresse: string } | null` ;
    - `transportConfigure(env?: NodeJS.ProcessEnv): boolean` ;
    - `adaptateurCapture(dossier: string): EmailAdapter` ;
    - `emailAdapter(env?: NodeJS.ProcessEnv): EmailAdapter | Promise<EmailAdapter> | undefined`.
  - Collection `messages` (interface `Message`), avec les champs :
    - `reference` (unique) ;
    - `type` (`'adhesion' | 'contact'`) ;
    - `nom` ;
    - `donnees` (JSON) ;
    - `locale` (`'fr' | 'en'`) ;
    - `noticeVersion` ;
    - `cleIdempotence` (unique) ;
    - `emailEtat` (`'envoye' | 'echec' | 'non_configure'`) ;
    - `emailErreur` ;
    - `emailEnvoyeLe` ;
    - `traite` ;
    - `notes`.
  - `Reglage.emailAdhesions?: string | null` et `Reglage.emailContact?: string | null`.
  - `tests/e2e/email-capture.ts` : `EMAIL_CAPTURE_DIR = '.data/e2e-emails'` ; `type EmailCapture = { to?: unknown; subject?: string; text?: string; replyTo?: unknown }` ; `emailsCaptures(): EmailCapture[]`.
  - `scripts/base-jetable.ts` : `npx tsx scripts/base-jetable.ts creer|supprimer`. Il agit sur la base `terredavenir_jetable` du serveur 5433.

- [ ] **Step 1 : Installer l'adaptateur**

Run: `npm install @payloadcms/email-nodemailer@3.90.2`

Expected : `package.json` gagne `"@payloadcms/email-nodemailer": "^3.90.2"`. `npm ls payload` ne montre aucun conflit de pair (la version `3.90.2` exige `payload@3.90.2`, déjà installé).

- [ ] **Step 2 : Tests unitaires, à écrire avant le code**

`tests/unit/email-adaptateur.test.ts` :

```ts
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { NOM_EXPEDITEUR_DEFAUT, adaptateurCapture, emailAdapter, lireExpediteur, transportConfigure } from '@/lib/email/adaptateur'

describe('adaptateur e-mail', () => {
  it('lit l’expéditeur « Nom <adresse> » ou une adresse seule', () => {
    expect(lireExpediteur('Terre d’Avenir <site@exemple.org>')).toEqual({ nom: 'Terre d’Avenir', adresse: 'site@exemple.org' })
    expect(lireExpediteur('"Association" <a@b.org>')).toEqual({ nom: 'Association', adresse: 'a@b.org' })
    expect(lireExpediteur('site@exemple.org')).toEqual({ nom: NOM_EXPEDITEUR_DEFAUT, adresse: 'site@exemple.org' })
    expect(lireExpediteur('')).toBeNull()
    expect(lireExpediteur('pas une adresse')).toBeNull()
  })

  it('transport configuré : SMTP_HOST ou dossier de capture', () => {
    expect(transportConfigure({})).toBe(false)
    expect(transportConfigure({ SMTP_HOST: '  ' })).toBe(false)
    expect(transportConfigure({ SMTP_HOST: 'smtp.exemple.org' })).toBe(true)
    expect(transportConfigure({ EMAIL_CAPTURE_DIR: '.data/e2e-emails' })).toBe(true)
  })

  it('aucun adaptateur sans SMTP_HOST ni capture', () => {
    expect(emailAdapter({})).toBeUndefined()
  })

  it('la capture écrit chaque e-mail en JSON, sans rien envoyer', async () => {
    const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'capture-'))
    const adapter = adaptateurCapture(dossier)({ payload: {} as never })
    await adapter.sendEmail({ to: 'dest@exemple.org', subject: 'Sujet', text: 'Corps' })
    const fichiers = fs.readdirSync(dossier)
    expect(fichiers).toHaveLength(1)
    expect(JSON.parse(fs.readFileSync(path.join(dossier, fichiers[0]), 'utf8'))).toMatchObject({ to: 'dest@exemple.org', subject: 'Sujet', text: 'Corps' })
    expect(emailAdapter({ EMAIL_CAPTURE_DIR: dossier })).toBeTypeOf('function')
  })
})
```

Dans `tests/unit/access.test.ts`, ajouter l'import `import { Messages } from '@/collections/Messages'` et ce bloc :

```ts
describe('messages reçus', () => {
  it('lecture, modification et suppression réservées à l’admin ; création toujours refusée par l’API', () => {
    const { read, create, update, delete: del } = Messages.access!
    expect(read!(anonymous)).toBe(false)
    expect(read!(admin)).toBe(true)
    expect(create!(anonymous)).toBe(false)
    expect(create!(admin)).toBe(false)
    expect(update!(anonymous)).toBe(false)
    expect(update!(admin)).toBe(true)
    expect(del!(anonymous)).toBe(false)
    expect(del!(admin)).toBe(true)
  })
})
```

Run: `npx vitest run tests/unit/email-adaptateur.test.ts tests/unit/access.test.ts`

Expected: FAIL (modules introuvables).

- [ ] **Step 3 : Adaptateur e-mail**

`src/lib/email/adaptateur.ts` :

```ts
import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type { EmailAdapter } from 'payload'

export const NOM_EXPEDITEUR_DEFAUT = 'Terre d’Avenir KOMO-KANGO'

const ADRESSE = /^[^\s@<>]+@[^\s@<>]+$/

/** « Nom <adresse@exemple.org> » ou « adresse@exemple.org » ; null si la valeur est vide ou invalide. */
export function lireExpediteur(valeur: string | undefined): { nom: string; adresse: string } | null {
  const v = (valeur ?? '').trim()
  if (!v) return null
  const m = /^(.*)<([^<>]+)>$/.exec(v)
  if (m) {
    const adresse = m[2].trim()
    if (!ADRESSE.test(adresse)) return null
    const nom = m[1].trim().replace(/^"(.*)"$/, '$1').trim()
    return { nom: nom || NOM_EXPEDITEUR_DEFAUT, adresse }
  }
  return ADRESSE.test(v) ? { nom: NOM_EXPEDITEUR_DEFAUT, adresse: v } : null
}

/** Vrai si un transport réel (SMTP) ou le faux transport des tests e2e est configuré. */
export function transportConfigure(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.SMTP_HOST?.trim() || env.EMAIL_CAPTURE_DIR?.trim())
}

/** Faux transport e2e : chaque e-mail est écrit en JSON dans `dossier`, rien n’est envoyé. */
export function adaptateurCapture(dossier: string): EmailAdapter<{ fichier: string }> {
  return () => ({
    name: 'capture-e2e',
    defaultFromAddress: 'site@terredavenir.local',
    defaultFromName: NOM_EXPEDITEUR_DEFAUT,
    sendEmail: async (message) => {
      mkdirSync(dossier, { recursive: true })
      const fichier = path.join(dossier, `${Date.now()}-${randomUUID()}.json`)
      writeFileSync(fichier, JSON.stringify(message))
      return { fichier }
    },
  })
}

/**
 * Adaptateur de la config Payload :
 * - EMAIL_CAPTURE_DIR (e2e uniquement) : faux transport ;
 * - SMTP_HOST : Nodemailer en SMTP ;
 * - sinon : aucun (Payload écrit alors les e-mails dans la console ; les formulaires passent en « non configuré »).
 */
export function emailAdapter(env: NodeJS.ProcessEnv = process.env): EmailAdapter | Promise<EmailAdapter> | undefined {
  const capture = env.EMAIL_CAPTURE_DIR?.trim()
  if (capture) return adaptateurCapture(capture) as EmailAdapter
  const host = env.SMTP_HOST?.trim()
  if (!host) return undefined
  const port = Number(env.SMTP_PORT) || 587
  const user = env.SMTP_USER?.trim()
  const expediteur = lireExpediteur(env.SMTP_FROM) ?? { nom: NOM_EXPEDITEUR_DEFAUT, adresse: user ?? '' }
  return nodemailerAdapter({
    defaultFromAddress: expediteur.adresse,
    defaultFromName: expediteur.nom,
    skipVerify: true, // pas de connexion SMTP au démarrage ni pendant le build
    transportOptions: {
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass: env.SMTP_PASS ?? '' } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    },
  })
}
```

- [ ] **Step 4 : Collection `messages`**

`src/collections/Messages.ts` :

```ts
import type { CollectionConfig } from 'payload'

/** Champs remplis par le traitement du formulaire : visibles mais jamais modifiables depuis l’admin ou l’API REST. */
const fige = { readOnly: true } as const
const nonModifiable = { update: () => false }

export const Messages: CollectionConfig = {
  slug: 'messages',
  typescript: { interface: 'Message' },
  labels: { singular: 'Message reçu', plural: 'Messages reçus' },
  admin: {
    useAsTitle: 'reference',
    group: 'Formulaires',
    defaultColumns: ['reference', 'type', 'nom', 'emailEtat', 'traite', 'createdAt'],
    listSearchableFields: ['reference', 'nom'],
    description: 'Demandes d’adhésion et messages de contact envoyés depuis le site. Lecture réservée à l’admin.',
  },
  // Non traités d’abord (false < true), puis les plus récents.
  defaultSort: ['traite', '-createdAt'],
  access: {
    read: ({ req }) => Boolean(req.user),
    // Création uniquement par l’API locale du traitement de formulaire (overrideAccess), jamais par REST ou GraphQL.
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'reference', label: 'Référence', type: 'text', required: true, unique: true, index: true, admin: fige, access: nonModifiable },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Adhésion', value: 'adhesion' },
        { label: 'Contact', value: 'contact' },
      ],
      admin: fige,
      access: nonModifiable,
    },
    { name: 'nom', label: 'Nom', type: 'text', admin: fige, access: nonModifiable },
    { name: 'donnees', label: 'Données envoyées', type: 'json', required: true, admin: fige, access: nonModifiable },
    {
      name: 'locale',
      label: 'Langue',
      type: 'select',
      options: [
        { label: 'Français', value: 'fr' },
        { label: 'English', value: 'en' },
      ],
      admin: { ...fige, position: 'sidebar' },
      access: nonModifiable,
    },
    { name: 'noticeVersion', label: 'Version de la notice acceptée', type: 'text', admin: { ...fige, position: 'sidebar' }, access: nonModifiable },
    { name: 'cleIdempotence', label: 'Clé d’envoi', type: 'text', required: true, unique: true, index: true, admin: { ...fige, position: 'sidebar' }, access: nonModifiable },
    {
      name: 'emailEtat',
      label: 'État de l’e-mail',
      type: 'select',
      required: true,
      defaultValue: 'non_configure',
      options: [
        { label: 'Envoyé', value: 'envoye' },
        { label: 'Échec', value: 'echec' },
        { label: 'Non configuré', value: 'non_configure' },
      ],
      admin: { ...fige, position: 'sidebar' },
      access: nonModifiable,
    },
    { name: 'emailErreur', label: 'Erreur d’envoi', type: 'textarea', admin: { ...fige, position: 'sidebar' }, access: nonModifiable },
    {
      name: 'emailEnvoyeLe',
      label: 'E-mail envoyé le',
      type: 'date',
      admin: { ...fige, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
      access: nonModifiable,
    },
    { name: 'traite', label: 'Traité', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'notes', label: 'Notes internes', type: 'textarea', admin: { description: 'Visibles uniquement dans l’admin.' } },
  ],
}
```

Dans `src/payload.config.ts` :

```ts
import { Messages } from './collections/Messages'
import { emailAdapter } from './lib/email/adaptateur'
// …
  collections: [Pages, Actualites, Projets, Medias, Albums, Messages, Users],
// … au niveau de buildConfig, après `editor` :
  email: emailAdapter(),
```

Run: `npx vitest run tests/unit/email-adaptateur.test.ts tests/unit/access.test.ts`

Expected: PASS.

- [ ] **Step 5 : Script de base jetable**

`scripts/base-jetable.ts` :

```ts
import pg from 'pg'

/** Base jetable du serveur de dev (5433), pour tester up/down/up d’une migration sans toucher à `terredavenir`. */
const NOM = 'terredavenir_jetable'
export const URI_JETABLE = `postgres://postgres:postgres@127.0.0.1:5433/${NOM}`

const action = process.argv[2]
const client = new pg.Client({ connectionString: 'postgres://postgres:postgres@127.0.0.1:5433/postgres' })
await client.connect()
try {
  if (action === 'creer') {
    await client.query(`DROP DATABASE IF EXISTS "${NOM}" WITH (FORCE)`)
    await client.query(`CREATE DATABASE "${NOM}"`)
    console.log(`Base ${NOM} créée : DATABASE_URI=${URI_JETABLE}`)
  } else if (action === 'supprimer') {
    await client.query(`DROP DATABASE IF EXISTS "${NOM}" WITH (FORCE)`)
    console.log(`Base ${NOM} supprimée.`)
  } else {
    console.error('Usage : npx tsx scripts/base-jetable.ts creer|supprimer')
    process.exitCode = 1
  }
} finally {
  await client.end()
}
```

Ce script n'arrête jamais le serveur 5433 : il ne crée et ne supprime que la base `terredavenir_jetable`.

- [ ] **Step 6 : Base jetable au niveau actuel, avant de générer la migration**

La base de dev doit tourner (`npm run db`, dans un autre terminal, si ce n'est pas déjà le cas). Les commandes suivantes sont en Git Bash :

```bash
npx tsx scripts/base-jetable.ts creer
DATABASE_URI=postgres://postgres:postgres@127.0.0.1:5433/terredavenir_jetable npm run migrate
```

Expected : toutes les migrations existantes sont appliquées dans un **premier lot**. La nouvelle migration formera un lot à part, que `migrate:down` pourra annuler seul.

- [ ] **Step 7 : Migration `messages`**

Run: `npm run migrate:create messages`

Répondre **create** à chaque question de drizzle. Le fichier généré crée :
- `enum_messages_type`, `enum_messages_locale`, `enum_messages_email_etat` ;
- la table `messages`, avec les index uniques sur `reference` et `cle_idempotence` ;
- la colonne `messages_id` dans `payload_locked_documents_rels`.

Aucune donnée n'est à reprendre. Si le `down` généré enchaîne `DROP TABLE ... CASCADE` puis `DROP CONSTRAINT` ou `DROP INDEX` sur la même table, ajouter `IF EXISTS` à ces derniers (comme le correctif f371038).

Run: `npm run migrate; npm run generate:types; npm run generate:importmap`

Expected: la migration s'applique sur la base de dev. `src/payload-types.ts` contient `export interface Message` et `emailEtat: 'envoye' | 'echec' | 'non_configure';`.

Puis, sur la base jetable :

```bash
J=postgres://postgres:postgres@127.0.0.1:5433/terredavenir_jetable
DATABASE_URI=$J npm run migrate
DATABASE_URI=$J npm run payload -- migrate:down
DATABASE_URI=$J npm run migrate
```

Expected : les trois commandes réussissent. `migrate:down` n'annule que `<horodatage>_messages`.

- [ ] **Step 8 : Champs e-mail des Réglages et migration `reglages_emails`**

Dans `src/globals/Reglages.ts`, ajouter à la fin de `fields` :

```ts
    {
      type: 'collapsible',
      label: 'Formulaires : adresses de réception',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'emailAdhesions',
          label: 'E-mail de réception des demandes d’adhésion',
          type: 'email',
          admin: { description: 'Laisser vide pour ne pas envoyer d’e-mail : les demandes restent dans « Messages reçus ». L’envoi exige aussi le SMTP (voir README).' },
        },
        {
          name: 'emailContact',
          label: 'E-mail de réception des messages de contact',
          type: 'email',
          admin: { description: 'Laisser vide pour ne pas envoyer d’e-mail : les messages restent dans « Messages reçus ». L’envoi exige aussi le SMTP (voir README).' },
        },
      ],
    },
```

Run: `npm run migrate:create reglages_emails` (répondre **create**), puis `npm run migrate; npm run generate:types`

Expected : la migration ajoute `email_adhesions` et `email_contact` (varchar) à la table `reglages`. Le type `Reglage` contient `emailAdhesions?: string | null;` et `emailContact?: string | null;`.

Puis, sur la base jetable :

```bash
J=postgres://postgres:postgres@127.0.0.1:5433/terredavenir_jetable
DATABASE_URI=$J npm run migrate
DATABASE_URI=$J npm run payload -- migrate:down
DATABASE_URI=$J npm run migrate
npx tsx scripts/base-jetable.ts supprimer
```

Expected : tout réussit, puis la base jetable est supprimée.

- [ ] **Step 9 : Faux transport e2e**

`tests/e2e/email-capture.ts` :

```ts
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

/** Dossier où le serveur e2e écrit les e-mails (faux transport, voir src/lib/email/adaptateur.ts). Vidé par le globalSetup. */
export const EMAIL_CAPTURE_DIR = '.data/e2e-emails'

export type EmailCapture = { to?: unknown; subject?: string; text?: string; replyTo?: unknown }

export function emailsCaptures(): EmailCapture[] {
  if (!existsSync(EMAIL_CAPTURE_DIR)) return []
  return readdirSync(EMAIL_CAPTURE_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(path.join(EMAIL_CAPTURE_DIR, f), 'utf8')) as EmailCapture)
}
```

Dans `scripts/e2e-server.ts` :

```ts
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { EMAIL_CAPTURE_DIR } from '../tests/e2e/email-capture'
// …
const E2E_ENV = {
  ...process.env,
  DATABASE_URI: `postgres://postgres:postgres@127.0.0.1:${E2E_DB_PORT}/terredavenir`,
  SEED_ADMIN_EMAIL: ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD: ADMIN_PASSWORD,
  PREVIEW_SECRET: 'e2e-apercu',
  // Faux transport : aucun e-mail réel, même si le .env contient un SMTP.
  EMAIL_CAPTURE_DIR: path.resolve(EMAIL_CAPTURE_DIR),
  SMTP_HOST: '',
}
```

En tête de `globalSetup()`, juste après `stopDatabaseWithPgCtl()` :

```ts
  rmSync(path.resolve(EMAIL_CAPTURE_DIR), { recursive: true, force: true })
```

- [ ] **Step 10 : Test e2e d'accès**

Dans `tests/e2e/api-acces.spec.ts`, ajouter dans le `describe` :

```ts
  test('/api/messages : lecture et création refusées sans jeton', async ({ request }) => {
    expect((await request.get('/api/messages')).status()).toBe(403)
    expect((await request.post('/api/messages', { data: { reference: 'CT-AAAAAA' } })).status()).toBe(403)
  })
```

Et un second `describe` à la fin du fichier :

```ts
test.describe('messages : création REST refusée même à l’admin', { tag: '@desktop' }, () => {
  test.skip(({ isMobile }) => isMobile, 'admin desktop')
  test('POST /api/messages avec jeton admin', async ({ request }) => {
    const res = await request.post('/api/messages', {
      headers: { Authorization: `JWT ${await adminToken(request)}` },
      data: { reference: 'CT-AAAAAA', type: 'contact', donnees: {}, cleIdempotence: '00000000-0000-4000-8000-000000000000' },
    })
    expect(res.status()).toBe(403)
  })
})
```

Ajouter `import { adminToken } from './admin-helpers'` en tête.

- [ ] **Step 11 : Documentation et déploiement**

`.env.example`, à la fin :

```
# Envoi des e-mails (SMTP). Sans SMTP_HOST, aucun e-mail ne part : les formulaires restent enregistrés dans « Messages reçus ».
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
# Expéditeur : « Nom <adresse@exemple.org> » ou une adresse seule.
SMTP_FROM=
```

`docker-compose.yml`, `environment` du service `app`, après `SEED_ADMIN_PASSWORD` :

```yaml
      SMTP_HOST: ${SMTP_HOST:-}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_USER: ${SMTP_USER:-}
      SMTP_PASS: ${SMTP_PASS:-}
      SMTP_FROM: ${SMTP_FROM:-}
```

`README.md`, nouvelle section après « Administration » :

```markdown
## Envoi des e-mails

Les formulaires d'adhésion et de contact sont toujours enregistrés dans *Formulaires > Messages reçus*. Un e-mail de notification part en plus si deux conditions sont réunies :

1. **SMTP configuré** : `SMTP_HOST`, `SMTP_PORT` (587 par défaut ; 465 active TLS), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (« Nom <adresse> » ou une adresse seule), dans `.env` ou dans l'environnement Docker. Ne jamais commiter de valeur réelle.
2. **Adresse de réception** renseignée dans *Site > Réglages du site > Formulaires* (une adresse pour les adhésions, une pour le contact).

Sinon, l'état e-mail du message vaut « Non configuré » et le site fonctionne normalement. Le même SMTP sert au « mot de passe oublié » de l'admin.

En e2e, `EMAIL_CAPTURE_DIR` remplace le SMTP : les e-mails sont écrits en JSON dans `.data/e2e-emails`, rien n'est envoyé.
```

- [ ] **Step 12 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected : tout passe. Les nouveaux tests d'`api-acces.spec.ts` renvoient 403. Dans l'admin, le groupe « Formulaires » contient « Messages reçus », sans bouton de création.

- [ ] **Step 13 : Commit**

```bash
git add package.json package-lock.json scripts/base-jetable.ts scripts/e2e-server.ts src/lib/email/adaptateur.ts src/collections/Messages.ts src/globals/Reglages.ts src/payload.config.ts src/migrations src/payload-types.ts "src/app/(payload)/admin/importMap.js" tests/unit/email-adaptateur.test.ts tests/unit/access.test.ts tests/e2e/api-acces.spec.ts tests/e2e/email-capture.ts .env.example docker-compose.yml README.md
git commit -F - <<'EOF'
feat: collection des messages reçus, adresses de réception et adaptateur e-mail (SMTP ou capture e2e)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3 : Traitement serveur des formulaires (validation, pot de miel, limite, idempotence, référence, e-mail)

**Files:**
- Create: `src/lib/formulaires/schema.ts`, `pays.ts`, `libelles.ts`, `limite.ts`, `reference.ts`, `email.ts`, `traitement.ts`, `entetes.ts`, `repondre.ts`
- Create: `src/app/(site)/api/formulaires/adhesion/route.ts`, `src/app/(site)/api/formulaires/contact/route.ts`
- Create: `tests/unit/formulaires-schema.test.ts`, `tests/unit/formulaires-serveur.test.ts`
- Create: `tests/e2e/formulaires-helpers.ts`, `tests/e2e/formulaires-api.spec.ts`, `tests/e2e/messages-email.spec.ts`

**Interfaces:**
- Consumes :
  - collection `messages` et type `Message` ;
  - `Reglage.emailAdhesions` et `Reglage.emailContact` ;
  - `transportConfigure()` (tâche 2) ;
  - `EMAIL_CAPTURE_DIR` et `emailsCaptures()` (tâche 2) ;
  - `localeFromPath` (`src/lib/i18n/routing.ts`) ; `siteUrl` (`src/lib/seo.ts`).
- Produces (utilisés par les tâches 4, 5 et 6) :
  - `schema.ts` :
    - `type TypeFormulaire = 'adhesion' | 'contact'` ;
    - `type CodeErreur = 'requis' | 'tropLong' | 'email' | 'telephone' | 'invalide' | 'notice'` ;
    - `NOTICE_VERSION = '2026-10-07'` ;
    - `INTERETS` (`'jeunesse' | 'sante' | 'sport' | 'solidarite' | 'autre'`) et le type `Interet` ;
    - `LIMITES` ;
    - les types `ChampAdhesion`, `ChampContact`, `Erreurs<C>`, `Resultat<D, C>`, `DonneesAdhesion`, `DonneesContact`, `ReponseFormulaire` ;
    - `CLE_IDEMPOTENCE: RegExp`, `longueur(s)`, `normaliserTelephone(brut): string | null` ;
    - `validerAdhesion(brut: unknown)` et `validerContact(brut: unknown)` ;
    - `nouvelleCle(): string`.
  - `pays.ts` :
    - `CODES_PAYS` (249 codes) ;
    - `estCodePays(code: string): boolean` ;
    - `nomPays(code: string, locale: string): string` ;
    - `optionsPays(locale: string): { code: string; nom: string }[]`.
  - `libelles.ts` :
    - `LIBELLES_CHAMPS` et `LIBELLES_INTERETS` ;
    - `lignesLisibles(donnees: unknown): { libelle: string; valeur: string }[]`.
  - `limite.ts` :
    - la classe `LimiteurDebit`, avec `autorise(cle, maintenant): boolean` et `enregistre(cle, maintenant): void` ;
    - le singleton `LIMITEUR`.
  - `reference.ts` : `genererReference(type): string` ; `REFERENCE: RegExp`.
  - `email.ts` :
    - le type `EtatEmail` ;
    - `composerEmail(message, base): { subject: string; text: string; replyTo?: string }` ;
    - `notifierMessage(payload, message): Promise<EtatEmail>`.
  - `traitement.ts` : `traiterEnvoi(entree: EntreeTraitement): Promise<SortieTraitement>`.
  - `entetes.ts` : `ipDepuisEntetes(h: Headers): string` ; `localeDepuisReferer(referer: string | null): Locale`.
  - `repondre.ts` : `repondreFormulaire(type, request): Promise<Response>`.
  - HTTP : `POST /api/formulaires/{adhesion|contact}`, avec un corps JSON `{ cle: <uuid>, siteWeb: <pot de miel>, ...champs }`. Réponses :
    - `200 { ok: true, reference }` ;
    - `400 { ok: false, erreur: 'validation', champs }` ;
    - `400 { ok: false, erreur: 'requete' }` ;
    - `413` ou `415 { ok: false, erreur: 'requete' }` ;
    - `429 { ok: false, erreur: 'limite' }` ;
    - `500 { ok: false, erreur: 'serveur' }`.
  - `tests/e2e/formulaires-helpers.ts` :
    - le type `MessageApi` ;
    - `ipAleatoire(): string` ;
    - `envoyerFormulaire(request, type, donnees, options?: { ip?: string; referer?: string })` ;
    - `lireMessage(request, token, reference): Promise<MessageApi | undefined>` ;
    - `purgerMessages(request, token, prefixe): Promise<void>`.

- [ ] **Step 1 : Lire la doc Next**

Lire `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` et `01-app/03-api-reference/03-file-conventions/route.md` (méthode `POST`, objet `Request`, `Response.json`).

- [ ] **Step 2 : Tests des règles partagées, à écrire avant le code**

`tests/unit/formulaires-schema.test.ts` :

```ts
import { describe, expect, it } from 'vitest'
import { CODES_PAYS, estCodePays, nomPays, optionsPays } from '@/lib/formulaires/pays'
import { CLE_IDEMPOTENCE, normaliserTelephone, nouvelleCle, validerAdhesion, validerContact } from '@/lib/formulaires/schema'

const ADHESION = { nom: 'Obiang', prenoms: 'Awa', telephone: '+241 06 12 34 56', notice: true }
const CONTACT = { nom: 'Mba', email: 'visiteur@example.org', message: 'Bonjour' }

describe('téléphone international', () => {
  it('normalise les espaces, points, tirets, parenthèses et le préfixe 00', () => {
    expect(normaliserTelephone('+241 06 12 34 56')).toBe('+24106123456')
    expect(normaliserTelephone('00241 06-12-34-56')).toBe('+24106123456')
    expect(normaliserTelephone('(+33) 6.12.34.56.78')).toBe('+33612345678')
  })
  it('refuse un numéro sans indicatif, trop court ou trop long', () => {
    expect(normaliserTelephone('0612345678')).toBeNull()
    expect(normaliserTelephone('+0612345678')).toBeNull()
    expect(normaliserTelephone('+24112')).toBeNull()
    expect(normaliserTelephone('+1234567890123456')).toBeNull()
  })
})

describe('validation de l’adhésion', () => {
  it('accepte une demande minimale et normalise les données', () => {
    expect(validerAdhesion({ ...ADHESION, email: '', pays: 'ga', interets: ['sport', 'jeunesse', 'sport'] })).toEqual({
      ok: true,
      donnees: { nom: 'Obiang', prenoms: 'Awa', telephone: '+24106123456', email: null, pays: 'GA', ville: null, interets: ['jeunesse', 'sport'], motivation: null },
    })
  })
  it('accepte les noms non latins', () => {
    expect(validerAdhesion({ ...ADHESION, nom: '王', prenoms: 'Ἀλέξανδρος' }).ok).toBe(true)
  })
  it('signale chaque champ requis, et la notice non cochée', () => {
    expect(validerAdhesion({})).toEqual({ ok: false, erreurs: { nom: 'requis', prenoms: 'requis', telephone: 'requis', notice: 'notice' } })
  })
  it('formats et longueurs', () => {
    const r = validerAdhesion({ ...ADHESION, nom: 'x'.repeat(81), telephone: '0612', email: 'a@b', pays: 'XX', ville: 'v'.repeat(101), interets: ['inconnu'], motivation: 'm'.repeat(1001) })
    expect(r).toEqual({ ok: false, erreurs: { nom: 'tropLong', telephone: 'telephone', email: 'email', pays: 'invalide', ville: 'tropLong', interets: 'invalide', motivation: 'tropLong' } })
  })
  it('compte les caractères visibles : 1 000 émojis restent acceptés', () => {
    expect(validerAdhesion({ ...ADHESION, motivation: '🌳'.repeat(1000) }).ok).toBe(true)
  })
  it('ignore les caractères de contrôle et les espaces autour', () => {
    const r = validerAdhesion({ ...ADHESION, nom: '  Obi\u0000ang  ' })
    expect(r.ok && r.donnees.nom).toBe('Obiang')
  })
  it('notice : seule la valeur booléenne vraie est acceptée', () => {
    expect(validerAdhesion({ ...ADHESION, notice: 'on' }).ok).toBe(false)
  })
})

describe('validation du contact', () => {
  it('accepte un message minimal', () => {
    expect(validerContact(CONTACT)).toEqual({ ok: true, donnees: { nom: 'Mba', prenom: null, email: 'visiteur@example.org', telephone: null, organisation: null, message: 'Bonjour' } })
  })
  it('nom, e-mail et message requis ; téléphone vérifié s’il est donné', () => {
    expect(validerContact({ telephone: '06' })).toEqual({ ok: false, erreurs: { nom: 'requis', email: 'requis', telephone: 'telephone', message: 'requis' } })
  })
  it('message de 2 000 caractères maximum', () => {
    expect(validerContact({ ...CONTACT, message: 'm'.repeat(2001) })).toEqual({ ok: false, erreurs: { message: 'tropLong' } })
  })
})

describe('pays', () => {
  it('liste ISO 3166-1 complète, noms traduits et triés', () => {
    expect(CODES_PAYS).toHaveLength(249)
    expect(estCodePays('GA')).toBe(true)
    expect(estCodePays('XX')).toBe(false)
    expect(nomPays('DE', 'fr')).toBe('Allemagne')
    expect(nomPays('DE', 'en')).toBe('Germany')
    const fr = optionsPays('fr')
    expect(fr[0]).toEqual({ code: 'AF', nom: 'Afghanistan' })
    expect(fr.find((p) => p.code === 'GA')?.nom).toBe('Gabon')
  })
})

describe('clé d’idempotence', () => {
  it('UUID v4', () => {
    expect(nouvelleCle()).toMatch(CLE_IDEMPOTENCE)
  })
})
```

Run: `npx vitest run tests/unit/formulaires-schema.test.ts`

Expected: FAIL (modules introuvables).

- [ ] **Step 3 : Pays**

`src/lib/formulaires/pays.ts` :

```ts
/** Codes ISO 3166-1 alpha-2 (249). Les noms viennent d’Intl.DisplayNames, dans la langue de la page. */
export const CODES_PAYS = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ',
  'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ',
  'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
  'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY',
  'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP',
  'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
  'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
  'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM',
  'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ',
  'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
  'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
] as const

const ENSEMBLE: ReadonlySet<string> = new Set(CODES_PAYS)

export function estCodePays(code: string): boolean {
  return ENSEMBLE.has(code)
}

export function nomPays(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

/** Options du sélecteur de pays, triées selon la langue de la page. */
export function optionsPays(locale: string): { code: string; nom: string }[] {
  const noms = new Intl.DisplayNames([locale], { type: 'region' })
  const ordre = new Intl.Collator(locale)
  return CODES_PAYS.map((code) => ({ code, nom: noms.of(code) ?? code })).sort((a, b) => ordre.compare(a.nom, b.nom))
}
```

- [ ] **Step 4 : Règles partagées**

`src/lib/formulaires/schema.ts` :

```ts
import { estCodePays } from './pays'

/* Règles partagées par le navigateur et le serveur : aucune dépendance serveur dans ce fichier. */

export type TypeFormulaire = 'adhesion' | 'contact'
export type CodeErreur = 'requis' | 'tropLong' | 'email' | 'telephone' | 'invalide' | 'notice'

/** Version de la notice d’information du formulaire d’adhésion, enregistrée avec chaque demande. */
export const NOTICE_VERSION = '2026-10-07'

/** Centres d’intérêt, dans l’ordre des libellés `adhesionForm.interestOptions` des dictionnaires. */
export const INTERETS = ['jeunesse', 'sante', 'sport', 'solidarite', 'autre'] as const
export type Interet = (typeof INTERETS)[number]

export const LIMITES = { nom: 80, prenoms: 80, prenom: 80, email: 254, ville: 100, motivation: 1000, organisation: 120, message: 2000 } as const

export type ChampAdhesion = 'nom' | 'prenoms' | 'telephone' | 'email' | 'pays' | 'ville' | 'interets' | 'motivation' | 'notice'
export type ChampContact = 'nom' | 'prenom' | 'email' | 'telephone' | 'organisation' | 'message'
export type Erreurs<C extends string> = Partial<Record<C, CodeErreur>>
export type Resultat<D, C extends string> = { ok: true; donnees: D } | { ok: false; erreurs: Erreurs<C> }

export type DonneesAdhesion = {
  nom: string
  prenoms: string
  telephone: string
  email: string | null
  pays: string | null
  ville: string | null
  interets: Interet[]
  motivation: string | null
}
export type DonneesContact = { nom: string; prenom: string | null; email: string; telephone: string | null; organisation: string | null; message: string }

export type ReponseFormulaire =
  | { ok: true; reference: string }
  | { ok: false; erreur: 'validation'; champs: Erreurs<string> }
  | { ok: false; erreur: 'limite' | 'requete' | 'serveur' }

export const CLE_IDEMPOTENCE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TELEPHONE = /^\+[1-9]\d{6,14}$/

/** Longueur en caractères visibles (un émoji ou un idéogramme compte pour un). */
export const longueur = (s: string): number => [...s].length

/** Chaîne nettoyée : caractères de contrôle retirés (sauf tabulation et retours à la ligne), espaces de bord supprimés. */
function texte(v: unknown): string {
  if (typeof v !== 'string') return ''
  return Array.from(v)
    .filter((c) => {
      const n = c.codePointAt(0) ?? 0
      return n === 9 || n === 10 || n === 13 || (n >= 32 && n !== 127)
    })
    .join('')
    .trim()
}

const objet = (brut: unknown): Record<string, unknown> => (brut && typeof brut === 'object' && !Array.isArray(brut) ? (brut as Record<string, unknown>) : {})

function obligatoire<C extends string>(erreurs: Erreurs<C>, champ: C, valeur: string, max: number) {
  if (!valeur) erreurs[champ] = 'requis'
  else if (longueur(valeur) > max) erreurs[champ] = 'tropLong'
}

function facultatif<C extends string>(erreurs: Erreurs<C>, champ: C, valeur: string, max: number) {
  if (valeur && longueur(valeur) > max) erreurs[champ] = 'tropLong'
}

const emailValide = (v: string) => longueur(v) <= LIMITES.email && EMAIL.test(v)

/** Numéro international : « +241 06 12 34 56 » ou « 00241… » → « +24106123456 » ; null si l’indicatif manque ou si la longueur est hors norme (E.164). */
export function normaliserTelephone(brut: string): string | null {
  const compact = brut.replace(/[\s.\-()  ]/g, '')
  const international = compact.startsWith('00') ? `+${compact.slice(2)}` : compact
  return TELEPHONE.test(international) ? international : null
}

export function validerAdhesion(brut: unknown): Resultat<DonneesAdhesion, ChampAdhesion> {
  const b = objet(brut)
  const erreurs: Erreurs<ChampAdhesion> = {}
  const nom = texte(b.nom)
  const prenoms = texte(b.prenoms)
  const telBrut = texte(b.telephone)
  const email = texte(b.email)
  const pays = texte(b.pays).toUpperCase()
  const ville = texte(b.ville)
  const motivation = texte(b.motivation)

  obligatoire(erreurs, 'nom', nom, LIMITES.nom)
  obligatoire(erreurs, 'prenoms', prenoms, LIMITES.prenoms)
  const telephone = telBrut ? normaliserTelephone(telBrut) : null
  if (!telBrut) erreurs.telephone = 'requis'
  else if (!telephone) erreurs.telephone = 'telephone'
  if (email && !emailValide(email)) erreurs.email = 'email'
  if (pays && !estCodePays(pays)) erreurs.pays = 'invalide'
  facultatif(erreurs, 'ville', ville, LIMITES.ville)
  const choix = b.interets === undefined ? [] : b.interets
  const interetsValides = Array.isArray(choix) && choix.every((i) => (INTERETS as readonly unknown[]).includes(i))
  if (!interetsValides) erreurs.interets = 'invalide'
  facultatif(erreurs, 'motivation', motivation, LIMITES.motivation)
  if (b.notice !== true) erreurs.notice = 'notice'

  if (Object.keys(erreurs).length > 0) return { ok: false, erreurs }
  return {
    ok: true,
    donnees: {
      nom,
      prenoms,
      telephone: telephone as string,
      email: email || null,
      pays: pays || null,
      ville: ville || null,
      interets: INTERETS.filter((i) => (choix as unknown[]).includes(i)),
      motivation: motivation || null,
    },
  }
}

export function validerContact(brut: unknown): Resultat<DonneesContact, ChampContact> {
  const b = objet(brut)
  const erreurs: Erreurs<ChampContact> = {}
  const nom = texte(b.nom)
  const prenom = texte(b.prenom)
  const email = texte(b.email)
  const telBrut = texte(b.telephone)
  const organisation = texte(b.organisation)
  const message = texte(b.message)

  obligatoire(erreurs, 'nom', nom, LIMITES.nom)
  facultatif(erreurs, 'prenom', prenom, LIMITES.prenom)
  if (!email) erreurs.email = 'requis'
  else if (!emailValide(email)) erreurs.email = 'email'
  const telephone = telBrut ? normaliserTelephone(telBrut) : null
  if (telBrut && !telephone) erreurs.telephone = 'telephone'
  facultatif(erreurs, 'organisation', organisation, LIMITES.organisation)
  obligatoire(erreurs, 'message', message, LIMITES.message)

  if (Object.keys(erreurs).length > 0) return { ok: false, erreurs }
  return { ok: true, donnees: { nom, prenom: prenom || null, email, telephone, organisation: organisation || null, message } }
}

/** Clé d’idempotence (UUID v4), générée au premier envoi. Repli sur getRandomValues hors contexte sécurisé (http hors localhost). */
export function nouvelleCle(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const o = crypto.getRandomValues(new Uint8Array(16))
  o[6] = (o[6] & 0x0f) | 0x40
  o[8] = (o[8] & 0x3f) | 0x80
  const h = Array.from(o, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
```

Run: `npx vitest run tests/unit/formulaires-schema.test.ts`

Expected: PASS. Si le test du nom Afghanistan échoue à cause de la version ICU de Node, remplacer l'attente par `expect(fr.map((p) => p.nom)).toEqual([...fr.map((p) => p.nom)].sort(new Intl.Collator('fr').compare))`, sans affaiblir les autres attentes.

- [ ] **Step 5 : Tests du traitement serveur, à écrire avant le code**

`tests/unit/formulaires-serveur.test.ts` :

```ts
import type { Payload } from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { composerEmail, notifierMessage } from '@/lib/formulaires/email'
import { ipDepuisEntetes, localeDepuisReferer } from '@/lib/formulaires/entetes'
import { lignesLisibles } from '@/lib/formulaires/libelles'
import { LimiteurDebit } from '@/lib/formulaires/limite'
import { REFERENCE, genererReference } from '@/lib/formulaires/reference'
import { traiterEnvoi } from '@/lib/formulaires/traitement'
import type { Message } from '@/payload-types'

const CLE = '3b241101-e2bb-4255-8caf-4136c566a962'
const CONTACT = { cle: CLE, nom: 'Mba', prenom: 'Awa', email: 'awa@example.org', message: 'Bonjour\nMerci' }
const ADHESION = { cle: CLE, nom: 'Obiang', prenoms: 'Awa', telephone: '+241 06 12 34 56', pays: 'GA', interets: ['sport', 'jeunesse'], notice: true }

type Doc = Record<string, unknown> & { id: number }

function fauxPayload(options: { destination?: string | null; echecEmail?: boolean; echecCreation?: boolean } = {}) {
  const messages: Doc[] = []
  const emails: Record<string, unknown>[] = []
  const payload = {
    logger: { error: vi.fn() },
    find: vi.fn(async ({ where }: { where: { cleIdempotence: { equals: string } } }) => ({
      docs: messages.filter((m) => m.cleIdempotence === where.cleIdempotence.equals),
    })),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      if (options.echecCreation) throw new Error('base indisponible')
      if (messages.some((m) => m.cleIdempotence === data.cleIdempotence)) throw new Error('duplicate key')
      const doc = { ...data, id: messages.length + 1, createdAt: '2026-10-07T08:00:00.000Z' }
      messages.push(doc)
      return doc
    }),
    update: vi.fn(async ({ id, data }: { id: number; data: Record<string, unknown> }) => Object.assign(messages.find((m) => m.id === id)!, data)),
    findGlobal: vi.fn(async () => ({ emailAdhesions: options.destination ?? null, emailContact: options.destination ?? null })),
    sendEmail: vi.fn(async (m: Record<string, unknown>) => {
      if (options.echecEmail) throw new Error('SMTP indisponible')
      emails.push(m)
    }),
  }
  return { payload: payload as unknown as Payload, brut: payload, messages, emails }
}

const entree = (payload: Payload, corps: unknown, over: Partial<Parameters<typeof traiterEnvoi>[0]> = {}) => ({
  type: 'contact' as const,
  corps,
  ip: '10.0.0.1',
  locale: 'fr' as const,
  payload,
  limiteur: new LimiteurDebit(5, 600_000),
  maintenant: 1_000_000,
  ...over,
})

beforeEach(() => {
  vi.stubEnv('SMTP_HOST', '')
  vi.stubEnv('EMAIL_CAPTURE_DIR', '')
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://site.org')
})
afterEach(() => vi.unstubAllEnvs())

describe('limite de débit', () => {
  it('5 envois par clé et par fenêtre, puis refus ; la fenêtre glisse', () => {
    const l = new LimiteurDebit(5, 600_000)
    for (let i = 0; i < 5; i++) {
      expect(l.autorise('ip', i)).toBe(true)
      l.enregistre('ip', i)
    }
    expect(l.autorise('ip', 10)).toBe(false)
    expect(l.autorise('autre', 10)).toBe(true)
    expect(l.autorise('ip', 600_000)).toBe(true) // le premier envoi (t = 0) sort de la fenêtre
  })
})

describe('référence', () => {
  it('ADH-XXXXXX ou CT-XXXXXX, sans caractère ambigu', () => {
    for (let i = 0; i < 50; i++) {
      expect(genererReference('adhesion')).toMatch(/^ADH-/)
      expect(genererReference('contact')).toMatch(REFERENCE)
    }
  })
})

describe('en-têtes', () => {
  it('IP : premier X-Forwarded-For, puis X-Real-IP', () => {
    expect(ipDepuisEntetes(new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4')
    expect(ipDepuisEntetes(new Headers({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8')
    expect(ipDepuisEntetes(new Headers())).toBe('inconnue')
  })
  it('langue : celle de la page d’origine, sinon le français', () => {
    expect(localeDepuisReferer('https://site.org/en/contact')).toBe('en')
    expect(localeDepuisReferer('https://site.org/fr/adhesion?x=1')).toBe('fr')
    expect(localeDepuisReferer('https://site.org/es/contact')).toBe('fr')
    expect(localeDepuisReferer('pas une url')).toBe('fr')
    expect(localeDepuisReferer(null)).toBe('fr')
  })
})

describe('libellés lisibles', () => {
  it('ordre des champs, pays et centres d’intérêt en clair, valeurs vides omises', () => {
    expect(lignesLisibles({ interets: ['jeunesse', 'sport'], pays: 'GA', nom: 'Obiang', email: null, inconnu: 'x' })).toEqual([
      { libelle: 'Nom', valeur: 'Obiang' },
      { libelle: 'Pays de résidence', valeur: 'Gabon (GA)' },
      { libelle: 'Centres d’intérêt', valeur: 'Jeunesse, Sport' },
    ])
    expect(lignesLisibles(null)).toEqual([])
  })
})

describe('e-mail de notification', () => {
  const message = {
    id: 7,
    reference: 'CT-ABCDEF',
    type: 'contact',
    locale: 'en',
    createdAt: '2026-10-07T08:00:00.000Z',
    donnees: { nom: 'Mba', prenom: 'Awa', email: 'awa@example.org', telephone: null, organisation: null, message: 'Bonjour\nMerci' },
  } as unknown as Message

  it('résumé lisible, lien vers l’admin, réponse au visiteur', () => {
    const mail = composerEmail(message, 'https://site.org')
    expect(mail.subject).toBe('Nouveau message de contact — CT-ABCDEF')
    expect(mail.replyTo).toBe('awa@example.org')
    for (const ligne of ['Référence : CT-ABCDEF', 'Reçu le : 7 octobre 2026 à 09:00 (heure de Libreville)', 'Langue : anglais', 'Nom : Mba', 'Prénom : Awa', 'Message :\nBonjour\nMerci', 'https://site.org/admin/collections/messages/7']) {
      expect(mail.text).toContain(ligne)
    }
    expect(mail.text).not.toContain('Téléphone')
  })

  it('non configuré sans transport, même avec une adresse', async () => {
    const f = fauxPayload({ destination: 'recu@exemple.org' })
    f.messages.push({ ...(message as unknown as Doc) })
    expect(await notifierMessage(f.payload, message)).toEqual({ emailEtat: 'non_configure', emailErreur: null, emailEnvoyeLe: null })
    expect(f.brut.sendEmail).not.toHaveBeenCalled()
  })

  it('non configuré sans adresse de réception, même avec un transport', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    const f = fauxPayload({ destination: null })
    f.messages.push({ ...(message as unknown as Doc) })
    expect((await notifierMessage(f.payload, message)).emailEtat).toBe('non_configure')
  })

  it('envoyé, puis état enregistré sur le message', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    const f = fauxPayload({ destination: 'recu@exemple.org' })
    f.messages.push({ ...(message as unknown as Doc) })
    const etat = await notifierMessage(f.payload, message)
    expect(etat.emailEtat).toBe('envoye')
    expect(f.emails[0]).toMatchObject({ to: 'recu@exemple.org', subject: 'Nouveau message de contact — CT-ABCDEF' })
    expect(f.messages[0]).toMatchObject({ emailEtat: 'envoye', emailErreur: null })
  })

  it('échec : erreur conservée', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    const f = fauxPayload({ destination: 'recu@exemple.org', echecEmail: true })
    f.messages.push({ ...(message as unknown as Doc) })
    expect(await notifierMessage(f.payload, message)).toEqual({ emailEtat: 'echec', emailErreur: 'SMTP indisponible', emailEnvoyeLe: null })
  })
})

describe('traitement d’un envoi', () => {
  it('contact valide : référence, enregistrement complet, e-mail non configuré', async () => {
    const f = fauxPayload()
    const sortie = await traiterEnvoi(entree(f.payload, CONTACT))
    expect(sortie.status).toBe(200)
    expect(sortie.corps.ok && sortie.corps.reference).toMatch(/^CT-/)
    expect(f.messages).toHaveLength(1)
    expect(f.messages[0]).toMatchObject({ type: 'contact', nom: 'Awa Mba', locale: 'fr', noticeVersion: null, cleIdempotence: CLE, emailEtat: 'non_configure', traite: false })
    expect(f.messages[0].donnees).toEqual({ nom: 'Mba', prenom: 'Awa', email: 'awa@example.org', telephone: null, organisation: null, message: 'Bonjour\nMerci' })
  })

  it('adhésion valide : version de la notice et données normalisées', async () => {
    const f = fauxPayload()
    const sortie = await traiterEnvoi(entree(f.payload, ADHESION, { type: 'adhesion', locale: 'en' }))
    expect(sortie.corps.ok && sortie.corps.reference).toMatch(/^ADH-/)
    expect(f.messages[0]).toMatchObject({ type: 'adhesion', nom: 'Awa Obiang', locale: 'en', noticeVersion: '2026-10-07' })
    expect(f.messages[0].donnees).toMatchObject({ telephone: '+24106123456', pays: 'GA', interets: ['jeunesse', 'sport'] })
  })

  it('même clé : même référence, aucun doublon, aucun second e-mail', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    const f = fauxPayload({ destination: 'recu@exemple.org' })
    const limiteur = new LimiteurDebit(5, 600_000)
    const a = await traiterEnvoi(entree(f.payload, CONTACT, { limiteur }))
    const b = await traiterEnvoi(entree(f.payload, CONTACT, { limiteur }))
    expect(b).toEqual(a)
    expect(f.messages).toHaveLength(1)
    expect(f.emails).toHaveLength(1)
  })

  it('même clé pour un autre formulaire : requête refusée', async () => {
    const f = fauxPayload()
    await traiterEnvoi(entree(f.payload, CONTACT))
    expect(await traiterEnvoi(entree(f.payload, ADHESION, { type: 'adhesion' }))).toEqual({ status: 400, corps: { ok: false, erreur: 'requete' } })
  })

  it('pot de miel rempli : succès apparent, rien n’est enregistré ni compté', async () => {
    const f = fauxPayload()
    const limiteur = new LimiteurDebit(1, 600_000)
    const sortie = await traiterEnvoi(entree(f.payload, { ...CONTACT, siteWeb: 'https://spam.example' }, { limiteur }))
    expect(sortie.status).toBe(200)
    expect(sortie.corps.ok && sortie.corps.reference).toMatch(REFERENCE)
    expect(f.messages).toHaveLength(0)
    expect(limiteur.autorise('10.0.0.1', 1_000_000)).toBe(true)
  })

  it('limite atteinte : 429 ; une clé déjà connue garde sa référence', async () => {
    const f = fauxPayload()
    const limiteur = new LimiteurDebit(1, 600_000)
    const premier = await traiterEnvoi(entree(f.payload, CONTACT, { limiteur }))
    const autre = { ...CONTACT, cle: 'a3bb189e-8bf9-4888-9912-ace4e6543002' }
    expect(await traiterEnvoi(entree(f.payload, autre, { limiteur }))).toEqual({ status: 429, corps: { ok: false, erreur: 'limite' } })
    expect(await traiterEnvoi(entree(f.payload, CONTACT, { limiteur }))).toEqual(premier)
  })

  it('validation : 400 avec les erreurs par champ, rien d’enregistré', async () => {
    const f = fauxPayload()
    expect(await traiterEnvoi(entree(f.payload, { cle: CLE, nom: 'Mba' }))).toEqual({ status: 400, corps: { ok: false, erreur: 'validation', champs: { email: 'requis', message: 'requis' } } })
    expect(f.messages).toHaveLength(0)
  })

  it('corps ou clé invalides : 400 requete', async () => {
    const f = fauxPayload()
    for (const corps of [null, [], 'texte', { ...CONTACT, cle: 'pas-une-cle' }]) {
      expect(await traiterEnvoi(entree(f.payload, corps))).toEqual({ status: 400, corps: { ok: false, erreur: 'requete' } })
    }
  })

  it('échec de l’e-mail : l’enregistrement et la référence restent', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    const f = fauxPayload({ destination: 'recu@exemple.org', echecEmail: true })
    const sortie = await traiterEnvoi(entree(f.payload, CONTACT))
    expect(sortie.status).toBe(200)
    expect(f.messages[0]).toMatchObject({ emailEtat: 'echec', emailErreur: 'SMTP indisponible' })
  })

  it('échec de l’enregistrement : l’erreur remonte (la route répond 500)', async () => {
    const f = fauxPayload({ echecCreation: true })
    await expect(traiterEnvoi(entree(f.payload, CONTACT))).rejects.toThrow('base indisponible')
  })
})
```

Run: `npx vitest run tests/unit/formulaires-serveur.test.ts`

Expected: FAIL (modules introuvables).

- [ ] **Step 6 : Libellés, limite et référence**

`src/lib/formulaires/libelles.ts` :

```ts
import { nomPays } from './pays'
import type { Interet } from './schema'

/** Libellés français des champs, dans l’ordre d’affichage (admin et e-mail de notification). */
export const LIBELLES_CHAMPS: Record<string, string> = {
  nom: 'Nom',
  prenoms: 'Prénom(s)',
  prenom: 'Prénom',
  telephone: 'Téléphone',
  email: 'E-mail',
  pays: 'Pays de résidence',
  ville: 'Ville',
  organisation: 'Organisation',
  interets: 'Centres d’intérêt',
  motivation: 'Motivation',
  message: 'Message',
}

export const LIBELLES_INTERETS: Record<Interet, string> = {
  jeunesse: 'Jeunesse',
  sante: 'Santé et sensibilisation',
  sport: 'Sport',
  solidarite: 'Solidarité et vie locale',
  autre: 'Autre contribution',
}

function valeurLisible(champ: string, valeur: unknown): string {
  if (valeur === null || valeur === undefined) return ''
  if (champ === 'pays' && typeof valeur === 'string') return `${nomPays(valeur, 'fr')} (${valeur})`
  if (champ === 'interets' && Array.isArray(valeur)) return valeur.map((i) => LIBELLES_INTERETS[i as Interet] ?? String(i)).join(', ')
  return String(valeur)
}

/** Données d’un message en lignes « libellé : valeur » ; champs inconnus et valeurs vides omis. */
export function lignesLisibles(donnees: unknown): { libelle: string; valeur: string }[] {
  if (!donnees || typeof donnees !== 'object' || Array.isArray(donnees)) return []
  const d = donnees as Record<string, unknown>
  return Object.keys(LIBELLES_CHAMPS)
    .filter((champ) => champ in d)
    .map((champ) => ({ libelle: LIBELLES_CHAMPS[champ], valeur: valeurLisible(champ, d[champ]) }))
    .filter((ligne) => ligne.valeur !== '')
}
```

`src/lib/formulaires/limite.ts` :

```ts
export const LIMITE_ENVOIS = 5
export const FENETRE_MS = 10 * 60 * 1000

/**
 * Limite de débit en mémoire (un seul processus) : au plus `limite` envois enregistrés par clé (IP) sur une fenêtre glissante.
 * Garde-fou anti-spam, pas une sécurité : l’IP vient d’en-têtes que le client peut fournir.
 */
export class LimiteurDebit {
  private readonly envois = new Map<string, number[]>()
  private readonly limite: number
  private readonly fenetreMs: number

  constructor(limite = LIMITE_ENVOIS, fenetreMs = FENETRE_MS) {
    this.limite = limite
    this.fenetreMs = fenetreMs
  }

  private recents(cle: string, maintenant: number): number[] {
    const liste = (this.envois.get(cle) ?? []).filter((t) => maintenant - t < this.fenetreMs)
    if (liste.length > 0) this.envois.set(cle, liste)
    else this.envois.delete(cle)
    return liste
  }

  autorise(cle: string, maintenant: number): boolean {
    return this.recents(cle, maintenant).length < this.limite
  }

  enregistre(cle: string, maintenant: number): void {
    this.envois.set(cle, [...this.recents(cle, maintenant), maintenant])
    if (this.envois.size > 10_000) for (const k of [...this.envois.keys()]) this.recents(k, maintenant)
  }
}

// Partagé entre les routes adhésion et contact (chaque Route Handler a son propre bundle).
const global = globalThis as typeof globalThis & { __limiteurFormulaires?: LimiteurDebit }
export const LIMITEUR: LimiteurDebit = (global.__limiteurFormulaires ??= new LimiteurDebit())
```

`src/lib/formulaires/reference.ts` :

```ts
import { randomInt } from 'node:crypto'
import type { TypeFormulaire } from './schema'

/** Sans I, O, 0 ni 1 : lisible au téléphone. 32⁶ ≈ 10⁹ combinaisons, tirées par un générateur cryptographique. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const PREFIXES: Record<TypeFormulaire, string> = { adhesion: 'ADH', contact: 'CT' }
export const REFERENCE = /^(ADH|CT)-[A-HJ-NP-Z2-9]{6}$/

export function genererReference(type: TypeFormulaire): string {
  let suite = ''
  for (let i = 0; i < 6; i++) suite += ALPHABET[randomInt(ALPHABET.length)]
  return `${PREFIXES[type]}-${suite}`
}
```

- [ ] **Step 7 : E-mail, en-têtes et traitement**

`src/lib/formulaires/email.ts` :

```ts
import type { Payload } from 'payload'
import type { Message } from '@/payload-types'
import { transportConfigure } from '../email/adaptateur'
import { siteUrl } from '../seo'
import { lignesLisibles } from './libelles'

export type EtatEmail = { emailEtat: Message['emailEtat']; emailErreur: string | null; emailEnvoyeLe: string | null }

const DATE = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Libreville' })

type MessageEmail = Pick<Message, 'id' | 'reference' | 'type' | 'donnees' | 'locale' | 'createdAt'>

export function composerEmail(message: MessageEmail, base: string): { subject: string; text: string; replyTo?: string } {
  const adhesion = message.type === 'adhesion'
  const titre = adhesion ? 'Nouvelle demande d’adhésion' : 'Nouveau message de contact'
  const intro = adhesion ? 'Une demande d’adhésion a été envoyée depuis le site.' : 'Un message a été envoyé depuis le formulaire de contact du site.'
  const lignes = lignesLisibles(message.donnees).map(({ libelle, valeur }) => (valeur.includes('\n') ? `${libelle} :\n${valeur}` : `${libelle} : ${valeur}`))
  const donnees = (message.donnees ?? {}) as Record<string, unknown>
  const email = typeof donnees.email === 'string' && donnees.email ? donnees.email : undefined
  return {
    subject: `${titre} — ${message.reference}`,
    text: [
      intro,
      '',
      `Référence : ${message.reference}`,
      `Reçu le : ${DATE.format(new Date(message.createdAt))} (heure de Libreville)`,
      `Langue : ${message.locale === 'en' ? 'anglais' : 'français'}`,
      '',
      ...lignes,
      '',
      `Voir le message dans l’admin : ${base}/admin/collections/messages/${message.id}`,
    ].join('\n'),
    ...(email ? { replyTo: email } : {}),
  }
}

/** Envoie la notification si le transport et l’adresse de réception sont configurés, puis enregistre l’état sur le message. */
export async function notifierMessage(payload: Payload, message: Message): Promise<EtatEmail> {
  const reglages = await payload.findGlobal({ slug: 'reglages', depth: 0, overrideAccess: true })
  const destination = (message.type === 'adhesion' ? reglages.emailAdhesions : reglages.emailContact)?.trim()
  let etat: EtatEmail
  if (!transportConfigure() || !destination) {
    etat = { emailEtat: 'non_configure', emailErreur: null, emailEnvoyeLe: null }
  } else {
    try {
      await payload.sendEmail({ to: destination, ...composerEmail(message, siteUrl()) })
      etat = { emailEtat: 'envoye', emailErreur: null, emailEnvoyeLe: new Date().toISOString() }
    } catch (error) {
      etat = { emailEtat: 'echec', emailErreur: (error instanceof Error ? error.message : String(error)).slice(0, 500), emailEnvoyeLe: null }
    }
  }
  await payload.update({ collection: 'messages', id: message.id, data: etat, depth: 0, overrideAccess: true })
  return etat
}
```

`src/lib/formulaires/entetes.ts` :

```ts
import { DEFAULT_LOCALE, type Locale } from '../i18n/config'
import { localeFromPath } from '../i18n/routing'

/** IP du visiteur pour la limite de débit : premier X-Forwarded-For (posé par le proxy, ou par Next s’il est absent), puis X-Real-IP. */
export function ipDepuisEntetes(h: Headers): string {
  const transmise = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  return transmise || h.get('x-real-ip')?.trim() || 'inconnue'
}

/** Langue de la page d’où vient l’envoi (Referer) ; jamais une valeur du corps de la requête. */
export function localeDepuisReferer(referer: string | null): Locale {
  if (!referer) return DEFAULT_LOCALE
  try {
    return localeFromPath(new URL(referer).pathname)
  } catch {
    return DEFAULT_LOCALE
  }
}
```

`src/lib/formulaires/traitement.ts` :

```ts
import type { Payload } from 'payload'
import type { Message } from '@/payload-types'
import type { Locale } from '../i18n/config'
import { notifierMessage } from './email'
import type { LimiteurDebit } from './limite'
import { genererReference } from './reference'
import {
  CLE_IDEMPOTENCE,
  NOTICE_VERSION,
  validerAdhesion,
  validerContact,
  type DonneesAdhesion,
  type DonneesContact,
  type ReponseFormulaire,
  type TypeFormulaire,
} from './schema'

export type EntreeTraitement = {
  type: TypeFormulaire
  corps: unknown
  ip: string
  locale: Locale
  payload: Payload
  limiteur: LimiteurDebit
  maintenant?: number
}
export type SortieTraitement = { status: number; corps: ReponseFormulaire }

const REQUETE: SortieTraitement = { status: 400, corps: { ok: false, erreur: 'requete' } }
const succes = (reference: string): SortieTraitement => ({ status: 200, corps: { ok: true, reference } })

async function messageParCle(payload: Payload, cle: string): Promise<Message | undefined> {
  const res = await payload.find({ collection: 'messages', where: { cleIdempotence: { equals: cle } }, limit: 1, depth: 0, overrideAccess: true })
  return res.docs[0]
}

function nomAffiche(donnees: DonneesAdhesion | DonneesContact): string {
  return 'prenoms' in donnees ? `${donnees.prenoms} ${donnees.nom}` : [donnees.prenom, donnees.nom].filter(Boolean).join(' ')
}

/** Crée le message ; si un envoi simultané avec la même clé l’a déjà créé, renvoie celui-là (nouveau = false). */
async function enregistrer(payload: Payload, type: TypeFormulaire, cle: string, donnees: DonneesAdhesion | DonneesContact, locale: Locale): Promise<{ message: Message; nouveau: boolean }> {
  for (let essai = 1; ; essai++) {
    try {
      const message = await payload.create({
        collection: 'messages',
        overrideAccess: true,
        data: {
          reference: genererReference(type),
          type,
          nom: nomAffiche(donnees),
          donnees,
          locale,
          noticeVersion: type === 'adhesion' ? NOTICE_VERSION : null,
          cleIdempotence: cle,
          // État provisoire, remplacé par notifierMessage : un arrêt brutal laisse un état honnête et renvoyable.
          emailEtat: 'echec',
          emailErreur: 'Envoi non terminé.',
          traite: false,
        },
      })
      return { message, nouveau: true }
    } catch (error) {
      const existant = await messageParCle(payload, cle)
      if (existant) return { message: existant, nouveau: false }
      if (essai >= 3) throw error // sinon : collision de référence (improbable), nouvel essai
    }
  }
}

/**
 * Traite un envoi de formulaire. Ordre : requête bien formée, pot de miel, idempotence, limite, validation,
 * enregistrement (le succès n’est annoncé que s’il réussit), puis e-mail (son échec n’annule rien).
 */
export async function traiterEnvoi({ type, corps, ip, locale, payload, limiteur, maintenant = Date.now() }: EntreeTraitement): Promise<SortieTraitement> {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps)) return REQUETE
  const brut = corps as Record<string, unknown>
  const cle = typeof brut.cle === 'string' ? brut.cle.toLowerCase() : ''
  if (!CLE_IDEMPOTENCE.test(cle)) return REQUETE

  if (typeof brut.siteWeb === 'string' && brut.siteWeb.trim() !== '') return succes(genererReference(type))

  const existant = await messageParCle(payload, cle)
  if (existant) return existant.type === type ? succes(existant.reference) : REQUETE

  if (!limiteur.autorise(ip, maintenant)) return { status: 429, corps: { ok: false, erreur: 'limite' } }

  const resultat = type === 'adhesion' ? validerAdhesion(brut) : validerContact(brut)
  if (!resultat.ok) return { status: 400, corps: { ok: false, erreur: 'validation', champs: resultat.erreurs } }

  const { message, nouveau } = await enregistrer(payload, type, cle, resultat.donnees, locale)
  if (nouveau) {
    limiteur.enregistre(ip, maintenant)
    try {
      await notifierMessage(payload, message)
    } catch (error) {
      payload.logger.error({ err: error }, `Notification e-mail impossible pour ${message.reference}`)
    }
  }
  return succes(message.reference)
}
```

Run: `npx vitest run tests/unit/formulaires-serveur.test.ts tests/unit/formulaires-schema.test.ts`

Expected: PASS. Si `tsc` refuse `data` dans `payload.create` (type `donnees` généré), ajouter `as Message['donnees']` sur `donnees` seulement.

- [ ] **Step 8 : Adaptation HTTP et routes**

`src/lib/formulaires/repondre.ts` :

```ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { ipDepuisEntetes, localeDepuisReferer } from './entetes'
import { LIMITEUR } from './limite'
import type { ReponseFormulaire, TypeFormulaire } from './schema'
import { traiterEnvoi } from './traitement'

const TAILLE_MAX = 20_000

const repondre = (corps: ReponseFormulaire, status: number) => Response.json(corps, { status, headers: { 'Cache-Control': 'no-store' } })

/** POST /api/formulaires/{type} : JSON uniquement (un formulaire tiers ne peut pas poster ici sans requête CORS préalable). */
export async function repondreFormulaire(type: TypeFormulaire, request: Request): Promise<Response> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) return repondre({ ok: false, erreur: 'requete' }, 415)
  const texte = await request.text()
  if (texte.length > TAILLE_MAX) return repondre({ ok: false, erreur: 'requete' }, 413)
  let corps: unknown
  try {
    corps = JSON.parse(texte)
  } catch {
    return repondre({ ok: false, erreur: 'requete' }, 400)
  }
  const payload = await getPayload({ config })
  try {
    const sortie = await traiterEnvoi({
      type,
      corps,
      ip: ipDepuisEntetes(request.headers),
      locale: localeDepuisReferer(request.headers.get('referer')),
      payload,
      limiteur: LIMITEUR,
    })
    return repondre(sortie.corps, sortie.status)
  } catch (error) {
    payload.logger.error({ err: error }, `Formulaire ${type} : enregistrement impossible`)
    return repondre({ ok: false, erreur: 'serveur' }, 500)
  }
}
```

`src/app/(site)/api/formulaires/adhesion/route.ts` :

```ts
import { repondreFormulaire } from '@/lib/formulaires/repondre'

export async function POST(request: Request): Promise<Response> {
  return repondreFormulaire('adhesion', request)
}
```

`src/app/(site)/api/formulaires/contact/route.ts` :

```ts
import { repondreFormulaire } from '@/lib/formulaires/repondre'

export async function POST(request: Request): Promise<Response> {
  return repondreFormulaire('contact', request)
}
```

**Vérification de routage.** Les routes statiques `formulaires/*` doivent gagner sur le catch-all `src/app/(payload)/api/[...slug]/route.ts`, comme `apercu`. Si le serveur de dev de l'utilisateur tourne sur 3000 (ne jamais l'arrêter), lancer :

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{}' http://localhost:3000/api/formulaires/contact
```

Expected : `{"ok":false,"erreur":"requete"}`. Une réponse JSON de Payload de la forme `{"errors":[...]}` voudrait dire que le catch-all intercepte la requête. Dans ce cas, déplacer les routes dans `src/app/formulaires/{adhesion,contact}/route.ts`, ajouter `formulaires` à `PASSTHROUGH` (`src/lib/i18n/routing.ts`) et au `matcher` de `src/proxy.ts`, adapter l'URL dans les tests et le signaler dans le rapport. Si le serveur de dev ne tourne pas, l'e2e du step 10 fait la même vérification.

- [ ] **Step 9 : Helpers e2e**

`tests/e2e/formulaires-helpers.ts` :

```ts
import { randomUUID } from 'node:crypto'
import { expect, type APIRequestContext } from '@playwright/test'

export type MessageApi = {
  id: number
  reference: string
  type: 'adhesion' | 'contact'
  nom: string
  locale: 'fr' | 'en'
  noticeVersion: string | null
  donnees: Record<string, unknown>
  emailEtat: 'envoye' | 'echec' | 'non_configure'
  emailErreur: string | null
  emailEnvoyeLe: string | null
  traite: boolean
}

/** IP fictive propre à un test : chaque test a son propre quota de 5 envois. */
export function ipAleatoire(): string {
  const n = () => Math.floor(Math.random() * 254) + 1
  return `10.${n()}.${n()}.${n()}`
}

export function envoyerFormulaire(request: APIRequestContext, type: 'adhesion' | 'contact', donnees: Record<string, unknown>, options: { ip?: string; referer?: string } = {}) {
  return request.post(`/api/formulaires/${type}`, {
    data: { cle: randomUUID(), ...donnees },
    headers: { 'X-Forwarded-For': options.ip ?? ipAleatoire(), ...(options.referer ? { Referer: options.referer } : {}) },
  })
}

export async function lireMessage(request: APIRequestContext, token: string, reference: string): Promise<MessageApi | undefined> {
  const res = await request.get(`/api/messages?where[reference][equals]=${encodeURIComponent(reference)}&depth=0`, { headers: { Authorization: `JWT ${token}` } })
  expect(res.ok(), await res.text()).toBe(true)
  return ((await res.json()).docs as MessageApi[])[0]
}

/** Supprime les messages de test d’une spec (préfixe propre à la spec, dans le nom). */
export async function purgerMessages(request: APIRequestContext, token: string, prefixe: string): Promise<void> {
  const headers = { Authorization: `JWT ${token}` }
  const res = await request.get(`/api/messages?where[nom][like]=${encodeURIComponent(prefixe)}&limit=200&depth=0`, { headers })
  expect(res.ok(), await res.text()).toBe(true)
  for (const doc of (await res.json()).docs as { id: number }[]) await request.delete(`/api/messages/${doc.id}`, { headers })
}
```

- [ ] **Step 10 : Specs e2e**

`tests/e2e/formulaires-api.spec.ts` :

```ts
import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { adminToken } from './admin-helpers'
import { envoyerFormulaire, ipAleatoire, lireMessage, purgerMessages } from './formulaires-helpers'

const PREFIXE = 'e2e-api-'
const CONTACT = { nom: `${PREFIXE}Mba`, email: 'visiteur@example.org', message: 'Bonjour, une question.' }
const ADHESION = { nom: `${PREFIXE}Obiang`, prenoms: 'Awa', telephone: '+241 06 12 34 56', notice: true }

test.describe('traitement des formulaires (API)', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    await purgerMessages(request, token, PREFIXE)
  })
  test.afterAll(async ({ request }) => {
    await purgerMessages(request, token, PREFIXE)
  })

  test('contact valide : référence CT et message enregistré', async ({ request }) => {
    const res = await envoyerFormulaire(request, 'contact', CONTACT)
    expect(res.status()).toBe(200)
    const { ok, reference } = await res.json()
    expect(ok).toBe(true)
    expect(reference).toMatch(/^CT-[A-HJ-NP-Z2-9]{6}$/)
    expect(await lireMessage(request, token, reference)).toMatchObject({ type: 'contact', locale: 'fr', nom: CONTACT.nom, noticeVersion: null })
  })

  test('adhésion valide : téléphone normalisé, notice versionnée, e-mail « non configuré »', async ({ request }) => {
    const { reference } = await (await envoyerFormulaire(request, 'adhesion', ADHESION)).json()
    expect(reference).toMatch(/^ADH-/)
    const message = await lireMessage(request, token, reference)
    // Aucune spec ne renseigne emailAdhesions : l’état est toujours « non configuré » pour une adhésion.
    expect(message).toMatchObject({ type: 'adhesion', nom: `Awa ${PREFIXE}Obiang`, noticeVersion: '2026-10-07', emailEtat: 'non_configure' })
    expect(message?.donnees).toMatchObject({ telephone: '+24106123456', interets: [] })
  })

  test('langue déduite de la page d’origine, jamais du corps', async ({ request }) => {
    const en = await (await envoyerFormulaire(request, 'contact', { ...CONTACT, locale: 'fr' }, { referer: 'http://localhost:3100/en/contact' })).json()
    expect((await lireMessage(request, token, en.reference))?.locale).toBe('en')
    const sans = await (await envoyerFormulaire(request, 'contact', { ...CONTACT, locale: 'en' })).json()
    expect((await lireMessage(request, token, sans.reference))?.locale).toBe('fr')
  })

  test('même clé deux fois : même référence, un seul message', async ({ request }) => {
    const cle = randomUUID()
    const ip = ipAleatoire()
    const a = await (await envoyerFormulaire(request, 'contact', { ...CONTACT, cle }, { ip })).json()
    const b = await (await envoyerFormulaire(request, 'contact', { ...CONTACT, cle }, { ip })).json()
    expect(b.reference).toBe(a.reference)
    const res = await request.get(`/api/messages?where[cleIdempotence][equals]=${cle}&depth=0`, { headers: { Authorization: `JWT ${token}` } })
    expect((await res.json()).totalDocs).toBe(1)
  })

  test('pot de miel rempli : succès apparent, rien n’est enregistré', async ({ request }) => {
    const res = await envoyerFormulaire(request, 'contact', { ...CONTACT, siteWeb: 'https://spam.example' })
    expect(res.status()).toBe(200)
    const { reference } = await res.json()
    expect(reference).toMatch(/^CT-/)
    expect(await lireMessage(request, token, reference)).toBeUndefined()
  })

  test('au-delà de 5 envois par IP en 10 minutes : refus 429', async ({ request }) => {
    const ip = ipAleatoire()
    for (let i = 0; i < 5; i++) expect((await envoyerFormulaire(request, 'contact', CONTACT, { ip })).status()).toBe(200)
    const refus = await envoyerFormulaire(request, 'contact', CONTACT, { ip })
    expect(refus.status()).toBe(429)
    expect(await refus.json()).toEqual({ ok: false, erreur: 'limite' })
    expect((await envoyerFormulaire(request, 'contact', CONTACT)).status()).toBe(200) // autre IP : accepté
  })

  test('champs invalides : 400 avec l’erreur de chaque champ', async ({ request }) => {
    const res = await envoyerFormulaire(request, 'adhesion', { nom: '', prenoms: 'Awa', telephone: '0612', email: 'x@', notice: false })
    expect(res.status()).toBe(400)
    expect(await res.json()).toEqual({ ok: false, erreur: 'validation', champs: { nom: 'requis', telephone: 'telephone', email: 'email', notice: 'notice' } })
  })

  test('requête mal formée : 415 sans JSON, 400 sans clé', async ({ request }) => {
    expect((await request.post('/api/formulaires/contact', { headers: { 'Content-Type': 'text/plain' }, data: 'nom=x' })).status()).toBe(415)
    expect((await request.post('/api/formulaires/contact', { data: CONTACT })).status()).toBe(400)
  })
})
```

`tests/e2e/messages-email.spec.ts` :

```ts
import { expect, test, type APIRequestContext } from '@playwright/test'
import { adminToken } from './admin-helpers'
import { emailsCaptures } from './email-capture'
import { envoyerFormulaire, lireMessage, purgerMessages } from './formulaires-helpers'

const PREFIXE = 'e2e-mail-'
const DESTINATAIRE = 'e2e-reception@terredavenir.local'
const CONTACT = { email: 'visiteur@example.org', message: 'Message de test de la notification.' }

test.describe.configure({ mode: 'serial' })

// Seule spec qui modifie Réglages > emailContact : elle le remet à vide après coup. Aucune autre spec n’affirme l’état e-mail d’un contact.
test.describe('notification e-mail des messages', { tag: '@desktop' }, () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''
  const refs: Record<string, string> = {}

  async function reglerContact(request: APIRequestContext, adresse: string | null) {
    const res = await request.post('/api/globals/reglages', { headers: { Authorization: `JWT ${token}` }, data: { emailContact: adresse } })
    expect(res.ok(), await res.text()).toBe(true)
  }

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    await purgerMessages(request, token, PREFIXE)
    await reglerContact(request, null)
  })
  test.afterAll(async ({ request }) => {
    await reglerContact(request, null)
    await purgerMessages(request, token, PREFIXE)
  })

  test('sans adresse de réception : enregistré, état « non configuré », aucun e-mail', async ({ request }) => {
    const { reference } = await (await envoyerFormulaire(request, 'contact', { ...CONTACT, nom: `${PREFIXE}Sans-adresse` })).json()
    refs.sansAdresse = reference
    expect(await lireMessage(request, token, reference)).toMatchObject({ emailEtat: 'non_configure' })
    expect(emailsCaptures().some((e) => e.text?.includes(reference))).toBe(false)
  })

  test('avec adresse : e-mail capturé avec la référence et le lien admin, état « envoyé »', async ({ request }) => {
    await reglerContact(request, DESTINATAIRE)
    const { reference } = await (await envoyerFormulaire(request, 'contact', { ...CONTACT, nom: `${PREFIXE}Avec-adresse` })).json()
    refs.avecAdresse = reference
    const message = await lireMessage(request, token, reference)
    expect(message).toMatchObject({ emailEtat: 'envoye', emailErreur: null })
    expect(message?.emailEnvoyeLe).toBeTruthy()
    const email = emailsCaptures().find((e) => e.text?.includes(reference))
    expect(email, 'e-mail capturé').toBeDefined()
    expect(email!.to).toBe(DESTINATAIRE)
    expect(email!.subject).toContain(reference)
    expect(email!.text).toContain(`/admin/collections/messages/${message!.id}`)
    expect(email!.replyTo).toBe(CONTACT.email)
  })
})
```

L'e-mail est envoyé avant la réponse (décision 5) : aucune attente n'est nécessaire. Si `POST /api/globals/reglages` refuse la mise à jour partielle (`facebookUrl` requis), lire d'abord le global (`GET /api/globals/reglages?depth=0` avec le jeton) et renvoyer `facebookUrl` avec `emailContact`.

Run: `npm run test:e2e -- tests/e2e/formulaires-api.spec.ts tests/e2e/messages-email.spec.ts --project=desktop`

Expected : PASS (les tests ont été écrits en même temps que le code. Une première exécution avant le step 8 aurait échoué en 404).

- [ ] **Step 11 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected : tout passe.

- [ ] **Step 12 : Commit**

```bash
git add src/lib/formulaires "src/app/(site)/api/formulaires" tests/unit/formulaires-schema.test.ts tests/unit/formulaires-serveur.test.ts tests/e2e/formulaires-helpers.ts tests/e2e/formulaires-api.spec.ts tests/e2e/messages-email.spec.ts
git commit -F - <<'EOF'
feat: traitement des formulaires (validation, pot de miel, limite, idempotence, référence, e-mail)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4 : Formulaire de contact actif

**Files:**
- Create: `src/components/forms/useEnvoiFormulaire.ts`, `src/components/forms/ChampErreur.tsx`, `src/components/forms/SuccesEnvoi.tsx`, `src/components/forms/texte-erreur.ts`
- Modify (réécriture) : `src/components/forms/ContactForm.tsx`
- Modify: `src/app/(site)/[locale]/contact/page.tsx`
- Modify: `src/lib/i18n/dictionaries/fr.ts`, `src/lib/i18n/dictionaries/en.ts`
- Modify: `src/seed/data/fr.ts`, `src/seed/data/en.ts` (section `formulaire` de la page contact)
- Modify: `tests/unit/forms.test.tsx`, `tests/e2e/formulaires.spec.ts`

**Interfaces:**
- Consumes :
  - `validerContact`, `nouvelleCle`, `LIMITES`, `CLE_IDEMPOTENCE` et les types `ChampContact`, `CodeErreur`, `Erreurs`, `Resultat`, `ReponseFormulaire`, `TypeFormulaire` (tâche 3) ;
  - `POST /api/formulaires/contact` (tâche 3) ;
  - `ipAleatoire`, `lireMessage`, `purgerMessages` (tâche 3).
- Produces (réutilisés par la tâche 5) :
  - `useEnvoiFormulaire<D, C extends string>(type: TypeFormulaire, valider: (brut: Record<string, unknown>) => Resultat<D, C>)`, qui renvoie `{ statut: Statut; reference: string | null; erreurs: Erreurs<C>; soumettre(brut): Promise<Erreurs<C>> }` ;
  - le type `Statut = 'saisie' | 'envoi' | 'succes' | 'erreur' | 'limite'` ;
  - `ChampErreur({ id, message })` ;
  - `SuccesEnvoi({ texte, reference, liens })` ;
  - `texteErreur(code, champ, textes, locale): string | null` ;
  - les clés de dictionnaire `formulaires.{retourAccueil, limite, piege, erreurs.{requis, tropLong, email, telephone, invalide, notice}}`.

- [ ] **Step 1 : Dictionnaires**

Dans `src/lib/i18n/dictionaries/fr.ts`, remplacer le bloc `contactForm` par le suivant, puis ajouter `formulaires` juste après, en dernière clé de l'objet :

```ts
  contactForm: {
    lastName: 'Nom *',
    firstName: 'Prénom (facultatif)',
    email: 'Adresse e-mail *',
    phone: 'Téléphone (facultatif)',
    organisation: 'Organisation (si applicable)',
    message: 'Votre message *',
    submit: 'Envoyer le message',
    requiredHint: 'Les champs marqués d’un astérisque sont nécessaires.',
    helpMessage: '2 000 caractères maximum.',
    phonePlaceholder: '+241 …',
    sending: 'Votre message est en cours d’envoi…',
    success: 'Votre message a été enregistré. Référence : {reference}. Il sera examiné par l’ONG.',
    networkError: 'Nous n’avons pas pu confirmer l’enregistrement de votre message. Vos informations restent affichées. Réessayez dans quelques instants.',
    dataNotice: 'Vos informations sont enregistrées par Terre d’Avenir KOMO-KANGO pour traiter votre message. Elles ne sont pas publiées et ne servent pas à une newsletter.',
  },
  formulaires: {
    retourAccueil: 'Retour à l’accueil',
    limite: 'Plusieurs envois ont déjà été faits depuis cette connexion. Réessayez dans une dizaine de minutes.',
    piege: 'Laissez ce champ vide',
    erreurs: {
      requis: 'Ce champ est nécessaire pour traiter votre demande.',
      tropLong: 'Ce texte ne peut pas dépasser {max} caractères.',
      email: 'Vérifiez le format de votre adresse e-mail.',
      telephone: 'Vérifiez votre numéro et son indicatif international.',
      invalide: 'Cette valeur n’est pas reconnue.',
      notice: 'Veuillez prendre connaissance des informations sur le traitement de votre demande.',
    },
  },
```

Les messages `requis`, `email`, `telephone` et `notice` sont repris mot pour mot des Textes v1.3 (« États et messages exacts »).

Dans `src/lib/i18n/dictionaries/en.ts`, mêmes clés dans le même ordre :

```ts
  contactForm: {
    lastName: 'Last name *',
    firstName: 'First name (optional)',
    email: 'Email address *',
    phone: 'Phone (optional)',
    organisation: 'Organization (if applicable)',
    message: 'Your message *',
    submit: 'Send message',
    requiredHint: 'Fields marked with an asterisk are required.',
    helpMessage: '2,000 characters maximum.',
    phonePlaceholder: '+241 …',
    sending: 'Your message is being sent…',
    success: 'Your message has been recorded. Reference: {reference}. It will be reviewed by the NGO.',
    networkError: 'We could not confirm that your message was recorded. Your information is still displayed. Please try again in a moment.',
    dataNotice: 'Your information is recorded by Terre d’Avenir KOMO-KANGO to process your message. It is not published and is not used for a newsletter.',
  },
  formulaires: {
    retourAccueil: 'Back to home',
    limite: 'Several submissions have already been made from this connection. Please try again in about ten minutes.',
    piege: 'Leave this field empty',
    erreurs: {
      requis: 'This field is required to process your request.',
      tropLong: 'This text cannot exceed {max} characters.',
      email: 'Check the format of your email address.',
      telephone: 'Check your number and its international dialling code.',
      invalide: 'This value is not recognised.',
      notice: 'Please read the information on how your request is processed.',
    },
  },
```

- [ ] **Step 2 : Tests unitaires, à écrire avant le code**

Dans `tests/unit/forms.test.tsx` :
- remplacer les imports de tête par ceux ci-dessous ;
- supprimer le test `it('contact : désactivé', …)` ;
- ajouter le `describe` ci-dessous.

Le test de l'adhésion (encore désactivée jusqu'à la tâche 5) et le bloc « masquage des brouillons » ne changent pas.

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AdhesionForm from '@/components/forms/AdhesionForm'
import ContactForm from '@/components/forms/ContactForm'
import ClosedNotice from '@/components/forms/ClosedNotice'
import StepsSection from '@/components/forms/StepsSection'
import { CLE_IDEMPOTENCE } from '@/lib/formulaires/schema'
import { getDictionary } from '@/lib/i18n/dictionaries'
```

```tsx
describe('formulaire de contact', () => {
  afterEach(() => vi.unstubAllGlobals())
  const rendu = () => render(<ContactForm locale="fr" labels={dict.contactForm} commun={dict.formulaires} />)
  const bouton = () => screen.getByRole('button', { name: 'Envoyer le message' })
  async function remplir(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText('Nom *'), 'Mba')
    await user.type(screen.getByLabelText('Adresse e-mail *'), 'awa@example.org')
    await user.type(screen.getByLabelText('Votre message *'), 'Bonjour')
  }
  const corpsEnvoye = (fetch: ReturnType<typeof vi.fn>, i: number) => JSON.parse((fetch.mock.calls[i] as [string, RequestInit])[1].body as string)

  it('champs actifs ; pot de miel masqué et hors du parcours clavier', () => {
    rendu()
    expect(screen.getByLabelText('Votre message *')).toBeEnabled()
    const piege = document.querySelector('input[name="siteWeb"]')!
    expect(piege).toHaveAttribute('tabindex', '-1')
    expect(piege.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('erreurs côté client : aucun envoi, saisie conservée, focus sur le premier champ en erreur', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await user.type(screen.getByLabelText('Nom *'), 'Mba')
    await user.type(screen.getByLabelText('Adresse e-mail *'), 'pas-un-email')
    await user.click(bouton())
    expect(fetch).not.toHaveBeenCalled()
    expect(screen.getByText('Vérifiez le format de votre adresse e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Ce champ est nécessaire pour traiter votre demande.')).toBeInTheDocument()
    expect(screen.getByLabelText('Adresse e-mail *')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Adresse e-mail *')).toHaveFocus()
    expect(screen.getByLabelText('Nom *')).toHaveValue('Mba')
  })

  it('succès : référence affichée ; envoi JSON avec une clé, sans langue', async () => {
    const fetch = vi.fn(async () => Response.json({ ok: true, reference: 'CT-ABC234' }))
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await remplir(user)
    await user.click(bouton())
    expect(await screen.findByText('CT-ABC234')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Votre message a été enregistré. Référence : CT-ABC234. Il sera examiné par l’ONG.')
    expect((fetch.mock.calls[0] as unknown[])[0]).toBe('/api/formulaires/contact')
    const corps = corpsEnvoye(fetch, 0)
    expect(corps).toMatchObject({ nom: 'Mba', email: 'awa@example.org', message: 'Bonjour', siteWeb: '' })
    expect(corps.cle).toMatch(CLE_IDEMPOTENCE)
    expect(corps).not.toHaveProperty('locale')
  })

  it('erreur réseau : message, saisie conservée, nouvel essai avec la même clé', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(Response.json({ ok: true, reference: 'CT-ABC234' }))
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await remplir(user)
    await user.click(bouton())
    expect(await screen.findByRole('alert')).toHaveTextContent('Nous n’avons pas pu confirmer l’enregistrement de votre message.')
    expect(screen.getByLabelText('Nom *')).toHaveValue('Mba')
    expect(bouton()).toBeEnabled()
    await user.click(bouton())
    expect(await screen.findByText('CT-ABC234')).toBeInTheDocument()
    expect(corpsEnvoye(fetch, 1).cle).toBe(corpsEnvoye(fetch, 0).cle)
  })

  it('erreurs renvoyées par le serveur, puis limite atteinte', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ ok: false, erreur: 'validation', champs: { email: 'email' } }, { status: 400 }))
      .mockResolvedValueOnce(Response.json({ ok: false, erreur: 'limite' }, { status: 429 }))
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await remplir(user)
    await user.click(bouton())
    expect(await screen.findByText('Vérifiez le format de votre adresse e-mail.')).toBeInTheDocument()
    await user.click(bouton())
    expect(await screen.findByRole('alert')).toHaveTextContent('Plusieurs envois ont déjà été faits depuis cette connexion.')
  })
})
```

Run: `npx vitest run tests/unit/forms.test.tsx`

Expected: FAIL (`ContactForm` n'accepte pas `commun` ; champs désactivés).

- [ ] **Step 3 : Briques communes**

`src/components/forms/useEnvoiFormulaire.ts` :

```ts
'use client'

import { useRef, useState } from 'react'
import { nouvelleCle, type Erreurs, type ReponseFormulaire, type Resultat, type TypeFormulaire } from '@/lib/formulaires/schema'

export type Statut = 'saisie' | 'envoi' | 'succes' | 'erreur' | 'limite'

/**
 * États d’un formulaire public : saisie, erreurs de champ, envoi, succès, erreur réseau, limite.
 * La clé d’idempotence naît au premier envoi valide et sert à chaque nouvel essai : le serveur ne crée jamais de doublon.
 * Renvoie les erreurs trouvées, pour que le composant place le focus sur le premier champ en erreur.
 */
export function useEnvoiFormulaire<D, C extends string>(type: TypeFormulaire, valider: (brut: Record<string, unknown>) => Resultat<D, C>) {
  const cle = useRef<string | null>(null)
  const [statut, setStatut] = useState<Statut>('saisie')
  const [reference, setReference] = useState<string | null>(null)
  const [erreurs, setErreurs] = useState<Erreurs<C>>({})

  async function soumettre(brut: Record<string, unknown>): Promise<Erreurs<C>> {
    const verification = valider(brut)
    if (!verification.ok) {
      setErreurs(verification.erreurs)
      setStatut('saisie')
      return verification.erreurs
    }
    setErreurs({})
    cle.current ??= nouvelleCle()
    setStatut('envoi')
    try {
      const res = await fetch(`/api/formulaires/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...brut, cle: cle.current }),
      })
      const corps = (await res.json()) as ReponseFormulaire
      if (corps.ok) {
        setReference(corps.reference)
        setStatut('succes')
        return {}
      }
      if (corps.erreur === 'validation') {
        const champs = corps.champs as Erreurs<C>
        setErreurs(champs)
        setStatut('saisie')
        return champs
      }
      setStatut(corps.erreur === 'limite' ? 'limite' : 'erreur')
    } catch {
      setStatut('erreur')
    }
    return {}
  }

  return { statut, reference, erreurs, soumettre }
}
```

`src/components/forms/ChampErreur.tsx` :

```tsx
export default function ChampErreur({ id, message }: { id: string; message: string | null }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-sm font-semibold text-error">
      {message}
    </p>
  )
}
```

`src/components/forms/texte-erreur.ts` :

```ts
import { LIMITES, type CodeErreur } from '@/lib/formulaires/schema'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export function texteErreur(code: CodeErreur | undefined, champ: string, textes: Dictionary['formulaires']['erreurs'], locale: Locale): string | null {
  if (!code) return null
  if (code !== 'tropLong') return textes[code]
  const max = (LIMITES as Record<string, number>)[champ] ?? 0
  return textes.tropLong.replace('{max}', new Intl.NumberFormat(locale).format(max))
}
```

`src/components/forms/SuccesEnvoi.tsx` :

```tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

type Props = { texte: string; reference: string; liens: { href: string; label: string }[] }

/** Confirmation après enregistrement : reçoit le focus pour être annoncée, et affiche la référence. */
export default function SuccesEnvoi({ texte, reference, liens }: Props) {
  const zone = useRef<HTMLDivElement>(null)
  useEffect(() => zone.current?.focus(), [])
  const [avant, apres = ''] = texte.split('{reference}')
  return (
    <div ref={zone} tabIndex={-1} role="status" className="rounded-lg p-6 flex flex-col gap-4 outline-none" style={{ background: '#F0F5EF', border: '1px solid #005C38' }}>
      <p className="text-base text-foreground font-medium leading-relaxed">
        {avant}
        <strong data-reference>{reference}</strong>
        {apres}
      </p>
      {liens.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {liens.map((lien) => (
            <Link key={lien.href} href={lien.href} className="font-bold text-primary underline">
              {lien.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4 : Formulaire de contact**

Remplacer `src/components/forms/ContactForm.tsx` par :

```tsx
'use client'

import type { FormEvent } from 'react'
import { validerContact, LIMITES, type ChampContact } from '@/lib/formulaires/schema'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import ChampErreur from './ChampErreur'
import SuccesEnvoi from './SuccesEnvoi'
import { texteErreur } from './texte-erreur'
import { useEnvoiFormulaire } from './useEnvoiFormulaire'

const LABEL = 'block text-sm font-bold text-foreground mb-2'
const FIELD = 'border border-border rounded-md px-4 py-3 bg-input text-foreground w-full aria-[invalid=true]:border-error'
const HELP = 'mt-1.5 text-xs text-muted-foreground'

const ID: Record<ChampContact, string> = { nom: 'ct-nom', prenom: 'ct-prenom', email: 'ct-email', telephone: 'ct-tel', organisation: 'ct-org', message: 'ct-message' }
const ORDRE = Object.keys(ID) as ChampContact[]

type Props = { locale: Locale; labels: Dictionary['contactForm']; commun: Dictionary['formulaires'] }

function lire(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form)
  const v = (k: string) => String(fd.get(k) ?? '')
  return { nom: v('nom'), prenom: v('prenom'), email: v('email'), telephone: v('telephone'), organisation: v('organisation'), message: v('message'), siteWeb: v('siteWeb') }
}

export default function ContactForm({ locale, labels, commun }: Props) {
  const { statut, reference, erreurs, soumettre } = useEnvoiFormulaire('contact', validerContact)

  if (statut === 'succes' && reference) {
    return <SuccesEnvoi texte={labels.success} reference={reference} liens={[{ href: localizedHref(locale, '/'), label: commun.retourAccueil }]} />
  }

  const erreur = (c: ChampContact) => texteErreur(erreurs[c], c, commun.erreurs, locale)
  const decrit = (c: ChampContact, ...aides: string[]) => {
    const ids = [...aides, erreurs[c] ? `${ID[c]}-erreur` : ''].filter(Boolean).join(' ')
    return { 'aria-invalid': erreurs[c] ? true : undefined, 'aria-describedby': ids || undefined }
  }

  async function envoyer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trouvees = await soumettre(lire(event.currentTarget))
    const premier = ORDRE.find((c) => trouvees[c])
    if (premier) document.getElementById(ID[premier])?.focus()
  }

  return (
    <form noValidate onSubmit={envoyer} className="relative flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor={ID.nom} className={LABEL}>{labels.lastName}</label>
          <input id={ID.nom} name="nom" autoComplete="family-name" aria-required="true" maxLength={LIMITES.nom} className={FIELD} {...decrit('nom')} />
          <ChampErreur id={`${ID.nom}-erreur`} message={erreur('nom')} />
        </div>
        <div>
          <label htmlFor={ID.prenom} className={LABEL}>{labels.firstName}</label>
          <input id={ID.prenom} name="prenom" autoComplete="given-name" maxLength={LIMITES.prenom} className={FIELD} {...decrit('prenom')} />
          <ChampErreur id={`${ID.prenom}-erreur`} message={erreur('prenom')} />
        </div>
        <div>
          <label htmlFor={ID.email} className={LABEL}>{labels.email}</label>
          <input id={ID.email} name="email" type="email" autoComplete="email" aria-required="true" maxLength={LIMITES.email} className={FIELD} {...decrit('email')} />
          <ChampErreur id={`${ID.email}-erreur`} message={erreur('email')} />
        </div>
        <div>
          <label htmlFor={ID.telephone} className={LABEL}>{labels.phone}</label>
          <input id={ID.telephone} name="telephone" type="tel" inputMode="tel" autoComplete="tel" placeholder={labels.phonePlaceholder} className={FIELD} {...decrit('telephone')} />
          <ChampErreur id={`${ID.telephone}-erreur`} message={erreur('telephone')} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={ID.organisation} className={LABEL}>{labels.organisation}</label>
          <input id={ID.organisation} name="organisation" autoComplete="organization" maxLength={LIMITES.organisation} className={FIELD} {...decrit('organisation')} />
          <ChampErreur id={`${ID.organisation}-erreur`} message={erreur('organisation')} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={ID.message} className={LABEL}>{labels.message}</label>
          <textarea id={ID.message} name="message" rows={6} aria-required="true" maxLength={LIMITES.message} className={FIELD} {...decrit('message', 'ct-message-aide')} />
          <p id="ct-message-aide" className={HELP}>{labels.helpMessage}</p>
          <ChampErreur id={`${ID.message}-erreur`} message={erreur('message')} />
        </div>
      </div>
      {/* Pot de miel : invisible, hors du parcours clavier et ignoré par les lecteurs d’écran. Un robot qui le remplit reçoit un succès apparent. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-0 w-px h-px overflow-hidden">
        <label htmlFor="ct-site">{commun.piege}</label>
        <input id="ct-site" name="siteWeb" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p role="status" className="text-sm text-muted-foreground min-h-5">{statut === 'envoi' ? labels.sending : ''}</p>
      {statut === 'erreur' && <p role="alert" className="text-sm font-semibold text-error">{labels.networkError}</p>}
      {statut === 'limite' && <p role="alert" className="text-sm font-semibold text-error">{commun.limite}</p>}
      <div>
        <button type="submit" disabled={statut === 'envoi'} className="font-bold text-base px-8 py-3 rounded-md font-body bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-wait">
          {labels.submit}
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{labels.dataNotice}</p>
    </form>
  )
}
```

Vérifier dans `src/app/(site)/globals.css` que `--color-error` est déclaré dans le bloc `@theme` (comme `--color-primary`). Sinon, remplacer `text-error` et `border-error` par `text-[#b42318]` et `border-[#b42318]`.

- [ ] **Step 5 : Page contact et seed**

Dans `src/app/(site)/[locale]/contact/page.tsx` :
- supprimer l'import de `ClosedNotice` ;
- remplacer le contenu de la `Reveal` du formulaire par :

```tsx
          <Reveal className="lg:col-span-2 bg-background rounded-lg border border-border p-8 flex flex-col gap-6">
            {!isPlaceholder(formulaire?.heading) && <h2 className="text-2xl font-bold text-foreground font-headings">{formulaire?.heading}</h2>}
            <p className="text-sm text-muted-foreground">{dict.contactForm.requiredHint}</p>
            <ContactForm locale={locale} labels={dict.contactForm} commun={dict.formulaires} />
          </Reveal>
```

Le texte de la section `formulaire` (« pas encore ouvert ») n'est plus rendu : une base non re-seedée ne l'affiche donc plus. Dans le seed, retirer ce texte devenu faux :
- `src/seed/data/fr.ts`, page `contact` : remplacer la section `formulaire` par `{ key: 'formulaire', heading: 'Envoyer un message' }` (supprimer `body` et `ctas`, ainsi que le commentaire « NOUVEAU » qui la précède) ;
- `src/seed/data/en.ts`, page `contact` : remplacer la section `formulaire` par `{ key: 'formulaire', heading: 'Send a message' }`.

- [ ] **Step 6 : Tests e2e**

Dans `tests/e2e/formulaires.spec.ts` :
- supprimer le test `contact : aucun envoi possible` ;
- dans le test `contact : orientations, ancre partenariat, aucune coordonnée inventée`, remplacer `await expect(page.getByLabel('Votre message')).toBeDisabled()` par `await expect(page.getByLabel('Votre message *')).toBeEnabled()` ;
- ajouter en tête `import { adminToken } from './admin-helpers'` et `import { ipAleatoire, lireMessage, purgerMessages } from './formulaires-helpers'` ;
- ajouter à la fin du fichier :

```ts
const PREFIXE = 'e2e-form-ct-'

test.describe('contact : envoi', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    await purgerMessages(request, token, PREFIXE)
  })
  test.afterAll(async ({ request }) => {
    await purgerMessages(request, token, PREFIXE)
  })

  async function remplir(page: Page, nom: string) {
    await page.getByLabel('Nom *').fill(nom)
    await page.getByLabel('Adresse e-mail *').fill('visiteur@example.org')
    await page.getByLabel('Votre message *').fill('Bonjour, je souhaite en savoir plus.')
  }

  test('envoi valide : référence affichée et message enregistré', async ({ page, request }) => {
    await page.setExtraHTTPHeaders({ 'X-Forwarded-For': ipAleatoire() })
    await page.goto('/fr/contact')
    await remplir(page, `${PREFIXE}Ndong`)
    await page.getByRole('button', { name: 'Envoyer le message' }).click()
    const confirmation = page.getByRole('status').filter({ hasText: 'Votre message a été enregistré.' })
    await expect(confirmation).toBeVisible()
    const reference = (await confirmation.locator('[data-reference]').textContent()) ?? ''
    expect(reference).toMatch(/^CT-[A-HJ-NP-Z2-9]{6}$/)
    expect(await lireMessage(request, token, reference)).toMatchObject({ type: 'contact', locale: 'fr', nom: `${PREFIXE}Ndong` })
    await expect(confirmation).not.toContainText(/e-mail/i) // la confirmation n’annonce jamais d’e-mail
  })

  test('champs invalides : erreurs affichées, saisie conservée, aucun envoi', async ({ page }) => {
    const envois: string[] = []
    page.on('request', (r) => {
      if (r.url().includes('/api/formulaires/')) envois.push(r.url())
    })
    await page.goto('/fr/contact')
    await page.getByLabel('Nom *').fill(`${PREFIXE}Ondo`)
    await page.getByLabel('Adresse e-mail *').fill('pas-un-email')
    await page.getByRole('button', { name: 'Envoyer le message' }).click()
    await expect(page.getByText('Vérifiez le format de votre adresse e-mail.')).toBeVisible()
    await expect(page.getByText('Ce champ est nécessaire pour traiter votre demande.')).toBeVisible()
    await expect(page.getByLabel('Adresse e-mail *')).toBeFocused()
    await expect(page.getByLabel('Nom *')).toHaveValue(`${PREFIXE}Ondo`)
    expect(envois).toEqual([])
  })

  test('erreur réseau : saisie conservée, nouvel essai avec la même clé', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'X-Forwarded-For': ipAleatoire() })
    const cles: string[] = []
    let coupe = true
    await page.route('**/api/formulaires/contact', async (route) => {
      cles.push(JSON.parse(route.request().postData() ?? '{}').cle)
      if (coupe) {
        coupe = false
        await route.abort('failed')
      } else await route.continue()
    })
    await page.goto('/fr/contact')
    await remplir(page, `${PREFIXE}Reseau`)
    await page.getByRole('button', { name: 'Envoyer le message' }).click()
    await expect(page.getByRole('alert')).toContainText('Nous n’avons pas pu confirmer l’enregistrement de votre message.')
    await expect(page.getByLabel('Nom *')).toHaveValue(`${PREFIXE}Reseau`)
    await page.getByRole('button', { name: 'Envoyer le message' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Votre message a été enregistré.' })).toBeVisible()
    expect(cles).toHaveLength(2)
    expect(cles[1]).toBe(cles[0])
  })
})
```

`Page` est déjà importé en tête du fichier (`import { expect, test, type Page } from '@playwright/test'`).

- [ ] **Step 7 : Vérifier**

Run: `npx vitest run tests/unit/forms.test.tsx tests/unit/dictionaries.test.ts`

Expected: PASS.

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected : tout passe, y compris `accessibilite.spec.ts` sur `/fr/contact` et `/en/contact` (aucune violation sérieuse : libellés, `aria-describedby`, pot de miel `aria-hidden` sans élément focalisable).

- [ ] **Step 8 : Commit**

```bash
git add src/components/forms/useEnvoiFormulaire.ts src/components/forms/ChampErreur.tsx src/components/forms/SuccesEnvoi.tsx src/components/forms/texte-erreur.ts src/components/forms/ContactForm.tsx "src/app/(site)/[locale]/contact/page.tsx" src/lib/i18n/dictionaries src/seed/data/fr.ts src/seed/data/en.ts tests/unit/forms.test.tsx tests/e2e/formulaires.spec.ts
git commit -F - <<'EOF'
feat: formulaire de contact actif (référence, erreurs par champ, nouvel essai sans doublon)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5 : Formulaire d'adhésion actif (téléphone international, pays traduits, compteur, notice)

**Files:**
- Modify (réécriture) : `src/components/forms/AdhesionForm.tsx`
- Delete: `src/components/forms/ClosedNotice.tsx`
- Modify: `src/app/(site)/[locale]/adhesion/page.tsx`
- Modify: `src/lib/i18n/dictionaries/fr.ts`, `src/lib/i18n/dictionaries/en.ts` (bloc `adhesionForm`)
- Modify: `src/seed/data/fr.ts`, `src/seed/data/en.ts` (section `indisponible` de la page adhésion)
- Modify: `tests/unit/forms.test.tsx`, `tests/e2e/formulaires.spec.ts`, `README.md`

**Interfaces:**
- Consumes :
  - `useEnvoiFormulaire`, `ChampErreur`, `SuccesEnvoi`, `texteErreur` et les clés `formulaires.*` (tâche 4) ;
  - `validerAdhesion`, `INTERETS`, `LIMITES`, `longueur`, `ChampAdhesion` et `optionsPays(locale)` (tâche 3) ;
  - `POST /api/formulaires/adhesion` ; `ipAleatoire`, `lireMessage`, `purgerMessages` ; `loginAdmin`.
- Produces : `AdhesionForm({ locale, labels, commun, pays })`, où `pays: { code: string; nom: string }[]` est calculé côté serveur par la page.

- [ ] **Step 1 : Dictionnaires**

Dans `fr.ts`, bloc `adhesionForm`, ajouter à la fin (après `submit`) :

```ts
    helpPhoneFormat: 'Commencez par l’indicatif du pays, par exemple +241 pour le Gabon.',
    phonePlaceholder: '+241 …',
    countryPlaceholder: 'Choisir un pays',
    motivationCounter: '{n} / {max} caractères',
    sending: 'Votre demande est en cours d’envoi…',
    success: 'Votre demande a été enregistrée. Référence : {reference}. Elle sera examinée par l’ONG. Vous serez recontacté(e) au moyen des coordonnées fournies. Cet accusé de réception ne vaut pas confirmation d’adhésion.',
    networkError: 'Nous n’avons pas pu confirmer l’enregistrement de votre demande. Vos informations restent affichées. Réessayez ou contactez l’ONG.',
    dataNotice: 'Vos informations sont enregistrées par Terre d’Avenir KOMO-KANGO pour examiner votre demande et vous recontacter à son sujet. Elles ne sont pas publiées et ne servent pas à une newsletter. Seules les personnes chargées des demandes au sein de l’ONG y ont accès.',
    discoverActions: 'Découvrir nos actions',
```

`sending`, `success` et `networkError` sont repris mot pour mot des Textes v1.3 (formulaire d'adhésion, « États et messages exacts »). `discoverActions` reprend l'« Action après succès ». `dataNotice` résume les sections « Utilisation » et « Accès » de PAGE-09, sans rien promettre de plus.

Dans `en.ts`, bloc `adhesionForm`, mêmes clés dans le même ordre :

```ts
    helpPhoneFormat: 'Start with the country code, for example +241 for Gabon.',
    phonePlaceholder: '+241 …',
    countryPlaceholder: 'Choose a country',
    motivationCounter: '{n} / {max} characters',
    sending: 'Your application is being sent…',
    success: 'Your application has been recorded. Reference: {reference}. It will be reviewed by the NGO. You will be contacted using the details you provided. This acknowledgement does not confirm membership.',
    networkError: 'We could not confirm that your application was recorded. Your information is still displayed. Please try again or contact the NGO.',
    dataNotice: 'Your information is recorded by Terre d’Avenir KOMO-KANGO to review your application and contact you about it. It is not published and is not used for a newsletter. Only the people handling applications within the NGO can access it.',
    discoverActions: 'Discover our actions',
```

- [ ] **Step 2 : Tests unitaires, à écrire avant le code**

Dans `tests/unit/forms.test.tsx` :
- supprimer l'import de `ClosedNotice` et le test `adhésion : champs des Textes v1.3, tous désactivés, sans action` (le `describe('formulaires du lot 1')` devient vide : le supprimer) ;
- dans `describe('masquage des brouillons')`, supprimer la ligne `<ClosedNotice … />` et renommer le test en `les étapes ignorent les textes « [...] »` ;
- ajouter :

```tsx
describe('formulaire d’adhésion', () => {
  afterEach(() => vi.unstubAllGlobals())
  const PAYS = [
    { code: 'DE', nom: 'Allemagne' },
    { code: 'GA', nom: 'Gabon' },
  ]
  const rendu = () => render(<AdhesionForm locale="fr" labels={dict.adhesionForm} commun={dict.formulaires} pays={PAYS} />)
  const bouton = () => screen.getByRole('button', { name: 'Envoyer ma demande' })

  it('champs des Textes v1.3 actifs, notice non précochée, aucun champ superflu', () => {
    rendu()
    for (const label of ['Nom *', 'Prénom(s) *', 'Téléphone avec indicatif international *', 'Votre motivation (facultatif)']) {
      expect(screen.getByLabelText(label)).toBeEnabled()
    }
    expect(screen.getAllByRole('checkbox')).toHaveLength(6) // 5 centres d’intérêt + la notice
    expect(screen.getByRole('checkbox', { name: dict.adhesionForm.notice })).not.toBeChecked()
    expect(screen.getByRole('option', { name: 'Choisir un pays' })).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Gabon' })).toHaveValue('GA')
    expect(screen.queryByLabelText(/Genre|Date de naissance/)).toBeNull()
  })

  it('compteur de la motivation', async () => {
    const user = userEvent.setup()
    rendu()
    await user.type(screen.getByLabelText('Votre motivation (facultatif)'), 'abc')
    expect(screen.getByText(/^3 \/ 1\s000 caractères$/)).toBeInTheDocument()
  })

  it('erreurs côté client : requis, téléphone, notice ; focus sur le premier champ en erreur', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await user.type(screen.getByLabelText('Prénom(s) *'), 'Awa')
    await user.type(screen.getByLabelText('Téléphone avec indicatif international *'), '0612')
    await user.click(bouton())
    expect(fetch).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Nom *')).toHaveFocus()
    expect(screen.getByText('Vérifiez votre numéro et son indicatif international.')).toBeInTheDocument()
    expect(screen.getByText('Veuillez prendre connaissance des informations sur le traitement de votre demande.')).toBeInTheDocument()
    expect(screen.getByLabelText('Prénom(s) *')).toHaveValue('Awa')
  })

  it('succès : données envoyées, référence ADH et liens de suite', async () => {
    const fetch = vi.fn(async () => Response.json({ ok: true, reference: 'ADH-ABC234' }))
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await user.type(screen.getByLabelText('Nom *'), 'Obiang')
    await user.type(screen.getByLabelText('Prénom(s) *'), 'Awa')
    await user.type(screen.getByLabelText('Téléphone avec indicatif international *'), '+241 06 12 34 56')
    await user.selectOptions(screen.getByLabelText('Pays de résidence (facultatif)'), 'GA')
    await user.click(screen.getByRole('checkbox', { name: 'Jeunesse' }))
    await user.click(screen.getByRole('checkbox', { name: dict.adhesionForm.notice }))
    await user.click(bouton())
    expect(await screen.findByText('ADH-ABC234')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Votre demande a été enregistrée. Référence : ADH-ABC234. Elle sera examinée par l’ONG.')
    expect(screen.getByRole('link', { name: 'Découvrir nos actions' })).toHaveAttribute('href', '/fr/projets')
    const corps = JSON.parse((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(corps).toMatchObject({ nom: 'Obiang', prenoms: 'Awa', telephone: '+241 06 12 34 56', pays: 'GA', interets: ['jeunesse'], notice: true, siteWeb: '' })
  })
})
```

Run: `npx vitest run tests/unit/forms.test.tsx`

Expected: FAIL (le formulaire est désactivé et n'accepte pas `commun` ni `pays`).

- [ ] **Step 3 : Formulaire d'adhésion**

Remplacer `src/components/forms/AdhesionForm.tsx` par :

```tsx
'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { INTERETS, LIMITES, longueur, validerAdhesion, type ChampAdhesion } from '@/lib/formulaires/schema'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import ChampErreur from './ChampErreur'
import SuccesEnvoi from './SuccesEnvoi'
import { texteErreur } from './texte-erreur'
import { useEnvoiFormulaire } from './useEnvoiFormulaire'

const LABEL = 'block text-sm font-bold text-foreground mb-2'
const FIELD = 'border border-border rounded-md px-4 py-3 bg-input text-foreground w-full aria-[invalid=true]:border-error'
const HELP = 'mt-1.5 text-xs text-muted-foreground'

const ID: Record<ChampAdhesion, string> = {
  nom: 'adh-nom',
  prenoms: 'adh-prenoms',
  telephone: 'adh-tel',
  email: 'adh-email',
  pays: 'adh-pays',
  ville: 'adh-ville',
  interets: 'adh-interet-0',
  motivation: 'adh-motivation',
  notice: 'adh-notice',
}
const ORDRE = Object.keys(ID) as ChampAdhesion[]

type Props = { locale: Locale; labels: Dictionary['adhesionForm']; commun: Dictionary['formulaires']; pays: { code: string; nom: string }[] }

function lire(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form)
  const v = (k: string) => String(fd.get(k) ?? '')
  return {
    nom: v('nom'),
    prenoms: v('prenoms'),
    telephone: v('telephone'),
    email: v('email'),
    pays: v('pays'),
    ville: v('ville'),
    interets: fd.getAll('interets').map(String),
    motivation: v('motivation'),
    notice: fd.get('notice') === 'on',
    siteWeb: v('siteWeb'),
  }
}

export default function AdhesionForm({ locale, labels, commun, pays }: Props) {
  const { statut, reference, erreurs, soumettre } = useEnvoiFormulaire('adhesion', validerAdhesion)
  const [caracteres, setCaracteres] = useState(0)

  if (statut === 'succes' && reference) {
    return (
      <SuccesEnvoi
        texte={labels.success}
        reference={reference}
        liens={[
          { href: localizedHref(locale, '/'), label: commun.retourAccueil },
          { href: localizedHref(locale, '/projets'), label: labels.discoverActions },
        ]}
      />
    )
  }

  const nombre = new Intl.NumberFormat(locale)
  const compteur = labels.motivationCounter.replace('{n}', nombre.format(caracteres)).replace('{max}', nombre.format(LIMITES.motivation))
  const erreur = (c: ChampAdhesion) => texteErreur(erreurs[c], c, commun.erreurs, locale)
  const decrit = (c: ChampAdhesion, ...aides: string[]) => {
    const ids = [...aides, erreurs[c] ? `${ID[c]}-erreur` : ''].filter(Boolean).join(' ')
    return { 'aria-invalid': erreurs[c] ? true : undefined, 'aria-describedby': ids || undefined }
  }

  async function envoyer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trouvees = await soumettre(lire(event.currentTarget))
    const premier = ORDRE.find((c) => trouvees[c])
    if (premier) document.getElementById(ID[premier])?.focus()
  }

  return (
    <form noValidate onSubmit={envoyer} className="relative bg-background rounded-lg border border-border p-8 flex flex-col gap-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor={ID.nom} className={LABEL}>{labels.lastName}</label>
          <input id={ID.nom} name="nom" autoComplete="family-name" aria-required="true" maxLength={LIMITES.nom} className={FIELD} {...decrit('nom')} />
          <ChampErreur id={`${ID.nom}-erreur`} message={erreur('nom')} />
        </div>
        <div>
          <label htmlFor={ID.prenoms} className={LABEL}>{labels.firstNames}</label>
          <input id={ID.prenoms} name="prenoms" autoComplete="given-name" aria-required="true" maxLength={LIMITES.prenoms} className={FIELD} {...decrit('prenoms')} />
          <ChampErreur id={`${ID.prenoms}-erreur`} message={erreur('prenoms')} />
        </div>
        <div>
          <label htmlFor={ID.telephone} className={LABEL}>{labels.phone}</label>
          <input
            id={ID.telephone}
            name="telephone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-required="true"
            placeholder={labels.phonePlaceholder}
            className={FIELD}
            {...decrit('telephone', 'adh-tel-aide', 'adh-tel-format')}
          />
          <p id="adh-tel-aide" className={HELP}>{labels.helpPhone}</p>
          <p id="adh-tel-format" className={HELP}>{labels.helpPhoneFormat}</p>
          <ChampErreur id={`${ID.telephone}-erreur`} message={erreur('telephone')} />
        </div>
        <div>
          <label htmlFor={ID.email} className={LABEL}>{labels.email}</label>
          <input id={ID.email} name="email" type="email" autoComplete="email" maxLength={LIMITES.email} className={FIELD} {...decrit('email', 'adh-email-aide')} />
          <p id="adh-email-aide" className={HELP}>{labels.helpEmail}</p>
          <ChampErreur id={`${ID.email}-erreur`} message={erreur('email')} />
        </div>
        <div>
          <label htmlFor={ID.pays} className={LABEL}>{labels.country}</label>
          <select id={ID.pays} name="pays" autoComplete="country" defaultValue="" className={FIELD} {...decrit('pays')}>
            <option value="">{labels.countryPlaceholder}</option>
            {pays.map((p) => (
              <option key={p.code} value={p.code}>{p.nom}</option>
            ))}
          </select>
          <ChampErreur id={`${ID.pays}-erreur`} message={erreur('pays')} />
        </div>
        <div>
          <label htmlFor={ID.ville} className={LABEL}>{labels.city}</label>
          <input id={ID.ville} name="ville" autoComplete="address-level2" maxLength={LIMITES.ville} className={FIELD} {...decrit('ville')} />
          <ChampErreur id={`${ID.ville}-erreur`} message={erreur('ville')} />
        </div>
        <fieldset className="md:col-span-2" aria-describedby={['adh-interets-aide', erreurs.interets ? 'adh-interets-erreur' : ''].filter(Boolean).join(' ')}>
          <legend className={LABEL}>{labels.interests}</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {INTERETS.map((valeur, i) => (
              <label key={valeur} htmlFor={`adh-interet-${i}`} className="inline-flex items-center gap-2 text-base text-foreground">
                <input id={`adh-interet-${i}`} type="checkbox" name="interets" value={valeur} className="h-5 w-5 accent-[#005C38]" />
                {labels.interestOptions[i]}
              </label>
            ))}
          </div>
          <p id="adh-interets-aide" className={HELP}>{labels.helpInterests}</p>
          <ChampErreur id="adh-interets-erreur" message={erreur('interets')} />
        </fieldset>
        <div className="md:col-span-2">
          <label htmlFor={ID.motivation} className={LABEL}>{labels.motivation}</label>
          <textarea
            id={ID.motivation}
            name="motivation"
            rows={5}
            maxLength={LIMITES.motivation}
            onChange={(e) => setCaracteres(longueur(e.target.value))}
            className={FIELD}
            {...decrit('motivation', 'adh-motivation-aide', 'adh-motivation-compteur')}
          />
          <p id="adh-motivation-aide" className={HELP}>{labels.helpMotivation}</p>
          <p id="adh-motivation-compteur" className={HELP}>{compteur}</p>
          <ChampErreur id={`${ID.motivation}-erreur`} message={erreur('motivation')} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={ID.notice} className="inline-flex items-start gap-3 text-base text-foreground">
            <input id={ID.notice} type="checkbox" name="notice" aria-required="true" className="mt-1 h-5 w-5 accent-[#005C38]" {...decrit('notice')} />
            <span>{labels.notice}</span>
          </label>
          <ChampErreur id={`${ID.notice}-erreur`} message={erreur('notice')} />
          <p className="mt-2 text-sm">
            <Link href={localizedHref(locale, '/confidentialite')} className="font-bold text-primary underline">
              {labels.noticeLink}
            </Link>
          </p>
        </div>
      </div>
      {/* Pot de miel : invisible, hors du parcours clavier et ignoré par les lecteurs d’écran. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-0 w-px h-px overflow-hidden">
        <label htmlFor="adh-site">{commun.piege}</label>
        <input id="adh-site" name="siteWeb" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p role="status" className="text-sm text-muted-foreground min-h-5">{statut === 'envoi' ? labels.sending : ''}</p>
      {statut === 'erreur' && <p role="alert" className="text-sm font-semibold text-error">{labels.networkError}</p>}
      {statut === 'limite' && <p role="alert" className="text-sm font-semibold text-error">{commun.limite}</p>}
      <div>
        <button type="submit" disabled={statut === 'envoi'} className="font-bold text-base px-8 py-3 rounded-md font-body disabled:opacity-60 disabled:cursor-wait" style={{ background: '#E6BF58', color: '#17372C' }}>
          {labels.submit}
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{labels.dataNotice}</p>
    </form>
  )
}
```

- [ ] **Step 4 : Page adhésion, composant supprimé, seed**

Dans `src/app/(site)/[locale]/adhesion/page.tsx` :
- supprimer l'import de `ClosedNotice`, la constante `indisponible` et toute la `<section className="bg-background pt-12">` qui l'affichait ;
- ajouter `import { optionsPays } from '@/lib/formulaires/pays'` ;
- remplacer `<AdhesionForm locale={locale} labels={dict.adhesionForm} />` par :

```tsx
            <AdhesionForm locale={locale} labels={dict.adhesionForm} commun={dict.formulaires} pays={optionsPays(locale)} />
```

Supprimer `src/components/forms/ClosedNotice.tsx`. Vérifier par `grep -rn "ClosedNotice" src tests` qu'il ne reste aucune référence.

Seed : dans `src/seed/data/fr.ts` et `src/seed/data/en.ts`, page `adhesion`, supprimer la section `{ key: 'indisponible', … }` (le texte « pas encore ouvertes » et ses deux liens).

- [ ] **Step 5 : Tests e2e**

Dans `tests/e2e/formulaires.spec.ts` :
- supprimer la fonction `expectNoSubmission` et le test `adhésion : non ouverte, aucun envoi possible` ;
- ajouter le test de lecture et le `describe` d'envoi ci-dessous ;
- ajouter `loginAdmin` à l'import depuis `./admin-helpers`.

```ts
test('adhésion : formulaire ouvert, sans bandeau de fermeture, FAQ', async ({ page }) => {
  await page.goto('/fr/adhesion')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rejoindre Terre d’Avenir KOMO-KANGO')
  await expect(page.getByText('ne sont pas encore ouvertes')).toHaveCount(0)
  await expect(page.getByLabel('Nom *')).toBeEnabled()
  await page.getByText('Une cotisation est-elle prévue ?').click()
  await expect(page.getByText('Aucun paiement n’est demandé dans ce formulaire.')).toBeVisible()
})

const PREFIXE_ADH = 'e2e-form-adh-'

test.describe('adhésion : envoi', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    await purgerMessages(request, token, PREFIXE_ADH)
  })
  test.afterAll(async ({ request }) => {
    await purgerMessages(request, token, PREFIXE_ADH)
  })

  test('envoi valide : référence ADH, données normalisées, visible dans « Messages reçus »', async ({ page, request }) => {
    await page.setExtraHTTPHeaders({ 'X-Forwarded-For': ipAleatoire() })
    await page.goto('/fr/adhesion')
    await page.getByLabel('Nom *').fill(`${PREFIXE_ADH}Obiang`)
    await page.getByLabel('Prénom(s) *').fill('Awa')
    await page.getByLabel('Téléphone avec indicatif international *').fill('+241 06 12 34 56')
    await page.getByLabel('Pays de résidence (facultatif)').selectOption({ label: 'Gabon' })
    await page.getByRole('checkbox', { name: 'Jeunesse' }).check()
    await page.getByLabel('Votre motivation (facultatif)').fill('Contribuer')
    await expect(page.getByText(/^10 \/ 1\s000 caractères$/)).toBeVisible()
    await page.getByRole('checkbox', { name: 'J’ai pris connaissance des informations relatives au traitement de ma demande d’adhésion.' }).check()
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
    const confirmation = page.getByRole('status').filter({ hasText: 'Votre demande a été enregistrée.' })
    await expect(confirmation).toBeVisible()
    const reference = (await confirmation.locator('[data-reference]').textContent()) ?? ''
    expect(reference).toMatch(/^ADH-[A-HJ-NP-Z2-9]{6}$/)
    const message = await lireMessage(request, token, reference)
    expect(message).toMatchObject({ type: 'adhesion', locale: 'fr', noticeVersion: '2026-10-07', emailEtat: 'non_configure' })
    expect(message?.donnees).toMatchObject({ telephone: '+24106123456', pays: 'GA', interets: ['jeunesse'], motivation: 'Contribuer' })
    await loginAdmin(page)
    await page.goto(`/admin/collections/messages?where[reference][equals]=${reference}`)
    await expect(page.getByRole('link', { name: reference })).toBeVisible()
  })

  test('notice non cochée et téléphone sans indicatif : erreurs, saisie conservée', async ({ page }) => {
    await page.goto('/fr/adhesion')
    await page.getByLabel('Nom *').fill(`${PREFIXE_ADH}Ella`)
    await page.getByLabel('Prénom(s) *').fill('Rodrigue')
    await page.getByLabel('Téléphone avec indicatif international *').fill('06 12 34 56')
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
    await expect(page.getByText('Vérifiez votre numéro et son indicatif international.')).toBeVisible()
    await expect(page.getByText('Veuillez prendre connaissance des informations sur le traitement de votre demande.')).toBeVisible()
    await expect(page.getByLabel('Téléphone avec indicatif international *')).toBeFocused()
    await expect(page.getByLabel('Nom *')).toHaveValue(`${PREFIXE_ADH}Ella`)
  })

  test('anglais : pays traduits et langue enregistrée', async ({ page, request }) => {
    await page.setExtraHTTPHeaders({ 'X-Forwarded-For': ipAleatoire() })
    await page.goto('/en/adhesion')
    await expect(page.getByLabel('Country of residence (optional)').locator('option', { hasText: 'Germany' })).toHaveCount(1)
    await page.getByLabel('Last name *').fill(`${PREFIXE_ADH}Mintsa`)
    await page.getByLabel('First name(s) *').fill('Prisca')
    await page.getByLabel('Phone number with international code *').fill('+33 6 12 34 56 78')
    await page.getByRole('checkbox', { name: 'I have read the information on how my membership application will be processed.' }).check()
    await page.getByRole('button', { name: 'Submit my application' }).click()
    const confirmation = page.getByRole('status').filter({ hasText: 'Your application has been recorded.' })
    await expect(confirmation).toBeVisible()
    const reference = (await confirmation.locator('[data-reference]').textContent()) ?? ''
    expect((await lireMessage(request, token, reference))?.locale).toBe('en')
  })
})
```

Les préfixes `PREFIXE` (`'e2e-form-ct-'`, tâche 4) et `PREFIXE_ADH` sont distincts : chaque `describe` ne purge que ses propres messages.

- [ ] **Step 6 : README**

Dans `README.md`, section « Contenus », remplacer la phrase « Au lot 1, les formulaires (adhésion, contact) sont affichés mais désactivés : aucune donnée personnelle n'est collectée. » par :

```markdown
Les formulaires d'adhésion et de contact sont actifs. Chaque envoi est enregistré dans *Formulaires > Messages reçus*, avec une référence (`ADH-XXXXXX` ou `CT-XXXXXX`) affichée au visiteur, puis notifié par e-mail si l'envoi est configuré (voir « Envoi des e-mails »). Protections : champ piège invisible contre les robots, 5 envois au plus par adresse IP et par 10 minutes (en mémoire, remis à zéro au redémarrage ; l'IP vient de l'en-tête `X-Forwarded-For` du proxy, c'est un garde-fou et non une sécurité), et une clé d'envoi qui empêche les doublons.
```

- [ ] **Step 7 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected : tout passe, y compris `accessibilite.spec.ts` sur `/fr/adhesion` et `/en/adhesion`.

- [ ] **Step 8 : Commit**

```bash
git add src/components/forms/AdhesionForm.tsx src/components/forms/ClosedNotice.tsx "src/app/(site)/[locale]/adhesion/page.tsx" src/lib/i18n/dictionaries src/seed/data/fr.ts src/seed/data/en.ts tests/unit/forms.test.tsx tests/e2e/formulaires.spec.ts README.md
git commit -F - <<'EOF'
feat: formulaire d’adhésion actif (téléphone international, pays traduits, compteur, notice versionnée)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

`git add` sur le fichier supprimé `ClosedNotice.tsx` enregistre sa suppression.

---

### Task 6 : Admin des messages (données lisibles, « Renvoyer l'e-mail ») et carte KPI « Messages non traités »

**Files:**
- Create: `src/components/admin/DonneesLisibles.tsx`, `src/components/admin/RenvoyerEmail.tsx`, `src/lib/formulaires/renvoi.ts`
- Modify: `src/collections/Messages.ts`
- Modify: `src/lib/kpi/compute.ts`, `src/lib/kpi/load.ts`, `src/components/admin/KpiDashboard.tsx`
- Modify (régénéré) : `src/app/(payload)/admin/importMap.js`
- Create: `tests/unit/formulaires-renvoi.test.ts` ; Modify: `tests/unit/kpi.test.ts`
- Modify: `tests/e2e/messages-email.spec.ts`, `tests/e2e/tableau-de-bord.spec.ts`, `README.md`

**Interfaces:**
- Consumes :
  - `notifierMessage(payload, message)` et `lignesLisibles(donnees)` (tâche 3) ;
  - collection `messages` (tâche 2) ;
  - `envoyerFormulaire`, `lireMessage`, `purgerMessages` et `emailsCaptures` (tâches 2 et 3) ;
  - `refs.sansAdresse` (message en `non_configure`) et `refs.avecAdresse` (message en `envoye`), ainsi que `emailContact` = `DESTINATAIRE`, laissés par les tests de `messages-email.spec.ts` (tâche 3).
- Produces :
  - `POST /api/messages/:id/renvoyer`. Réponses :
    - `403` sans session ;
    - `404` si le message est inconnu ;
    - `409` si l'état n'est ni `echec` ni `non_configure` ;
    - `200` avec `EtatEmail` sinon.
  - `renvoyerEmail: PayloadHandler` et `ETATS_RENVOYABLES` (`src/lib/formulaires/renvoi.ts`).
  - `messageCounts(rows: { type?: string | null }[]): { total: number; adhesion: number; contact: number }` (`compute.ts`).
  - `loadKpis(...).messages: { total: KpiState; adhesion: KpiState; contact: KpiState }`.
  - `NO_SOURCE` sans l'entrée `adhesions`.

- [ ] **Step 1 : Tests unitaires, à écrire avant le code**

`tests/unit/formulaires-renvoi.test.ts` :

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renvoyerEmail } from '@/lib/formulaires/renvoi'

const MESSAGE = { id: 5, reference: 'CT-ABCDEF', type: 'contact', locale: 'fr', createdAt: '2026-10-07T08:00:00.000Z', donnees: { nom: 'Mba' } }

function requete(user: unknown, message: Record<string, unknown> | null) {
  const update = vi.fn(async () => ({}))
  const req = {
    user,
    routeParams: { id: '5' },
    payload: {
      findByID: vi.fn(async () => message),
      findGlobal: vi.fn(async () => ({ emailContact: null, emailAdhesions: null })),
      update,
      sendEmail: vi.fn(),
    },
  }
  return { req: req as never, update }
}

beforeEach(() => {
  vi.stubEnv('SMTP_HOST', '')
  vi.stubEnv('EMAIL_CAPTURE_DIR', '')
})
afterEach(() => vi.unstubAllEnvs())

describe('renvoi de l’e-mail d’un message', () => {
  it('403 sans session', async () => {
    expect((await renvoyerEmail(requete(null, { ...MESSAGE, emailEtat: 'echec' }).req)).status).toBe(403)
  })
  it('404 pour un message inconnu', async () => {
    expect((await renvoyerEmail(requete({ id: 1 }, null).req)).status).toBe(404)
  })
  it('409 si l’e-mail est déjà envoyé', async () => {
    expect((await renvoyerEmail(requete({ id: 1 }, { ...MESSAGE, emailEtat: 'envoye' }).req)).status).toBe(409)
  })
  it('échec ou non configuré : nouvelle tentative, état enregistré et renvoyé', async () => {
    const { req, update } = requete({ id: 1 }, { ...MESSAGE, emailEtat: 'echec' })
    const res = await renvoyerEmail(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ emailEtat: 'non_configure', emailErreur: null, emailEnvoyeLe: null })
    expect(update).toHaveBeenCalledTimes(1)
  })
})
```

Dans `tests/unit/kpi.test.ts` :
- importer aussi `messageCounts` depuis `@/lib/kpi/compute` ;
- remplacer le test `cartes sans source : adhésions, transactions, chargements, sauvegardes` par :

```ts
  it('cartes sans source : transactions, chargements, sauvegardes (les adhésions ont une source : les messages)', () => {
    expect(NO_SOURCE.map((c) => c.id)).toEqual(['transactions', 'chargements', 'sauvegardes'])
    expect(NO_SOURCE.every((c) => c.note.length > 0)).toBe(true)
  })

  it('messages non traités : total et répartition par type', () => {
    expect(messageCounts([{ type: 'adhesion' }, { type: 'contact' }, { type: 'contact' }])).toEqual({ total: 3, adhesion: 1, contact: 2 })
    expect(messageCounts([])).toEqual({ total: 0, adhesion: 0, contact: 0 })
  })
```

- dans `docsFor`, ajouter en première ligne `if (collection === 'messages') return [{ type: 'adhesion' }, { type: 'contact' }, { type: 'contact' }]` ;
- dans le test `toutes les lectures réussissent…`, ajouter `expect(k.messages).toEqual({ total: { kind: 'value', value: 3 }, adhesion: { kind: 'value', value: 1 }, contact: { kind: 'value', value: 2 } })` ;
- ajouter le test :

```ts
    it('messages illisibles : carte indisponible, les autres gardent leur valeur', async () => {
      const k = await loadKpis(fake((a) => a.collection === 'messages'))
      const unavailable = { kind: 'unavailable' }
      expect(k.messages).toEqual({ total: unavailable, adhesion: unavailable, contact: unavailable })
      expect(k.actualites.publiees).toEqual({ kind: 'value', value: 1 })
    })
```

Run: `npx vitest run tests/unit/formulaires-renvoi.test.ts tests/unit/kpi.test.ts`

Expected: FAIL (module `renvoi` introuvable, `messageCounts` absent, `NO_SOURCE` contient encore `adhesions`).

- [ ] **Step 2 : Endpoint de renvoi**

`src/lib/formulaires/renvoi.ts` :

```ts
import type { PayloadHandler } from 'payload'
import { notifierMessage } from './email'

export const ETATS_RENVOYABLES = ['echec', 'non_configure'] as const

/** POST /api/messages/:id/renvoyer — admin connecté uniquement ; refait la notification d’un message en échec ou non configuré. */
export const renvoyerEmail: PayloadHandler = async (req) => {
  if (!req.user) return Response.json({ message: 'Connexion requise.' }, { status: 403 })
  const id = String(req.routeParams?.id ?? '')
  const message = await req.payload.findByID({ collection: 'messages', id, depth: 0, disableErrors: true, overrideAccess: true })
  if (!message) return Response.json({ message: 'Message introuvable.' }, { status: 404 })
  if (!(ETATS_RENVOYABLES as readonly string[]).includes(message.emailEtat)) {
    return Response.json({ message: 'L’e-mail de ce message a déjà été envoyé.' }, { status: 409 })
  }
  return Response.json(await notifierMessage(req.payload, message))
}
```

- [ ] **Step 3 : Composants admin**

`src/components/admin/DonneesLisibles.tsx` :

```tsx
'use client'

import { Fragment } from 'react'
import { useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import { lignesLisibles } from '@/lib/formulaires/libelles'

/** Affiche le champ JSON `donnees` d’un message sous forme de liste « libellé : valeur », en lecture seule. */
const DonneesLisibles: JSONFieldClientComponent = ({ path }) => {
  const { value } = useField<unknown>({ path })
  const lignes = lignesLisibles(value)
  return (
    <div className="field-type donnees-lisibles" style={{ marginBottom: 'var(--base)' }}>
      <p className="field-label" style={{ marginBottom: 8 }}>Données envoyées</p>
      {lignes.length === 0 ? (
        <p>Aucune donnée.</p>
      ) : (
        <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, max-content) 1fr', gap: '6px 16px', margin: 0 }}>
          {lignes.map((ligne) => (
            <Fragment key={ligne.libelle}>
              <dt style={{ fontWeight: 600 }}>{ligne.libelle}</dt>
              <dd style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{ligne.valeur}</dd>
            </Fragment>
          ))}
        </dl>
      )}
    </div>
  )
}

export default DonneesLisibles
```

`src/components/admin/RenvoyerEmail.tsx` :

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, toast, useConfig, useDocumentInfo, useFormFields } from '@payloadcms/ui'

/** Bouton de la vue d’édition d’un message : visible seulement si l’e-mail est en échec ou non configuré. */
export default function RenvoyerEmail() {
  const { id } = useDocumentInfo()
  const { config } = useConfig()
  const etat = useFormFields(([fields]) => fields.emailEtat?.value as string | undefined)
  const router = useRouter()
  const [enCours, setEnCours] = useState(false)
  const [fait, setFait] = useState(false)

  if (!id || fait || (etat !== 'echec' && etat !== 'non_configure')) return null

  async function renvoyer() {
    setEnCours(true)
    try {
      const res = await fetch(`${config.serverURL}${config.routes.api}/messages/${id}/renvoyer`, { method: 'POST', credentials: 'include' })
      const corps = (await res.json().catch(() => ({}))) as { emailEtat?: string; emailErreur?: string; message?: string }
      if (!res.ok) toast.error(corps.message ?? 'Renvoi impossible.')
      else if (corps.emailEtat === 'envoye') {
        toast.success('E-mail envoyé.')
        setFait(true)
        router.refresh()
      } else if (corps.emailEtat === 'non_configure') toast.warning('E-mail non configuré : renseigner le SMTP et l’adresse de réception dans les Réglages.')
      else toast.error(`Échec de l’envoi : ${corps.emailErreur ?? 'erreur inconnue'}`)
    } catch {
      toast.error('Renvoi impossible : vérifiez la connexion.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Button buttonStyle="secondary" size="medium" disabled={enCours} onClick={renvoyer}>
      Renvoyer l’e-mail
    </Button>
  )
}
```

- [ ] **Step 4 : Brancher dans la collection**

Dans `src/collections/Messages.ts` :

```ts
import { renvoyerEmail } from '../lib/formulaires/renvoi'
// …
  admin: {
    // … useAsTitle, group, defaultColumns, listSearchableFields, description inchangés
    components: { edit: { beforeDocumentControls: ['/components/admin/RenvoyerEmail'] } },
  },
  endpoints: [{ path: '/:id/renvoyer', method: 'post', handler: renvoyerEmail }],
```

Champ `donnees` :

```ts
    {
      name: 'donnees',
      label: 'Données envoyées',
      type: 'json',
      required: true,
      admin: { readOnly: true, components: { Field: '/components/admin/DonneesLisibles' } },
      access: nonModifiable,
    },
```

Run: `npm run generate:importmap`

Expected : `src/app/(payload)/admin/importMap.js` référence `DonneesLisibles` et `RenvoyerEmail`.

- [ ] **Step 5 : KPI**

`src/lib/kpi/compute.ts` :
- supprimer l'entrée `{ id: 'adhesions', … }` de `NO_SOURCE` ;
- ajouter :

```ts
export type MessageRow = { type?: string | null }

export function messageCounts(rows: MessageRow[]) {
  return {
    total: rows.length,
    adhesion: rows.filter((r) => r.type === 'adhesion').length,
    contact: rows.filter((r) => r.type === 'contact').length,
  }
}
```

`src/lib/kpi/load.ts` :
- importer `messageCounts` ;
- ajouter une huitième lecture à la fin du `Promise.all` (et `messages` à la déstructuration) :

```ts
    safe(() => payload.find({ collection: 'messages', ...ALL, where: { traite: { not_equals: true } }, select: { type: true } })),
```

puis, dans l'objet renvoyé :

```ts
    messages: messages
      ? (({ total, adhesion, contact }) => ({ total: value(total), adhesion: value(adhesion), contact: value(contact) }))(messageCounts(messages.docs))
      : { total: unavailable, adhesion: unavailable, contact: unavailable },
```

`src/components/admin/KpiDashboard.tsx` : ajouter la constante `const NON_TRAITES = 'where[traite][not_equals]=true'` près de `SANS_ALT`, puis cette carte en **première** position dans `.kpi-grid` :

```tsx
        <article className="kpi-card">
          <h3>Messages non traités</h3>
          <p className="kpi-muted kpi-help">Formulaires reçus, case « Traité » non cochée</p>
          <ul>
            <Row label="Total" state={k.messages.total} href={`${LIST}/messages?${NON_TRAITES}`} />
            <Row label="Adhésions" state={k.messages.adhesion} href={`${LIST}/messages?${NON_TRAITES}&where[type][equals]=adhesion`} />
            <Row label="Contact" state={k.messages.contact} href={`${LIST}/messages?${NON_TRAITES}&where[type][equals]=contact`} />
          </ul>
        </article>
```

Run: `npx vitest run tests/unit/formulaires-renvoi.test.ts tests/unit/kpi.test.ts`

Expected: PASS.

- [ ] **Step 6 : Tests e2e**

À la fin du `describe` de `tests/e2e/messages-email.spec.ts` (après les deux tests de la tâche 3, qui laissent `emailContact` renseigné), ajouter :

```ts
  test('admin : données lisibles, puis « Renvoyer l’e-mail » sur un message non configuré', async ({ page, request }) => {
    const message = await lireMessage(request, token, refs.sansAdresse)
    expect(message?.emailEtat).toBe('non_configure')
    await loginAdmin(page)
    await page.goto(`/admin/collections/messages/${message!.id}`)
    const donnees = page.locator('.donnees-lisibles')
    await expect(donnees.getByText('Message', { exact: true })).toBeVisible()
    await expect(donnees.getByText(CONTACT.message)).toBeVisible()
    await page.getByRole('button', { name: 'Renvoyer l’e-mail' }).click()
    await expect(page.getByText('E-mail envoyé.')).toBeVisible()
    expect((await lireMessage(request, token, refs.sansAdresse))?.emailEtat).toBe('envoye')
    expect(emailsCaptures().some((e) => e.text?.includes(refs.sansAdresse))).toBe(true)
    await page.reload()
    await expect(page.getByRole('button', { name: 'Renvoyer l’e-mail' })).toHaveCount(0)
  })

  test('endpoint de renvoi : refusé sans session, refusé pour un e-mail déjà envoyé', async ({ request }) => {
    const message = await lireMessage(request, token, refs.avecAdresse)
    expect((await request.post(`/api/messages/${message!.id}/renvoyer`)).status()).toBe(403)
    expect((await request.post(`/api/messages/${message!.id}/renvoyer`, { headers: { Authorization: `JWT ${token}` } })).status()).toBe(409)
  })

  test('liste : colonnes demandées, non traités d’abord', async ({ page, request }) => {
    const message = await lireMessage(request, token, refs.sansAdresse)
    const patch = await request.patch(`/api/messages/${message!.id}`, { headers: { Authorization: `JWT ${token}` }, data: { traite: true } })
    expect(patch.ok(), await patch.text()).toBe(true)
    await loginAdmin(page)
    await page.goto(`/admin/collections/messages?search=${PREFIXE}`)
    const entete = page.locator('table thead')
    for (const colonne of ['Référence', 'Type', 'Nom', 'État de l’e-mail', 'Traité', 'Créé(e) à']) await expect(entete).toContainText(colonne)
    await expect(page.locator('table tbody')).toContainText(refs.avecAdresse)
    const lignes = await page.locator('table tbody tr').allTextContents()
    const nonTraite = lignes.findIndex((t) => t.includes(refs.avecAdresse))
    const traite = lignes.findIndex((t) => t.includes(refs.sansAdresse))
    expect(nonTraite).toBeGreaterThanOrEqual(0)
    expect(traite).toBeGreaterThan(nonTraite)
  })
```

Ajouter `loginAdmin` à l'import depuis `./admin-helpers`. Le libellé de colonne de `createdAt` vient de la traduction FR de Payload (`general:createdAt` = « Créé(e) à »). Si l'en-tête réel diffère, aligner le test sur le libellé affiché, sans retirer de colonne.

Dans `tests/e2e/tableau-de-bord.spec.ts` :
- dans le test `valeurs réelles, situation datée et cartes sans source`, supprimer la ligne `await expect(board.getByText('Aucune source configurée — disponible au lot 2')).toBeVisible()` ;
- ajouter les imports `import { envoyerFormulaire, lireMessage, purgerMessages } from './formulaires-helpers'` ;
- ajouter à la fin du fichier :

```ts
const PREFIXE_KPI = 'e2e-kpi-'

test.describe('carte « Messages non traités »', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''
  const refs = { nonTraite: '', traite: '' }

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    await purgerMessages(request, token, PREFIXE_KPI)
    const contact = { email: 'visiteur@example.org', message: 'Message de test du tableau de bord.' }
    refs.nonTraite = (await (await envoyerFormulaire(request, 'contact', { ...contact, nom: `${PREFIXE_KPI}A-traiter` })).json()).reference
    refs.traite = (await (await envoyerFormulaire(request, 'contact', { ...contact, nom: `${PREFIXE_KPI}Deja-traite` })).json()).reference
    const traite = await lireMessage(request, token, refs.traite)
    const patch = await request.patch(`/api/messages/${traite!.id}`, { headers: { Authorization: `JWT ${token}` }, data: { traite: true } })
    expect(patch.ok(), await patch.text()).toBe(true)
  })
  test.afterAll(async ({ request }) => {
    await purgerMessages(request, token, PREFIXE_KPI)
  })

  test('valeur réelle, répartition par type et lien vers la liste filtrée', async ({ page }) => {
    await loginAdmin(page)
    const carte = page.locator('.kpi-dashboard article').filter({ has: page.getByRole('heading', { name: 'Messages non traités' }) })
    await expect(carte.getByRole('link', { name: /^Total\s*[1-9]\d*$/ })).toBeVisible() // au moins le message non traité de ce test
    await expect(carte.getByRole('link', { name: /^Adhésions\s*\d+$/ })).toHaveAttribute('href', /where\[traite\]\[not_equals\]=true&where\[type\]\[equals\]=adhesion$/)
    await carte.getByRole('link', { name: /^Contact\s*\d+$/ }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/messages\?.*where\[traite\]\[not_equals\]=true/)
    // D’autres specs créent des messages en parallèle : on restreint la liste filtrée aux messages de ce test.
    await page.goto(`${page.url()}&search=${PREFIXE_KPI}`)
    await expect(page.locator('table tbody')).toContainText(refs.nonTraite)
    await expect(page.locator('table tbody')).not.toContainText(refs.traite)
  })
})
```

- [ ] **Step 7 : README**

Dans `README.md`, section « Administration » :
- remplacer la phrase « Les cartes adhésions et transactions s'activeront avec les lots 2 et 4. » par « La carte « Messages non traités » compte les messages dont la case « Traité » n'est pas cochée, avec un lien vers la liste filtrée. » ;
- ajouter la puce :

```markdown
- **Messages reçus** (*Formulaires*) : demandes d'adhésion et messages de contact, non traités en premier. Les données envoyées sont en lecture seule ; seules la case « Traité » et les notes internes se modifient. Si l'e-mail est en échec ou non configuré, le bouton « Renvoyer l'e-mail » refait l'envoi (une fois le SMTP et l'adresse réglés).
```

- [ ] **Step 8 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected : tout passe.

- [ ] **Step 9 : Commit**

```bash
git add src/components/admin/DonneesLisibles.tsx src/components/admin/RenvoyerEmail.tsx src/lib/formulaires/renvoi.ts src/collections/Messages.ts src/lib/kpi src/components/admin/KpiDashboard.tsx "src/app/(payload)/admin/importMap.js" tests/unit/formulaires-renvoi.test.ts tests/unit/kpi.test.ts tests/e2e/messages-email.spec.ts tests/e2e/tableau-de-bord.spec.ts README.md
git commit -F - <<'EOF'
feat: admin des messages (données lisibles, renvoi de l’e-mail) et carte KPI des messages non traités

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 7 : Collection `postes` (brouillons, rattachements validés, suppression protégée, aperçu)

**Files:**
- Create: `src/lib/organigramme.ts`, `src/hooks/postes.ts`, `src/collections/Postes.ts`
- Modify: `src/payload.config.ts`
- Create (générés) : `src/migrations/<horodatage>_postes.ts` et `.json` ; Modify : `src/migrations/index.ts`, `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`
- Create: `tests/unit/organigramme.test.ts` ; Modify: `tests/unit/access.test.ts`
- Create: `tests/e2e/postes-helpers.ts`, `tests/e2e/postes.spec.ts`

**Interfaces:**
- Consumes :
  - `revalidateCollection` et `revalidateCollectionDelete` (`src/hooks/revalidate.ts`) ;
  - `previewUrl` (`src/lib/preview.ts`) et `siteUrl` (`src/lib/seo.ts`) ;
  - `scripts/base-jetable.ts` (tâche 2) ;
  - `adminToken`.
- Produces (utilisés par les tâches 8 et 9) :
  - Collection `postes`, interface `Poste`, avec les champs :
    - `intitule` (localisé, requis) ;
    - `mission` (localisé) ;
    - `parent` (relation `postes`) ;
    - `ordre` ;
    - `personneNom` ;
    - `personnePhoto` (upload `medias`) ;
    - `personneBio` (localisé) ;
    - `cle` (caché, unique) ;
    - `_status`.
  - Aperçu : `admin.preview` vers `/{locale}/organisation`.
  - `src/lib/organigramme.ts` :
    - `type IdPoste = number | string` ;
    - `PUBLISHED_POSTE: Where` et `INTITULE_RENSEIGNE: Where` ;
    - `MESSAGES_RATTACHEMENT` (`lui`, `boucle`, `absent`) et `MESSAGE_SUPPRESSION` ;
    - `idDe(valeur: unknown): IdPoste | null` ;
    - `verifierRattachement(id: IdPoste | null, parent: IdPoste | null, lireParent: (id: IdPoste) => Promise<IdPoste | null | undefined>): Promise<string | null>`.
  - `src/hooks/postes.ts` : `validerRattachement: CollectionBeforeValidateHook` et `bloquerSuppressionParent: CollectionBeforeDeleteHook`.
  - `tests/e2e/postes-helpers.ts` :
    - `creerPoste(request, headers, data, statut: 'draft' | 'published'): Promise<number>` ;
    - `purgerPostes(request, headers, prefixe): Promise<void>`.

- [ ] **Step 1 : Tests unitaires, à écrire avant le code**

`tests/unit/organigramme.test.ts` :

```ts
import { APIError, ValidationError } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { bloquerSuppressionParent, validerRattachement } from '@/hooks/postes'
import { MESSAGES_RATTACHEMENT, MESSAGE_SUPPRESSION, idDe, verifierRattachement } from '@/lib/organigramme'

/** Postes en base : id → parent (null = racine). Un id absent = poste inexistant. */
const lecteur = (parents: Record<string, number | null>) => async (id: number | string) => (String(id) in parents ? parents[String(id)] : undefined)

describe('identifiant d’un rattachement', () => {
  it('id brut, document peuplé ou vide', () => {
    expect(idDe(3)).toBe(3)
    expect(idDe({ id: 4, intitule: 'x' })).toBe(4)
    expect(idDe(null)).toBeNull()
    expect(idDe(undefined)).toBeNull()
    expect(idDe('')).toBeNull()
  })
})

describe('vérification d’un rattachement', () => {
  const base = { '1': null, '2': 1, '3': 2, '4': 3 } // 1 ← 2 ← 3 ← 4

  it('sans parent, ou vers un poste existant hors de sa descendance : accepté', async () => {
    expect(await verifierRattachement(4, null, lecteur(base))).toBeNull()
    expect(await verifierRattachement(4, 1, lecteur(base))).toBeNull()
    expect(await verifierRattachement(null, 3, lecteur(base))).toBeNull() // création
  })
  it('auto-rattachement refusé', async () => {
    expect(await verifierRattachement(2, 2, lecteur(base))).toBe(MESSAGES_RATTACHEMENT.lui)
  })
  it('boucle refusée, même lointaine', async () => {
    expect(await verifierRattachement(1, 2, lecteur(base))).toBe(MESSAGES_RATTACHEMENT.boucle)
    expect(await verifierRattachement(1, 4, lecteur(base))).toBe(MESSAGES_RATTACHEMENT.boucle)
  })
  it('parent absent refusé', async () => {
    expect(await verifierRattachement(4, 99, lecteur(base))).toBe(MESSAGES_RATTACHEMENT.absent)
  })
  it('une anomalie plus haut dans la chaîne (ancêtre absent, boucle sans lien) ne bloque pas ce poste', async () => {
    expect(await verifierRattachement(9, 2, lecteur({ '2': 7 }))).toBeNull()
    expect(await verifierRattachement(9, 5, lecteur({ '5': 6, '6': 5 }))).toBeNull()
  })
})

const reqParents = (parents: Record<string, number | null>) =>
  ({ payload: { findByID: vi.fn(async ({ id }: { id: number }) => (String(id) in parents ? { id, parent: parents[String(id)] } : null)) } }) as never

describe('hook de validation des postes', () => {
  it('lève une erreur de validation sur le champ parent, avec le message explicite', async () => {
    const appel = validerRattachement({ data: { parent: 2 }, originalDoc: { id: 1 }, req: reqParents({ '1': null, '2': 1 }) } as never)
    await expect(appel).rejects.toBeInstanceOf(ValidationError)
    await expect(appel).rejects.toMatchObject({ data: { errors: [{ path: 'parent', message: MESSAGES_RATTACHEMENT.boucle }] } })
  })
  it('laisse passer une modification qui ne touche pas au parent', async () => {
    const data = { ordre: 3 }
    expect(await validerRattachement({ data, originalDoc: { id: 1 }, req: reqParents({}) } as never)).toBe(data)
  })
})

describe('hook de suppression des postes', () => {
  const reqEnfants = (publies: number, brouillons: number) =>
    ({ payload: { find: vi.fn(async ({ draft }: { draft?: boolean }) => ({ totalDocs: draft ? brouillons : publies })) } }) as never

  it('refusée si un poste, même en brouillon, y est rattaché', async () => {
    const appel = bloquerSuppressionParent({ id: 1, req: reqEnfants(0, 1) } as never)
    await expect(appel).rejects.toBeInstanceOf(APIError)
    await expect(appel).rejects.toThrow(MESSAGE_SUPPRESSION)
  })
  it('acceptée sans poste rattaché', async () => {
    await expect(bloquerSuppressionParent({ id: 1, req: reqEnfants(0, 0) } as never)).resolves.toBeUndefined()
  })
})
```

Dans `tests/unit/access.test.ts`, ajouter l'import `import { Postes } from '@/collections/Postes'` et le test :

```ts
describe('organigramme', () => {
  it('un visiteur ne lit que les postes publiés, un admin lit tout', () => {
    const read = Postes.access!.read!
    expect(read(anonymous)).toEqual({ _status: { equals: 'published' } })
    expect(read(admin)).toBe(true)
  })
})
```

Run: `npx vitest run tests/unit/organigramme.test.ts tests/unit/access.test.ts`

Expected: FAIL (modules introuvables).

- [ ] **Step 2 : Règles pures**

`src/lib/organigramme.ts` :

```ts
import type { Where } from 'payload'

export type IdPoste = number | string

/** Un poste est public s’il est publié. Source unique de la règle (accès API et lectures du site). */
export const PUBLISHED_POSTE: Where = { _status: { equals: 'published' } }
/** Poste sans intitulé dans la langue demandée : masqué (pas de repli sur le français). */
export const INTITULE_RENSEIGNE: Where = { intitule: { exists: true } }

export const MESSAGES_RATTACHEMENT = {
  lui: 'Un poste ne peut pas être rattaché à lui-même.',
  boucle: 'Ce rattachement créerait une boucle : un poste ne peut pas être rattaché à l’un de ses subordonnés.',
  absent: 'Le poste de rattachement choisi n’existe pas ou a été supprimé.',
} as const

export const MESSAGE_SUPPRESSION =
  'Ce poste a des postes rattachés (publiés ou en brouillon). Rattachez-les d’abord à un autre poste, puis supprimez-le.'

/** Identifiant d’une relation : id brut ou document peuplé ; null si vide. */
export function idDe(valeur: unknown): IdPoste | null {
  if (valeur === null || valeur === undefined || valeur === '') return null
  if (typeof valeur === 'object') return idDe((valeur as { id?: unknown }).id)
  return typeof valeur === 'number' || typeof valeur === 'string' ? valeur : null
}

/**
 * Message d’erreur si `id` (null à la création) ne peut pas être rattaché à `parent`, sinon null.
 * `lireParent(x)` renvoie le parent de x, null pour une racine, undefined si x n’existe pas.
 * On remonte la chaîne des parents : rencontrer `id` signifie une boucle.
 */
export async function verifierRattachement(
  id: IdPoste | null,
  parent: IdPoste | null,
  lireParent: (id: IdPoste) => Promise<IdPoste | null | undefined>,
): Promise<string | null> {
  if (parent === null) return null
  if (id !== null && String(parent) === String(id)) return MESSAGES_RATTACHEMENT.lui
  const vus = new Set<string>()
  let courant: IdPoste = parent
  for (let profondeur = 0; profondeur < 1000; profondeur++) {
    vus.add(String(courant))
    const suivant = await lireParent(courant)
    if (suivant === undefined) return profondeur === 0 ? MESSAGES_RATTACHEMENT.absent : null
    if (suivant === null) return null
    if (id !== null && String(suivant) === String(id)) return MESSAGES_RATTACHEMENT.boucle
    if (vus.has(String(suivant))) return null // boucle déjà présente plus haut, sans lien avec ce poste
    courant = suivant
  }
  return null
}
```

- [ ] **Step 3 : Hooks**

`src/hooks/postes.ts` :

```ts
import { APIError, ValidationError, type CollectionBeforeDeleteHook, type CollectionBeforeValidateHook, type PayloadRequest } from 'payload'
import { MESSAGE_SUPPRESSION, idDe, verifierRattachement, type IdPoste } from '../lib/organigramme'

/** Parent d’un poste dans sa dernière version (brouillon compris) ; undefined si le poste n’existe pas. */
function lecteurParent(req: PayloadRequest) {
  return async (id: IdPoste): Promise<IdPoste | null | undefined> => {
    const doc = await req.payload.findByID({ collection: 'postes', id, depth: 0, draft: true, disableErrors: true, overrideAccess: true, req })
    return doc ? idDe(doc.parent) : undefined
  }
}

/**
 * Hook (et non `validate` du champ) : Payload ne valide pas les champs d’un brouillon, alors que les hooks tournent toujours.
 * Refuse l’auto-rattachement, les boucles et un parent inexistant, avec un message sur le champ « Rattaché à ».
 */
export const validerRattachement: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  if (!data || !('parent' in data)) return data
  const erreur = await verifierRattachement(idDe(originalDoc?.id), idDe(data.parent), lecteurParent(req))
  if (erreur) throw new ValidationError({ collection: 'postes', errors: [{ path: 'parent', message: erreur }], req })
  return data
}

/** Refuse de supprimer un poste auquel un autre est rattaché, dans sa version publiée ou dans son dernier brouillon. */
export const bloquerSuppressionParent: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const where = { parent: { equals: id } }
  // Lectures successives : en parallèle, elles se disputeraient la transaction de `req`.
  const publies = await req.payload.find({ collection: 'postes', where, depth: 0, limit: 1, overrideAccess: true, req })
  const brouillons = await req.payload.find({ collection: 'postes', where, depth: 0, limit: 1, draft: true, overrideAccess: true, req })
  if (publies.totalDocs + brouillons.totalDocs > 0) throw new APIError(MESSAGE_SUPPRESSION, 400, null, true)
}
```

- [ ] **Step 4 : Collection**

`src/collections/Postes.ts` :

```ts
import type { CollectionConfig } from 'payload'
import { bloquerSuppressionParent, validerRattachement } from '../hooks/postes'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'
import { PUBLISHED_POSTE } from '../lib/organigramme'
import { previewUrl } from '../lib/preview'
import { siteUrl } from '../lib/seo'

export const Postes: CollectionConfig = {
  slug: 'postes',
  typescript: { interface: 'Poste' },
  labels: { singular: 'Poste', plural: 'Organigramme' },
  admin: {
    useAsTitle: 'intitule',
    group: 'Contenus',
    defaultColumns: ['intitule', 'personneNom', 'parent', 'ordre', '_status'],
    listSearchableFields: ['intitule', 'personneNom'],
    description: 'Postes de l’organigramme, leurs titulaires et leurs rattachements. « Aperçu » montre la page Organisation avec les brouillons.',
    preview: (_doc, { locale }) =>
      process.env.PREVIEW_SECRET ? previewUrl(siteUrl(), `/${locale === 'en' ? 'en' : 'fr'}/organisation`, process.env.PREVIEW_SECRET) : null,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: ({ req }) => (req.user ? true : PUBLISHED_POSTE) },
  hooks: {
    beforeValidate: [validerRattachement],
    beforeDelete: [bloquerSuppressionParent],
    afterChange: [revalidateCollection],
    afterDelete: [revalidateCollectionDelete],
  },
  defaultSort: 'ordre',
  fields: [
    { name: 'intitule', label: 'Intitulé du poste', type: 'text', required: true, localized: true },
    { name: 'mission', label: 'Mission', type: 'textarea', localized: true, admin: { description: 'Une phrase courte.' } },
    {
      name: 'parent',
      label: 'Rattaché à',
      type: 'relationship',
      relationTo: 'postes',
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      admin: { description: 'Laisser vide pour le poste au sommet (une seule racine conseillée).' },
    },
    { name: 'ordre', label: 'Ordre', type: 'number', defaultValue: 0, admin: { description: 'Ordre parmi les postes rattachés au même parent : les plus petits d’abord.' } },
    { name: 'personneNom', label: 'Nom de la personne', type: 'text', admin: { description: 'Nom public, avec l’accord de la personne.' } },
    { name: 'personnePhoto', label: 'Portrait', type: 'upload', relationTo: 'medias' },
    { name: 'personneBio', label: 'Courte biographie', type: 'textarea', localized: true },
    { name: 'cle', type: 'text', unique: true, index: true, admin: { hidden: true } },
  ],
}
```

Dans `src/payload.config.ts` : `import { Postes } from './collections/Postes'`, puis `collections: [Pages, Actualites, Projets, Postes, Medias, Albums, Messages, Users]`.

Run: `npx vitest run tests/unit/organigramme.test.ts tests/unit/access.test.ts`

Expected: PASS.

- [ ] **Step 5 : Migration `postes`, testée up/down/up**

La base de dev doit tourner. Préparer d'abord la base jetable au niveau actuel (Git Bash) :

```bash
npx tsx scripts/base-jetable.ts creer
DATABASE_URI=postgres://postgres:postgres@127.0.0.1:5433/terredavenir_jetable npm run migrate
```

Run: `npm run migrate:create postes` (répondre **create** à chaque question), puis `npm run migrate; npm run generate:types; npm run generate:importmap`

Expected : la migration crée :
- `postes`, `postes_locales`, `_postes_v`, `_postes_v_locales` ;
- les enums de statut ;
- l'index unique sur `cle` ;
- les clés étrangères `parent_id` (vers `postes`) et `personne_photo_id` (vers `medias`) ;
- la colonne `postes_id` de `payload_locked_documents_rels`.

Aucune donnée n'est à reprendre. Comme pour la tâche 2, ajouter `IF EXISTS` aux `DROP CONSTRAINT` et `DROP INDEX` du `down` qui suivent un `DROP TABLE ... CASCADE`. `src/payload-types.ts` contient alors `export interface Poste`, avec `parent?: (number | null) | Poste;`.

Puis :

```bash
J=postgres://postgres:postgres@127.0.0.1:5433/terredavenir_jetable
DATABASE_URI=$J npm run migrate
DATABASE_URI=$J npm run payload -- migrate:down
DATABASE_URI=$J npm run migrate
npx tsx scripts/base-jetable.ts supprimer
```

Expected : tout réussit, puis la base jetable est supprimée.

- [ ] **Step 6 : Tests e2e**

`tests/e2e/postes-helpers.ts` :

```ts
import { expect, type APIRequestContext } from '@playwright/test'

export type Entetes = { Authorization: string }

export async function creerPoste(request: APIRequestContext, headers: Entetes, data: Record<string, unknown>, statut: 'draft' | 'published'): Promise<number> {
  const res = await request.post(`/api/postes?locale=fr${statut === 'draft' ? '&draft=true' : ''}`, { headers, data: { ...data, _status: statut } })
  expect(res.ok(), await res.text()).toBe(true)
  return (await res.json()).doc.id as number
}

/** Supprime les postes de test d’un préfixe de `cle`. Plusieurs passes : un parent n’est supprimable qu’une fois ses enfants partis. */
export async function purgerPostes(request: APIRequestContext, headers: Entetes, prefixe: string): Promise<void> {
  for (let passe = 0; passe < 6; passe++) {
    const res = await request.get(`/api/postes?draft=true&limit=100&depth=0&where[cle][like]=${encodeURIComponent(prefixe)}`, { headers })
    expect(res.ok(), await res.text()).toBe(true)
    const docs = (await res.json()).docs as { id: number }[]
    if (docs.length === 0) return
    for (const doc of docs) await request.delete(`/api/postes/${doc.id}`, { headers })
  }
  throw new Error(`Postes de test non supprimés (préfixe ${prefixe})`)
}
```

`tests/e2e/postes.spec.ts`. Cette spec ne crée **que des brouillons** : la page publique reste réservée à `organigramme.spec.ts` (tâche 8), qui affirme un état exact des postes publiés.

```ts
import { expect, test } from '@playwright/test'
import { adminToken } from './admin-helpers'
import { creerPoste, purgerPostes, type Entetes } from './postes-helpers'

const PREFIXE = 'e2e-postes-'

test.describe('organigramme : règles des postes', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let headers: Entetes
  const ids = { racine: 0, enfant: 0 }

  test.beforeAll(async ({ request }) => {
    headers = { Authorization: `JWT ${await adminToken(request)}` }
    await purgerPostes(request, headers, PREFIXE)
    ids.racine = await creerPoste(request, headers, { cle: `${PREFIXE}racine`, intitule: 'E2E postes racine', ordre: 0 }, 'draft')
    ids.enfant = await creerPoste(request, headers, { cle: `${PREFIXE}enfant`, intitule: 'E2E postes enfant', parent: ids.racine, ordre: 0 }, 'draft')
  })
  test.afterAll(async ({ request }) => {
    await purgerPostes(request, headers, PREFIXE)
  })

  test('auto-rattachement refusé avec un message explicite', async ({ request }) => {
    const res = await request.patch(`/api/postes/${ids.racine}?draft=true&locale=fr`, { headers, data: { parent: ids.racine } })
    expect(res.status()).toBe(400)
    expect(await res.text()).toContain('Un poste ne peut pas être rattaché à lui-même.')
  })

  test('boucle refusée avec un message explicite', async ({ request }) => {
    const res = await request.patch(`/api/postes/${ids.racine}?draft=true&locale=fr`, { headers, data: { parent: ids.enfant } })
    expect(res.status()).toBe(400)
    expect(await res.text()).toContain('Ce rattachement créerait une boucle')
  })

  test('parent absent refusé avec un message explicite', async ({ request }) => {
    const res = await request.post('/api/postes?locale=fr&draft=true', { headers, data: { cle: `${PREFIXE}orphelin`, intitule: 'E2E postes orphelin', parent: 99999999, _status: 'draft' } })
    expect(res.status()).toBe(400)
    expect(await res.text()).toContain('n’existe pas')
  })

  test('suppression d’un parent refusée tant qu’un poste (même brouillon) lui est rattaché', async ({ request }) => {
    const res = await request.delete(`/api/postes/${ids.racine}`, { headers })
    expect(res.ok()).toBe(false)
    expect(await res.text()).toContain('Rattachez-les d’abord à un autre poste')
    expect((await request.get(`/api/postes/${ids.racine}?draft=true`, { headers })).status()).toBe(200)
  })

  test('API publique : les brouillons ne sont pas exposés', async ({ request }) => {
    const docs: { _status?: string; intitule?: string }[] = (await (await request.get('/api/postes?limit=100')).json()).docs
    expect(docs.every((d) => d._status === 'published')).toBe(true)
    expect(docs.map((d) => d.intitule)).not.toContain('E2E postes racine')
    expect([403, 404]).toContain((await request.get(`/api/postes/${ids.racine}`)).status())
  })
})
```

Run: `npm run test:e2e -- tests/e2e/postes.spec.ts --project=desktop`

Expected : PASS.

- [ ] **Step 7 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected : tout passe. Dans l'admin, *Contenus > Organigramme* liste les postes ; le champ « Rattaché à » ne propose pas le poste lui-même ; le bouton « Aperçu » est présent.

- [ ] **Step 8 : Commit**

```bash
git add src/lib/organigramme.ts src/hooks/postes.ts src/collections/Postes.ts src/payload.config.ts src/migrations src/payload-types.ts "src/app/(payload)/admin/importMap.js" tests/unit/organigramme.test.ts tests/unit/access.test.ts tests/e2e/postes-helpers.ts tests/e2e/postes.spec.ts
git commit -F - <<'EOF'
feat: collection de l’organigramme (brouillons, rattachements validés, suppression protégée, aperçu)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 8 : Page publique `/organisation` (arbre, liste accessible, état vide, aperçu)

**Files:**
- Modify: `src/lib/organigramme.ts` (ajout de `construireArbre`), `src/lib/content.ts` (ajout de `getPostes`)
- Create: `src/components/organisation/Organigramme.tsx`
- Modify: `src/app/(site)/[locale]/organisation/page.tsx`, `src/app/(site)/globals.css`
- Modify: `src/lib/i18n/dictionaries/fr.ts`, `src/lib/i18n/dictionaries/en.ts`
- Modify: `tests/unit/organigramme.test.ts` ; Create: `tests/unit/organigramme-composant.test.tsx`
- Create: `tests/e2e/organigramme.spec.ts` ; Modify: `tests/e2e/institution.spec.ts`

**Interfaces:**
- Consumes :
  - collection `postes`, `PUBLISHED_POSTE`, `INTITULE_RENSEIGNE`, `idDe` (tâche 7) ;
  - `creerPoste` et `purgerPostes` (tâche 7) ;
  - `isPreviewing()` (`src/lib/content.ts`), `PreviewBanner`, la route `/api/apercu` (`PREVIEW_SECRET` e2e = `e2e-apercu`) ;
  - `MediaImage` (export nommé, `src/components/ui/MediaImage.tsx`) ;
  - `loginAdmin` et `adminToken`.
- Produces :
  - `type PosteNoeud = { poste: Poste; parentId: number | null; enfants: PosteNoeud[] }` ;
  - `construireArbre(postes: Poste[]): PosteNoeud[]` ;
  - `getPostes(locale: Locale, draft = false): Promise<Poste[]>` (`draft` est un booléen : `cache` de React compare les arguments par valeur) ;
  - `Organigramme({ titre, noeuds, labels })` ;
  - les clés de dictionnaire `organigramme.{titre, vide, liste}` ;
  - les attributs DOM `data-vue="arbre" | "liste"`, et `data-poste` / `data-parent` sur chaque `<li>`.

- [ ] **Step 1 : Lire la doc Next**

Relire `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/draft-mode.md`. La page lit `isPreviewing()`, comme `src/app/(site)/[locale]/actualites/[slug]/page.tsx`. Elle reste rendue à la demande (ISR) et passe en rendu dynamique quand le cookie d'aperçu est présent.

- [ ] **Step 2 : Tests unitaires, à écrire avant le code**

Ajouter à `tests/unit/organigramme.test.ts` (et `construireArbre`, `type PosteNoeud` à l'import depuis `@/lib/organigramme`, `import type { Poste } from '@/payload-types'`) :

```ts
const poste = (id: number, parent: number | null, ordre: number, intitule = `P${id}`) => ({ id, parent, ordre, intitule }) as unknown as Poste
const forme = (noeuds: PosteNoeud[]): unknown[] => noeuds.map((n) => [n.poste.id, n.parentId, forme(n.enfants)])

describe('construction de l’arbre', () => {
  it('rattache chaque poste à son parent ; frères triés par ordre, puis intitulé', () => {
    const arbre = construireArbre([poste(1, null, 0), poste(3, 1, 2), poste(2, 1, 1), poste(4, 2, 0, 'B'), poste(5, 2, 0, 'A')])
    expect(forme(arbre)).toEqual([[1, null, [[2, 1, [[5, 2, []], [4, 2, []]]], [3, 1, []]]]])
  })
  it('un poste dont le parent n’est pas dans la liste (non publié) remonte à la racine', () => {
    expect(forme(construireArbre([poste(2, 9, 0)]))).toEqual([[2, null, []]])
  })
  it('auto-référence : le poste devient une racine', () => {
    expect(forme(construireArbre([poste(7, 7, 0)]))).toEqual([[7, null, []]])
  })
  it('boucle présente en base : cassée à l’affichage, aucun poste perdu', () => {
    expect(forme(construireArbre([poste(1, null, 0), poste(5, 6, 0), poste(6, 5, 1)]))).toEqual([
      [1, null, []],
      [5, null, [[6, 5, []]]],
    ])
  })
})
```

`tests/unit/organigramme-composant.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Organigramme from '@/components/organisation/Organigramme'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { construireArbre } from '@/lib/organigramme'
import type { Poste } from '@/payload-types'

const dict = getDictionary('fr')
const poste = (id: number, parent: number | null, ordre: number, intitule: string, extra: Partial<Poste> = {}) => ({ id, parent, ordre, intitule, ...extra }) as unknown as Poste

describe('composant organigramme', () => {
  it('aucun poste : message « en cours de validation », ni arbre ni liste', () => {
    const { container } = render(<Organigramme titre="Notre organigramme" noeuds={[]} labels={dict.organigramme} />)
    expect(screen.getByText('Organigramme en cours de validation.')).toBeInTheDocument()
    expect(container.querySelector('[data-vue]')).toBeNull()
  })

  it('arbre décoratif et liste accessible : mêmes rattachements, même ordre', () => {
    const noeuds = construireArbre([
      poste(1, null, 0, 'Présidence', { personneNom: 'Nom A', mission: 'Mission A' }),
      poste(3, 1, 2, 'Trésorerie'),
      poste(2, 1, 1, 'Secrétariat', { mission: '[à valider]' }),
    ])
    const { container } = render(<Organigramme titre="Notre organigramme" noeuds={noeuds} labels={dict.organigramme} />)
    const lire = (vue: string) => [...container.querySelectorAll(`[data-vue="${vue}"] [data-poste]`)].map((li) => `${li.getAttribute('data-poste')}<${li.getAttribute('data-parent')}`)
    expect(lire('liste')).toEqual(['1<', '2<1', '3<1'])
    expect(lire('arbre')).toEqual(lire('liste'))
    expect(container.querySelector('[data-vue="arbre"]')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('list', { name: 'Organigramme : liste des postes' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Présidence', 'Secrétariat', 'Trésorerie'])
    expect(screen.queryByText('[à valider]')).toBeNull() // brouillon de texte masqué
  })
})
```

Run: `npx vitest run tests/unit/organigramme.test.ts tests/unit/organigramme-composant.test.tsx`

Expected: FAIL (`construireArbre` et le composant n'existent pas).

- [ ] **Step 3 : Construction de l'arbre et lecture**

Ajouter à la fin de `src/lib/organigramme.ts` :

```ts
import type { Poste } from '@/payload-types'

export type PosteNoeud = { poste: Poste; parentId: number | null; enfants: PosteNoeud[] }

const comparer = (a: Poste, b: Poste): number =>
  (a.ordre ?? 0) - (b.ordre ?? 0) || (a.intitule ?? '').localeCompare(b.intitule ?? '') || a.id - b.id

/**
 * Arbre des postes, frères triés par ordre puis intitulé.
 * Un poste dont le parent est absent de la liste (non publié, sans intitulé dans la langue) remonte à la racine.
 * Une boucle éventuellement présente en base (refusée à l’écriture) est cassée : aucun poste n’est perdu.
 */
export function construireArbre(postes: Poste[]): PosteNoeud[] {
  const presents = new Set(postes.map((p) => String(p.id)))
  const enfants = new Map<string, Poste[]>()
  const racines: Poste[] = []
  for (const p of postes) {
    const parent = idDe(p.parent)
    if (parent !== null && presents.has(String(parent)) && String(parent) !== String(p.id)) {
      enfants.set(String(parent), [...(enfants.get(String(parent)) ?? []), p])
    } else racines.push(p)
  }
  const places = new Set<string>()
  const construire = (p: Poste, parentId: number | null): PosteNoeud => {
    places.add(String(p.id))
    const fils = (enfants.get(String(p.id)) ?? []).filter((f) => !places.has(String(f.id))).sort(comparer)
    return { poste: p, parentId, enfants: fils.map((f) => construire(f, p.id)) }
  }
  const arbre = [...racines].sort(comparer).map((p) => construire(p, null))
  for (const p of [...postes].sort(comparer)) if (!places.has(String(p.id))) arbre.push(construire(p, null))
  return arbre
}
```

Placer l'`import type { Poste }` en tête du fichier, avec l'import de `Where`.

Dans `src/lib/content.ts` :
- importer `Poste` depuis `@/payload-types` et `INTITULE_RENSEIGNE`, `PUBLISHED_POSTE` depuis `./organigramme` ;
- ajouter :

```ts
/** Postes de l’organigramme : publiés seulement, sauf en aperçu (`draft` : dernières versions, brouillons compris). */
export const getPostes = cache(async (locale: Locale, draft = false): Promise<Poste[]> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'postes',
    where: draft ? INTITULE_RENSEIGNE : { and: [PUBLISHED_POSTE, INTITULE_RENSEIGNE] },
    draft,
    locale,
    depth: 1,
    sort: 'ordre',
    limit: 200,
  })
  return res.docs
})
```

- [ ] **Step 4 : Dictionnaires**

`fr.ts`, nouvelle clé en dernière position (après `formulaires`) :

```ts
  organigramme: {
    titre: 'Notre organigramme',
    vide: 'Organigramme en cours de validation.',
    liste: 'Organigramme : liste des postes',
  },
```

`en.ts`, même position :

```ts
  organigramme: {
    titre: 'Our organization chart',
    vide: 'Organisation chart being finalised.',
    liste: 'Organization chart: list of positions',
  },
```

`vide` reprend mot pour mot la spec (§3.2). `titre` sert de repli si l'intitulé de la section `organigramme` de la page est vide.

- [ ] **Step 5 : Composant**

`src/components/organisation/Organigramme.tsx` :

```tsx
import { MediaImage } from '@/components/ui/MediaImage'
import type { PosteNoeud } from '@/lib/organigramme'
import { isPlaceholder } from '@/lib/text'
import type { Media } from '@/payload-types'

type Props = { titre: string; noeuds: PosteNoeud[]; labels: { vide: string; liste: string } }

const visible = (v?: string | null) => (v && !isPlaceholder(v) ? v : null)

/** Portrait rond ; alt du média (vide si l’image est provisoire, règle de MediaImage), ou décoratif dans le schéma. */
function Portrait({ media, taille, decoratif }: { media: number | Media | null | undefined; taille: number; decoratif: boolean }) {
  if (!media || typeof media === 'number' || !media.url) return null
  return (
    <div className="relative rounded-full overflow-hidden flex-shrink-0 bg-light" style={{ width: taille, height: taille }}>
      <MediaImage media={media} fill decorative={decoratif} sizes={`${taille}px`} className="object-cover" />
    </div>
  )
}

function CarteArbre({ noeud }: { noeud: PosteNoeud }) {
  const p = noeud.poste
  return (
    <div className="w-[168px] rounded-lg border border-border bg-background p-4 flex flex-col items-center text-center gap-2" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <Portrait media={p.personnePhoto} taille={72} decoratif />
      <p className="text-sm font-bold text-foreground leading-snug">{p.intitule}</p>
      {visible(p.personneNom) && <p className="text-sm font-semibold text-primary">{p.personneNom}</p>}
      {visible(p.mission) && <p className="text-xs text-muted-foreground leading-relaxed">{p.mission}</p>}
      {visible(p.personneBio) && <p className="text-xs text-muted-foreground leading-relaxed">{p.personneBio}</p>}
    </div>
  )
}

function BrancheArbre({ noeuds }: { noeuds: PosteNoeud[] }) {
  return (
    <>
      {noeuds.map((n) => (
        <li key={n.poste.id} data-poste={n.poste.id} data-parent={n.parentId ?? ''}>
          <CarteArbre noeud={n} />
          {n.enfants.length > 0 && (
            <ul>
              <BrancheArbre noeuds={n.enfants} />
            </ul>
          )}
        </li>
      ))}
    </>
  )
}

function BrancheListe({ noeuds }: { noeuds: PosteNoeud[] }) {
  return (
    <>
      {noeuds.map((n) => {
        const p = n.poste
        return (
          <li key={p.id} data-poste={p.id} data-parent={n.parentId ?? ''} className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <Portrait media={p.personnePhoto} taille={56} decoratif={false} />
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-foreground font-headings">{p.intitule}</h3>
                {visible(p.personneNom) && <p className="text-sm font-semibold text-primary">{p.personneNom}</p>}
                {visible(p.mission) && <p className="text-sm text-muted-foreground leading-relaxed">{p.mission}</p>}
                {visible(p.personneBio) && <p className="text-sm text-muted-foreground leading-relaxed">{p.personneBio}</p>}
              </div>
            </div>
            {n.enfants.length > 0 && (
              <ul className="ml-4 pl-4 border-l-2 border-border flex flex-col gap-4">
                <BrancheListe noeuds={n.enfants} />
              </ul>
            )}
          </li>
        )
      })}
    </>
  )
}

/**
 * Organigramme : schéma en arbre (décoratif, aria-hidden, à partir de 1280 px) et liste imbriquée accessible,
 * construits à partir du même arbre (mêmes rattachements, même ordre). La liste est toujours dans le DOM :
 * visible sous 1280 px, masquée visuellement au-delà mais lue par les lecteurs d’écran.
 */
export default function Organigramme({ titre, noeuds, labels }: Props) {
  return (
    <section className="bg-background py-20" aria-labelledby="organigramme-titre">
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
        <h2 id="organigramme-titre" className="text-4xl font-bold text-foreground font-headings" style={{ lineHeight: 1.15 }}>
          {titre}
        </h2>
        {noeuds.length === 0 ? (
          <p className="text-lg text-muted-foreground">{labels.vide}</p>
        ) : (
          <>
            <div data-vue="arbre" aria-hidden="true" className="hidden xl:block overflow-x-auto pb-2">
              <ul className="org-arbre">
                <BrancheArbre noeuds={noeuds} />
              </ul>
            </div>
            <ul data-vue="liste" aria-label={labels.liste} className="flex flex-col gap-6 xl:sr-only">
              <BrancheListe noeuds={noeuds} />
            </ul>
          </>
        )}
      </div>
    </section>
  )
}
```

Vérifier que la classe `bg-light` existe (token `--color-light` du `@theme` de `globals.css`).

Ajouter à la fin de `src/app/(site)/globals.css` :

```css
/* Organigramme : traits du schéma en arbre (décoratif, aria-hidden). */
.org-arbre,
.org-arbre ul {
  display: flex;
  justify-content: center;
  position: relative;
  margin: 0;
  padding: 0;
}
.org-arbre ul {
  padding-top: 24px;
}
.org-arbre ul::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  height: 24px;
  border-left: 2px solid var(--color-muted-foreground);
}
.org-arbre li {
  list-style: none;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 8px 0;
}
.org-arbre li::before,
.org-arbre li::after {
  content: '';
  position: absolute;
  top: 0;
  right: 50%;
  width: 50%;
  height: 24px;
  border-top: 2px solid var(--color-muted-foreground);
}
.org-arbre li::after {
  right: auto;
  left: 50%;
  border-left: 2px solid var(--color-muted-foreground);
}
.org-arbre li:first-child::before,
.org-arbre li:last-child::after {
  border: 0 none;
}
.org-arbre li:last-child::before {
  border-right: 2px solid var(--color-muted-foreground);
  border-radius: 0 6px 0 0;
}
.org-arbre li:first-child::after {
  border-radius: 6px 0 0 0;
}
.org-arbre > li,
.org-arbre li:only-child {
  padding-top: 0;
}
.org-arbre > li::before,
.org-arbre > li::after,
.org-arbre li:only-child::before,
.org-arbre li:only-child::after {
  display: none;
}
```

Run: `npx vitest run tests/unit/organigramme.test.ts tests/unit/organigramme-composant.test.tsx tests/unit/dictionaries.test.ts`

Expected: PASS.

- [ ] **Step 6 : Page**

Remplacer `src/app/(site)/[locale]/organisation/page.tsx` par :

```tsx
import { notFound } from 'next/navigation'
import PreviewBanner from '@/components/layout/PreviewBanner'
import Organigramme from '@/components/organisation/Organigramme'
import ContentSection from '@/components/ui/ContentSection'
import FaqList from '@/components/ui/FaqList'
import PageHero from '@/components/ui/PageHero'
import { getPage, getPostes, isPreviewing } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { construireArbre } from '@/lib/organigramme'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'

export const generateMetadata = metadataFor('organisation', '/organisation')

export default async function OrganisationPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const preview = await isPreviewing()
  const [page, postes] = await Promise.all([getPage('organisation', locale), getPostes(locale, preview)])
  if (!page) notFound()
  // La section « organigramme » (texte) est remplacée par le composant : seul son intitulé est repris.
  const intitule = getSection(page, 'organigramme')?.heading
  return (
    <>
      {preview && (
        <PreviewBanner label={dict.preview.banner} exitLabel={dict.preview.exit} exitHref={`/api/apercu/fin?path=${encodeURIComponent(`/${locale}/organisation`)}`} />
      )}
      <PageHero eyebrow={dict.nav.organisation} title={page.h1 ?? ''} intro={page.intro} image={page.heroImage} />
      <Organigramme titre={intitule && !isPlaceholder(intitule) ? intitule : dict.organigramme.titre} noeuds={construireArbre(postes)} labels={dict.organigramme} />
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

La page reste accessible par le menu et le pied de page (`/organisation` figure déjà dans `NAV_ITEMS` et `STATIC_PATHS`). Les postes n'ont pas de page propre : le sitemap ne change pas.

- [ ] **Step 7 : Tests e2e**

Dans `tests/e2e/institution.spec.ts`, remplacer le test `Organisation : état « en préparation » et FAQ` par la version suivante. L'état vide est vérifié par `organigramme.spec.ts`, la seule spec qui publie des postes.

```ts
test('Organisation : titre de l’organigramme et FAQ', async ({ page }) => {
  await page.goto('/en/organisation')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our organization')
  await expect(page.getByRole('heading', { level: 2, name: 'Our organization chart' })).toBeVisible()
  await page.getByText('How can I contact the NGO?').click()
  await expect(page.getByText(/not published automatically/)).toBeVisible()
})
```

`tests/e2e/organigramme.spec.ts` :

```ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { adminToken, loginAdmin } from './admin-helpers'
import { creerPoste, purgerPostes, type Entetes } from './postes-helpers'

const PREFIXE = 'e2e-org-'
const BROUILLON = 'E2E poste brouillon'

test.describe.configure({ mode: 'serial' })

// Seule spec qui publie des postes : elle peut affirmer l’état exact de la page (le seed ne crée que des brouillons).
test.describe('organigramme public', { tag: '@desktop' }, () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let headers: Entetes
  const ids = { racine: 0, premier: 0, second: 0, sousPoste: 0 }

  test.beforeAll(async ({ request }) => {
    headers = { Authorization: `JWT ${await adminToken(request)}` }
    await purgerPostes(request, headers, PREFIXE)
  })
  test.afterAll(async ({ request }) => {
    await purgerPostes(request, headers, PREFIXE)
  })

  test('aucun poste publié : message « en cours de validation » ; brouillon invisible partout', async ({ page, request }) => {
    // L’écriture déclenche aussi la revalidation : la page pré-rendue au build (base de dev) est remplacée.
    await creerPoste(request, headers, { cle: `${PREFIXE}brouillon`, intitule: BROUILLON, ordre: 0 }, 'draft')
    await expect(async () => {
      await page.goto('/fr/organisation')
      await expect(page.getByText('Organigramme en cours de validation.')).toBeVisible({ timeout: 2_000 })
    }).toPass({ timeout: 20_000 })
    await expect(page.getByText(BROUILLON)).toHaveCount(0)
    await page.goto('/en/organisation')
    await expect(page.getByText('Organisation chart being finalised.')).toBeVisible()
    const publics: { intitule?: string }[] = (await (await request.get('/api/postes?limit=100')).json()).docs
    expect(publics.map((d) => d.intitule)).not.toContain(BROUILLON)
    expect(await (await request.get('/sitemap.xml')).text()).not.toContain(PREFIXE)
  })

  test('postes publiés : arbre et liste avec les mêmes rattachements, dans le même ordre', async ({ page, request }) => {
    ids.racine = await creerPoste(request, headers, { cle: `${PREFIXE}racine`, intitule: 'E2E Présidence', personneNom: 'E2E Personne A', mission: 'E2E mission de la racine', ordre: 0 }, 'published')
    ids.second = await creerPoste(request, headers, { cle: `${PREFIXE}second`, intitule: 'E2E Second poste', parent: ids.racine, ordre: 2 }, 'published')
    ids.premier = await creerPoste(request, headers, { cle: `${PREFIXE}premier`, intitule: 'E2E Premier poste', parent: ids.racine, ordre: 1 }, 'published')
    ids.sousPoste = await creerPoste(request, headers, { cle: `${PREFIXE}sous-poste`, intitule: 'E2E Sous-poste', parent: ids.second, ordre: 0 }, 'published')
    await expect(async () => {
      await page.goto('/fr/organisation')
      await expect(page.locator('[data-vue="liste"]').getByText('E2E Sous-poste')).toHaveCount(1, { timeout: 2_000 })
    }).toPass({ timeout: 20_000 })
    const lire = (vue: string) =>
      page.locator(`[data-vue="${vue}"] [data-poste]`).evaluateAll((els) => els.map((e) => `${e.getAttribute('data-poste')}<${e.getAttribute('data-parent')}`))
    const liste = await lire('liste')
    expect(liste).toEqual([`${ids.racine}<`, `${ids.premier}<${ids.racine}`, `${ids.second}<${ids.racine}`, `${ids.sousPoste}<${ids.second}`])
    expect(await lire('arbre')).toEqual(liste)
    await expect(page.locator('[data-vue="arbre"]')).toBeVisible()
    await expect(page.locator('[data-vue="arbre"]')).toHaveAttribute('aria-hidden', 'true')
    await expect(page.getByRole('list', { name: 'Organigramme : liste des postes' })).toBeAttached()
    await expect(page.getByRole('heading', { level: 3, name: 'E2E Premier poste' })).toBeAttached()
    await expect(page.getByText(BROUILLON)).toHaveCount(0)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
  })

  test('clavier : aucun arrêt dans le schéma décoratif', async ({ page }) => {
    await page.goto('/fr/organisation')
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-vue="arbre"]')))).toBe(false)
    }
  })

  test('mobile : la liste remplace l’arbre', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/fr/organisation')
    await expect(page.locator('[data-vue="liste"]')).toBeVisible()
    await expect(page.locator('[data-vue="arbre"]')).toBeHidden()
    await expect(page.locator('[data-vue="liste"]').getByText('E2E mission de la racine')).toBeVisible()
  })

  test('aperçu : un admin voit les brouillons avec le bandeau, puis quitte l’aperçu', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/api/apercu?path=/fr/organisation&secret=e2e-apercu')
    await expect(page.getByRole('status').getByText('Aperçu — non publié')).toBeVisible()
    await expect(page.locator('[data-vue="arbre"]').getByText(BROUILLON)).toBeVisible()
    await page.getByRole('link', { name: 'Quitter l’aperçu' }).click()
    await expect(async () => {
      await page.goto('/fr/organisation')
      await expect(page.getByText(BROUILLON)).toHaveCount(0, { timeout: 2_000 })
    }).toPass({ timeout: 20_000 })
  })
})
```

Run: `npm run test:e2e -- tests/e2e/organigramme.spec.ts tests/e2e/institution.spec.ts --project=desktop`

Expected : PASS.

- [ ] **Step 8 : Vérifier**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run test:e2e`

Expected : tout passe. `accessibilite.spec.ts` sur `/fr/organisation` et `/en/organisation` reste vert, que des postes e2e soient publiés ou non au même moment.

- [ ] **Step 9 : Commit**

```bash
git add src/lib/organigramme.ts src/lib/content.ts src/components/organisation/Organigramme.tsx "src/app/(site)/[locale]/organisation/page.tsx" "src/app/(site)/globals.css" src/lib/i18n/dictionaries tests/unit/organigramme.test.ts tests/unit/organigramme-composant.test.tsx tests/e2e/organigramme.spec.ts tests/e2e/institution.spec.ts
git commit -F - <<'EOF'
feat: page Organisation avec organigramme en arbre, liste accessible, état vide et aperçu

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 9 : Contenu de départ de l'organigramme (10 postes en brouillon, portraits) et README

**Files:**
- Create: `src/seed/images/organigramme/poste-01.jpg` à `poste-10.jpg`, copiés depuis `.superpowers/contenus/organigramme/` (hors git)
- Create: `src/seed/media.ts` (`upsertMedia` déplacée), `src/seed/data/organigramme.ts`, `src/seed/organigramme.ts`
- Modify: `src/seed/index.ts`
- Create: `tests/unit/seed-organigramme.test.ts`, `tests/e2e/organigramme-seed.spec.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes :
  - collection `postes` et hook `validerRattachement` (tâche 7) ;
  - `construireArbre` (tâche 8) ;
  - `SEED_CONTEXT` (`src/seed/upsert.ts`) ;
  - `isSeedMediaFilename` (`src/seed/media-match.ts`) ;
  - `loginAdmin`, `adminToken`.
- Produces :
  - `src/seed/media.ts` : `type MediaSeed` et `upsertMedia(payload, m: MediaSeed): Promise<number | string>` (même code qu'avant, déplacé) ;
  - `src/seed/data/organigramme.ts` : les types `SeedPoste` et `SeedPortrait`, `PORTRAITS: Record<'reel' | 'ia', SeedPortrait>`, `POSTES: SeedPoste[]` ;
  - `src/seed/organigramme.ts` : `seedOrganigramme(payload: Payload, dossierSeed: string): Promise<void>`.

**Contenu (spec §3.3).** Les missions sont génériques : elles décrivent le rôle, sans aucun fait. Les biographies sont vides. Tout est créé en brouillon.

| # | `cle` | Intitulé FR / EN | Parent | Ordre | Nom public | Mission FR | Mission EN |
|---|---|---|---|---|---|---|---|
| 1 | `poste-01` | Présidente / President | — | 0 | Laurence Ndong | Préside l’association, la représente et veille à la mise en œuvre de ses orientations. | Chairs the association, represents it and oversees the implementation of its priorities. |
| 2 | `poste-02` | Vice-président / Vice-President | 1 | 1 | Jean-Baptiste Mboumba | Seconde la présidence et la supplée en cas d’absence. | Supports the President and deputises when needed. |
| 3 | `poste-03` | Secrétaire générale / Secretary-General | 1 | 2 | Clarisse Nzé Obiang | Coordonne le fonctionnement administratif de l’association et le suivi de ses activités. | Coordinates the association’s administrative work and the follow-up of its activities. |
| 4 | `poste-04` | Trésorier / Treasurer | 1 | 3 | Rodrigue Mintsa Ella | Tient les comptes de l’association et suit l’utilisation de ses ressources. | Keeps the association’s accounts and monitors the use of its resources. |
| 5 | `poste-05` | Secrétaire général adjoint / Deputy Secretary-General | 3 | 1 | Hervé Koumba Ondo | Assiste la secrétaire générale dans la coordination administrative. | Assists the Secretary-General with administrative coordination. |
| 6 | `poste-06` | Trésorière adjointe / Deputy Treasurer | 4 | 1 | Prisca Mabika | Assiste le trésorier dans la tenue des comptes. | Assists the Treasurer in keeping the accounts. |
| 7 | `poste-07` | Chargé des projets et actions / Projects and Initiatives Officer | 3 | 2 | Fabrice Ondo Mba | Prépare et suit les projets et actions de l’association. | Prepares and follows up the association’s projects and initiatives. |
| 8 | `poste-08` | Chargée de la jeunesse et du sport / Youth and Sport Officer | 3 | 3 | Sandrine Ekomi | Anime les initiatives de l’association en faveur de la jeunesse et du sport. | Leads the association’s youth and sport initiatives. |
| 9 | `poste-09` | Chargée de la communication / Communications Officer | 3 | 4 | Aurélie Bivigou | Prépare les publications et les supports d’information de l’association. | Prepares the association’s publications and information materials. |
| 10 | `poste-10` | Chargé des adhésions et de la vie associative / Membership and Community Officer | 3 | 5 | Steeve Nziengui | Accueille les demandes d’adhésion et accompagne la vie associative. | Handles membership applications and supports the association’s community life. |

Portraits :
- **Poste 1 (réel)** : `poste-01.jpg` (400×400, recadré depuis `rencontre-populations-2026-08/photo-3.jpg`). Crédit « Terre d’Avenir KOMO-KANGO », `droitsConfirmes: true`, `provisoire: false`, `galerie: false`, alt « Portrait de la Présidente » / « Portrait of the President ».
- **Postes 2 à 10 (fictifs)** : portraits générés par IA (200×200). Crédit « Portrait généré par IA — provisoire », `provisoire: true`, `galerie: false`, alt « Portrait provisoire » / « Placeholder portrait ». Un média provisoire est affiché comme décoratif par `MediaImage`.
- Fichiers téléversés sous `organigramme-N-photo.jpg` (N = 1 à 10).

- [ ] **Step 1 : Copier les portraits**

```bash
mkdir -p src/seed/images/organigramme
cp .superpowers/contenus/organigramme/poste-*.jpg src/seed/images/organigramme/
ls src/seed/images/organigramme
```

Expected : `poste-01.jpg` à `poste-10.jpg` (10 fichiers). `.superpowers/` reste hors git.

- [ ] **Step 2 : Test unitaire, à écrire avant le code**

`tests/unit/seed-organigramme.test.ts` :

```ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { construireArbre, type PosteNoeud } from '@/lib/organigramme'
import type { Poste } from '@/payload-types'
import { PORTRAITS, POSTES } from '@/seed/data/organigramme'

describe('contenu de départ de l’organigramme (spec §3.3)', () => {
  it('10 postes : clé, intitulés FR et EN, parent et nom public', () => {
    expect(POSTES.map((p) => [p.cle, p.intitule.fr, p.intitule.en, p.parent, p.nom])).toEqual([
      ['poste-01', 'Présidente', 'President', null, 'Laurence Ndong'],
      ['poste-02', 'Vice-président', 'Vice-President', 'poste-01', 'Jean-Baptiste Mboumba'],
      ['poste-03', 'Secrétaire générale', 'Secretary-General', 'poste-01', 'Clarisse Nzé Obiang'],
      ['poste-04', 'Trésorier', 'Treasurer', 'poste-01', 'Rodrigue Mintsa Ella'],
      ['poste-05', 'Secrétaire général adjoint', 'Deputy Secretary-General', 'poste-03', 'Hervé Koumba Ondo'],
      ['poste-06', 'Trésorière adjointe', 'Deputy Treasurer', 'poste-04', 'Prisca Mabika'],
      ['poste-07', 'Chargé des projets et actions', 'Projects and Initiatives Officer', 'poste-03', 'Fabrice Ondo Mba'],
      ['poste-08', 'Chargée de la jeunesse et du sport', 'Youth and Sport Officer', 'poste-03', 'Sandrine Ekomi'],
      ['poste-09', 'Chargée de la communication', 'Communications Officer', 'poste-03', 'Aurélie Bivigou'],
      ['poste-10', 'Chargé des adhésions et de la vie associative', 'Membership and Community Officer', 'poste-03', 'Steeve Nziengui'],
    ])
  })

  it('chaque parent est déclaré avant ses enfants ; une seule racine', () => {
    const vus = new Set<string>()
    for (const p of POSTES) {
      if (p.parent) expect(vus.has(p.parent), p.cle).toBe(true)
      vus.add(p.cle)
    }
    expect(POSTES.filter((p) => p.parent === null)).toHaveLength(1)
  })

  it('arbre attendu, frères dans l’ordre du tableau', () => {
    const num = (cle: string) => Number(cle.slice(-2))
    const postes = POSTES.map((p) => ({ id: num(p.cle), parent: p.parent ? num(p.parent) : null, ordre: p.ordre, intitule: p.intitule.fr }) as unknown as Poste)
    const forme = (n: PosteNoeud[]): unknown[] => n.map((x) => [x.poste.id, forme(x.enfants)])
    expect(forme(construireArbre(postes))).toEqual([
      [1, [[2, []], [3, [[5, []], [7, []], [8, []], [9, []], [10, []]]], [4, [[6, []]]]]],
    ])
  })

  it('textes FR et EN renseignés, apostrophe typographique', () => {
    const textes = [
      ...POSTES.flatMap((p) => [p.intitule.fr, p.intitule.en, p.mission.fr, p.mission.en, p.nom]),
      ...Object.values(PORTRAITS).flatMap((x) => [x.credit, x.alt.fr, x.alt.en, x.source ?? '']),
    ]
    for (const t of textes) expect(t, t).not.toContain("'")
    for (const p of POSTES) for (const t of [p.intitule.fr, p.intitule.en, p.mission.fr, p.mission.en]) expect(t.trim().length).toBeGreaterThan(0)
  })

  it('portraits : fichiers présents, seul le poste 1 est réel', () => {
    for (const p of POSTES) expect(fs.existsSync(path.join(process.cwd(), 'src/seed/images/organigramme', p.fichier)), p.fichier).toBe(true)
    expect(POSTES.filter((p) => p.portrait === 'reel').map((p) => p.cle)).toEqual(['poste-01'])
    expect(PORTRAITS.reel).toMatchObject({ credit: 'Terre d’Avenir KOMO-KANGO', droitsConfirmes: true, provisoire: false })
    expect(PORTRAITS.ia).toMatchObject({ credit: 'Portrait généré par IA — provisoire', provisoire: true })
  })
})
```

Run: `npx vitest run tests/unit/seed-organigramme.test.ts`

Expected: FAIL (module `@/seed/data/organigramme` introuvable).

- [ ] **Step 3 : Données**

`src/seed/data/organigramme.ts` :

```ts
export type SeedPortrait = {
  credit: string
  provisoire: boolean
  droitsConfirmes: boolean
  source?: string
  alt: { fr: string; en: string }
}

export type SeedPoste = {
  /** Clé stable : retrouve le poste d’un seed à l’autre. */
  cle: string
  parent: string | null
  ordre: number
  nom: string
  fichier: string
  portrait: 'reel' | 'ia'
  intitule: { fr: string; en: string }
  mission: { fr: string; en: string }
}

export const PORTRAITS: Record<'reel' | 'ia', SeedPortrait> = {
  reel: {
    credit: 'Terre d’Avenir KOMO-KANGO',
    provisoire: false,
    droitsConfirmes: true,
    source: 'Recadrage de la photo 3 de l’album « rencontre-populations-2026-08 » (19 août 2026)',
    alt: { fr: 'Portrait de la Présidente', en: 'Portrait of the President' },
  },
  ia: {
    credit: 'Portrait généré par IA — provisoire',
    provisoire: true,
    droitsConfirmes: false,
    alt: { fr: 'Portrait provisoire', en: 'Placeholder portrait' },
  },
}

/** Contenu de départ (spec §3.3) : seule la Présidente est réelle ; les postes 2 à 10 portent des noms et portraits fictifs. Tout est créé en brouillon. */
export const POSTES: SeedPoste[] = [
  {
    cle: 'poste-01',
    parent: null,
    ordre: 0,
    nom: 'Laurence Ndong',
    fichier: 'poste-01.jpg',
    portrait: 'reel',
    intitule: { fr: 'Présidente', en: 'President' },
    mission: {
      fr: 'Préside l’association, la représente et veille à la mise en œuvre de ses orientations.',
      en: 'Chairs the association, represents it and oversees the implementation of its priorities.',
    },
  },
  {
    cle: 'poste-02',
    parent: 'poste-01',
    ordre: 1,
    nom: 'Jean-Baptiste Mboumba',
    fichier: 'poste-02.jpg',
    portrait: 'ia',
    intitule: { fr: 'Vice-président', en: 'Vice-President' },
    mission: { fr: 'Seconde la présidence et la supplée en cas d’absence.', en: 'Supports the President and deputises when needed.' },
  },
  {
    cle: 'poste-03',
    parent: 'poste-01',
    ordre: 2,
    nom: 'Clarisse Nzé Obiang',
    fichier: 'poste-03.jpg',
    portrait: 'ia',
    intitule: { fr: 'Secrétaire générale', en: 'Secretary-General' },
    mission: {
      fr: 'Coordonne le fonctionnement administratif de l’association et le suivi de ses activités.',
      en: 'Coordinates the association’s administrative work and the follow-up of its activities.',
    },
  },
  {
    cle: 'poste-04',
    parent: 'poste-01',
    ordre: 3,
    nom: 'Rodrigue Mintsa Ella',
    fichier: 'poste-04.jpg',
    portrait: 'ia',
    intitule: { fr: 'Trésorier', en: 'Treasurer' },
    mission: { fr: 'Tient les comptes de l’association et suit l’utilisation de ses ressources.', en: 'Keeps the association’s accounts and monitors the use of its resources.' },
  },
  {
    cle: 'poste-05',
    parent: 'poste-03',
    ordre: 1,
    nom: 'Hervé Koumba Ondo',
    fichier: 'poste-05.jpg',
    portrait: 'ia',
    intitule: { fr: 'Secrétaire général adjoint', en: 'Deputy Secretary-General' },
    mission: { fr: 'Assiste la secrétaire générale dans la coordination administrative.', en: 'Assists the Secretary-General with administrative coordination.' },
  },
  {
    cle: 'poste-06',
    parent: 'poste-04',
    ordre: 1,
    nom: 'Prisca Mabika',
    fichier: 'poste-06.jpg',
    portrait: 'ia',
    intitule: { fr: 'Trésorière adjointe', en: 'Deputy Treasurer' },
    mission: { fr: 'Assiste le trésorier dans la tenue des comptes.', en: 'Assists the Treasurer in keeping the accounts.' },
  },
  {
    cle: 'poste-07',
    parent: 'poste-03',
    ordre: 2,
    nom: 'Fabrice Ondo Mba',
    fichier: 'poste-07.jpg',
    portrait: 'ia',
    intitule: { fr: 'Chargé des projets et actions', en: 'Projects and Initiatives Officer' },
    mission: { fr: 'Prépare et suit les projets et actions de l’association.', en: 'Prepares and follows up the association’s projects and initiatives.' },
  },
  {
    cle: 'poste-08',
    parent: 'poste-03',
    ordre: 3,
    nom: 'Sandrine Ekomi',
    fichier: 'poste-08.jpg',
    portrait: 'ia',
    intitule: { fr: 'Chargée de la jeunesse et du sport', en: 'Youth and Sport Officer' },
    mission: { fr: 'Anime les initiatives de l’association en faveur de la jeunesse et du sport.', en: 'Leads the association’s youth and sport initiatives.' },
  },
  {
    cle: 'poste-09',
    parent: 'poste-03',
    ordre: 4,
    nom: 'Aurélie Bivigou',
    fichier: 'poste-09.jpg',
    portrait: 'ia',
    intitule: { fr: 'Chargée de la communication', en: 'Communications Officer' },
    mission: { fr: 'Prépare les publications et les supports d’information de l’association.', en: 'Prepares the association’s publications and information materials.' },
  },
  {
    cle: 'poste-10',
    parent: 'poste-03',
    ordre: 5,
    nom: 'Steeve Nziengui',
    fichier: 'poste-10.jpg',
    portrait: 'ia',
    intitule: { fr: 'Chargé des adhésions et de la vie associative', en: 'Membership and Community Officer' },
    mission: { fr: 'Accueille les demandes d’adhésion et accompagne la vie associative.', en: 'Handles membership applications and supports the association’s community life.' },
  },
]
```

Run: `npx vitest run tests/unit/seed-organigramme.test.ts`

Expected: PASS.

- [ ] **Step 4 : Déplacer `upsertMedia`**

Créer `src/seed/media.ts` avec le type et la fonction **déplacés tels quels** depuis `src/seed/index.ts` :

```ts
import fs from 'node:fs'
import path from 'node:path'
import type { Payload } from 'payload'
import { isSeedMediaFilename } from './media-match'
import { SEED_CONTEXT } from './upsert'

export type MediaSeed = {
  /** Clé du nom de fichier téléversé (« banner », « kafele-nianame-1-photo ») : sert à retrouver les variantes renommées par Payload. */
  key: string
  filePath: string
  data: Record<string, unknown>
  altFr: string
  altEn: string
  lieu?: { fr: string; en: string }
}

export async function upsertMedia(payload: Payload, m: MediaSeed): Promise<number | string> {
  const ext = path.extname(m.filePath)
  // Le fichier est téléversé sous « <clé><ext> » : une clé terminée par « -N » serait renumérotée par Payload (photo-1 → photo-7).
  const upload = { data: fs.readFileSync(m.filePath), name: `${m.key}${ext}`, mimetype: 'image/jpeg', size: fs.statSync(m.filePath).size }
  // Payload renomme en « banner-1.jpg » si le fichier existe déjà dans media/ : on retrouve ces variantes, et elles seules.
  const candidates = await payload.find({
    collection: 'medias',
    where: { filename: { like: m.key } },
    sort: 'id',
    limit: 50,
    depth: 0,
  })
  const found = candidates.docs.filter((d) => isSeedMediaFilename(d.filename, m.key, ext))
  const base = { ...m.data, ...(m.lieu ? { lieu: m.lieu.fr } : {}) }
  const doc =
    found[0] ??
    (await payload.create({
      collection: 'medias',
      data: { ...base, alt: m.altFr } as never,
      file: upload,
      locale: 'fr',
      context: SEED_CONTEXT,
    }))
  await payload.update({ collection: 'medias', id: doc.id, data: { ...base, alt: m.altFr } as never, locale: 'fr', context: SEED_CONTEXT })
  await payload.update({
    collection: 'medias',
    id: doc.id,
    data: { alt: m.altEn, ...(m.lieu ? { lieu: m.lieu.en } : {}) } as never,
    locale: 'en',
    context: SEED_CONTEXT,
  })
  return doc.id
}
```

Dans `src/seed/index.ts` :
- supprimer le type `MediaSeed` et la fonction `upsertMedia` ;
- ajouter `import { upsertMedia } from './media'` ;
- retirer les imports devenus inutiles (`isSeedMediaFilename` ; `fs` s'il n'est plus utilisé). `npm run lint` et `tsc` le signalent.

- [ ] **Step 5 : Seed de l'organigramme**

`src/seed/organigramme.ts` :

```ts
import path from 'node:path'
import type { Payload } from 'payload'
import { PORTRAITS, POSTES } from './data/organigramme'
import { upsertMedia } from './media'
import { SEED_CONTEXT } from './upsert'

/**
 * Crée les postes de départ en brouillon, parents d’abord. Un poste déjà présent (même `cle`) n’est jamais réécrit :
 * le seed n’écrase pas une saisie réelle de l’admin. Les portraits (médias) sont mis à jour comme les autres médias du seed.
 */
export async function seedOrganigramme(payload: Payload, dossierSeed: string): Promise<void> {
  const ids = new Map<string, number | string>()
  for (const poste of POSTES) {
    const portrait = PORTRAITS[poste.portrait]
    const photo = await upsertMedia(payload, {
      // « organigramme-N-photo.jpg » : une clé finissant par « -N » serait renumérotée par Payload.
      key: `organigramme-${Number(poste.cle.slice(-2))}-photo`,
      filePath: path.join(dossierSeed, 'images', 'organigramme', poste.fichier),
      data: {
        credit: portrait.credit,
        provisoire: portrait.provisoire,
        galerie: false,
        droitsConfirmes: portrait.droitsConfirmes,
        ...(portrait.source ? { source: portrait.source } : {}),
      },
      altFr: portrait.alt.fr,
      altEn: portrait.alt.en,
    })

    const existant = await payload.find({ collection: 'postes', where: { cle: { equals: poste.cle } }, draft: true, limit: 1, depth: 0 })
    if (existant.docs[0]) {
      ids.set(poste.cle, existant.docs[0].id)
      continue
    }
    const doc = await payload.create({
      collection: 'postes',
      locale: 'fr',
      draft: true,
      context: SEED_CONTEXT,
      data: {
        cle: poste.cle,
        intitule: poste.intitule.fr,
        mission: poste.mission.fr,
        parent: poste.parent ? (ids.get(poste.parent) as number) : null,
        ordre: poste.ordre,
        personneNom: poste.nom,
        personnePhoto: photo as number,
        _status: 'draft',
      },
    })
    await payload.update({
      collection: 'postes',
      id: doc.id,
      locale: 'en',
      draft: true,
      context: SEED_CONTEXT,
      data: { intitule: poste.intitule.en, mission: poste.mission.en },
    })
    ids.set(poste.cle, doc.id)
  }
}
```

Dans `src/seed/index.ts`, fonction `seed()` :
- ajouter `import { seedOrganigramme } from './organigramme'` ;
- après la boucle des projets, appeler `await seedOrganigramme(payload, dirname)` ;
- étendre le compte final :

```ts
  const count = async (collection: 'pages' | 'albums' | 'actualites' | 'projets' | 'medias' | 'postes') => (await payload.count({ collection })).totalDocs
  console.log(`Seed terminé : pages=${await count('pages')} albums=${await count('albums')} actualites=${await count('actualites')} projets=${await count('projets')} postes=${await count('postes')} medias=${await count('medias')}`)
```

- [ ] **Step 6 : Test e2e**

`tests/e2e/organigramme-seed.spec.ts` :

```ts
import { expect, test } from '@playwright/test'
import { adminToken, loginAdmin } from './admin-helpers'

const CLES = Array.from({ length: 10 }, (_, i) => `poste-${String(i + 1).padStart(2, '0')}`)

test.describe('organigramme : contenu de départ', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  test('les 10 postes du seed existent en brouillon et restent invisibles du public', async ({ request }) => {
    const headers = { Authorization: `JWT ${await adminToken(request)}` }
    const res = await request.get(`/api/postes?draft=true&depth=0&locale=fr&limit=50&where[cle][in]=${CLES.join(',')}`, { headers })
    expect(res.ok(), await res.text()).toBe(true)
    const docs = (await res.json()).docs as { cle: string; _status: string }[]
    expect(docs.map((d) => d.cle).sort()).toEqual(CLES)
    expect(docs.every((d) => d._status === 'draft')).toBe(true)
    const publics = (await (await request.get('/api/postes?limit=100&depth=0')).json()).docs as { cle?: string }[]
    expect(publics.some((d) => CLES.includes(d.cle ?? ''))).toBe(false)
  })

  test('aperçu : la Présidente, son intitulé et son portrait', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/api/apercu?path=/fr/organisation&secret=e2e-apercu')
    await expect(page.getByRole('status').getByText('Aperçu — non publié')).toBeVisible()
    const arbre = page.locator('[data-vue="arbre"]')
    await expect(arbre.getByText('Laurence Ndong')).toBeVisible()
    await expect(arbre.getByText('Présidente', { exact: true })).toBeVisible()
    await expect(page.locator('[data-vue="liste"] img[alt="Portrait de la Présidente"]')).toHaveCount(1)
    await page.getByRole('link', { name: 'Quitter l’aperçu' }).click()
  })
})
```

Run: `npm run test:e2e -- tests/e2e/organigramme-seed.spec.ts tests/e2e/organigramme.spec.ts --project=desktop`

Expected : PASS. Le globalSetup lance `npm run seed` sur la base e2e, qui crée les 10 postes au premier run et n'y touche plus ensuite.

- [ ] **Step 7 : README**

Dans `README.md`, section « Administration », ajouter :

```markdown
- **Organigramme** (*Contenus > Organigramme*) : un poste a un intitulé et une mission (FR et EN), un rattachement (« Rattaché à », vide pour le sommet), un ordre parmi les postes de même niveau, et éventuellement un titulaire (nom, portrait, courte biographie).
  - Les postes suivent le circuit brouillon et publication. « Aperçu » montre la page Organisation avec les brouillons.
  - Un rattachement à soi-même, à un de ses subordonnés ou à un poste supprimé est refusé.
  - Un poste qui a des postes rattachés ne peut pas être supprimé : rattacher d'abord ses postes ailleurs.
  - Sans poste publié, la page affiche « Organigramme en cours de validation ».
  - **Contenu de départ :** le seed crée 10 postes **en brouillon**. Seule la Présidente (Laurence Ndong) est réelle. Les postes 2 à 10 portent des noms et des portraits **fictifs**, générés par IA et marqués « provisoire ». Ils sont à remplacer ou à supprimer avant toute publication. Relancer le seed ne réécrit jamais un poste existant.
```

Dans la puce « Seed » existante, ajouter « (l'organigramme fait exception : ses postes existants ne sont jamais réécrits) » après « réglages ».

- [ ] **Step 8 : Vérifier, deux fois de suite**

Run: `npx tsc --noEmit; npm test; npm run lint; npm run build`

Expected : 0 erreur, et le build réussit.

Run: `npm run test:e2e`, puis une seconde fois `npm run test:e2e`

Expected : les deux exécutions passent entièrement, sans test instable (critère §5.13). La seconde exécution vérifie aussi l'idempotence du seed et le nettoyage des données e2e.

Puis appliquer le contenu à la base de dev (5433, déjà lancée) :

```bash
npm run seed
```

Expected : `Seed terminé : … postes=10 …`. Sur http://localhost:3000/fr/organisation, la page affiche « Organigramme en cours de validation. » ; l'aperçu de l'admin montre les 10 postes. Signaler dans le rapport que ce seed réinitialise les modifications faites dans l'admin sur les contenus seedés (sauf les postes existants).

- [ ] **Step 9 : Commit**

```bash
git add src/seed/images/organigramme src/seed/media.ts src/seed/data/organigramme.ts src/seed/organigramme.ts src/seed/index.ts tests/unit/seed-organigramme.test.ts tests/e2e/organigramme-seed.spec.ts README.md
git commit -F - <<'EOF'
feat: contenu de départ de l’organigramme (10 postes en brouillon, portraits provisoires)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Self-Review

### 1. Couverture de la spec

| Spec | Tâche |
|---|---|
| §1 Périmètre (vitrine, un seul compte, hors périmètre respecté : ni CAPTCHA tiers ni accusé au visiteur) | 1 à 9 (Global Constraints) |
| §2.1 Champs d'adhésion (longueurs, noms non latins, téléphone normalisé, pays traduits, intérêts, compteur, notice versionnée, locale automatique) | 3 (validation), 5 (formulaire) |
| §2.1 Champs de contact | 3, 4 |
| §2.2.1 Pot de miel, limite 5 envois par IP et par 10 min, validation serveur avec erreurs par champ | 3 |
| §2.2.2 Idempotence par clé UUID | 3 (serveur), 4 (clé côté client, réutilisée après une erreur réseau) |
| §2.2.3 Enregistrement d'abord, succès seulement si enregistré | 3 |
| §2.2.4 E-mail ensuite, états `envoye` / `echec` / `non_configure`, échec sans annulation | 3 |
| §2.2.5 Référence `ADH-` / `CT-` non devinable, aucun accusé, aucun texte annonçant un e-mail | 3, 4, 5 |
| §2.2.6 États client (saisie, erreur de champ, envoi, succès, erreur réseau), bouton désactivé, champs conservés | 4, 5 |
| §2.3 Nodemailer en SMTP par `.env`, documenté, absent → non configuré ; `emailAdhesions` / `emailContact` ; faux transport e2e | 2, 3 |
| §2.4 Collection `messages` : champs, accès, lecture seule | 2 |
| §2.4 « Renvoyer l'e-mail », colonnes, non traités d'abord | 2 (colonnes, tri), 6 (bouton) |
| §2.4 Carte KPI « Messages non traités » | 6 |
| §2.5 Bandeau retiré, mention de traitement des données, notice FR/EN `2026-10-07`, dictionnaires FR et EN | 4, 5 |
| §3.1 Collection `postes` (champs, brouillons, lecture publique, validation des cycles, blocage de suppression, revalidation, aperçu) | 7 |
| §3.2 Page `/organisation` (arbre CSS, liste accessible, alt traduit, état vide, sections conservées, liens inchangés) | 8 |
| §3.3 Seed des 10 postes en brouillon, portraits, idempotence par `cle` | 9 |
| §4 Compte admin unique, dernier compte non supprimable, mot de passe oublié documenté | 1 (et 2 pour le SMTP) |
| §5 Critères 1 à 13 | 1 → 3, 4, 5 ; 2 → 3 ; 3 → 3, 4 ; 4 → 3 ; 5 → 3, 4, 5 ; 6 → 2 ; 7 → 8 ; 8 → 7, 8 ; 9 → 7 ; 10 → 8, 9 ; 11 → 1 ; 12 → 6 ; 13 → 9 (deux exécutions complètes) |
| §6 Migrations (`messages`, `reglages_emails`, `postes`), up/down/up sur une base jetable, pas de `migrate:reset` | 2, 7 |

Aucun écart restant. Les précisions apportées à la spec sont listées en tête du plan (« Décisions prises dans ce plan »).

### 2. Recherche de placeholders

Le plan ne contient ni « TBD », ni « TODO », ni « à compléter », ni « similaire à la tâche N ». Chaque étape de code montre le code complet.

Les seules consignes d'adaptation sont des replis explicites, chacun avec sa solution écrite :
- route interceptée par Payload (tâche 3) ;
- mise à jour partielle du global refusée (tâche 3) ;
- token `--color-error` absent (tâche 4) ;
- version ICU (tâche 3) ;
- libellé de colonne de Payload (tâche 6).

### 3. Cohérence des noms et des types

| Nom | Défini | Utilisé |
|---|---|---|
| `creationCompte`, `suppressionCompte` | 1 | 1 |
| `emailAdapter`, `transportConfigure`, `adaptateurCapture`, `lireExpediteur` | 2 | 2, 3 (`transportConfigure`) |
| `EMAIL_CAPTURE_DIR`, `emailsCaptures` | 2 | 3, 6 |
| `Message` (`emailEtat: 'envoye' \| 'echec' \| 'non_configure'`) | 2 | 3, 6 |
| `validerAdhesion`, `validerContact`, `nouvelleCle`, `LIMITES`, `INTERETS`, `CLE_IDEMPOTENCE`, `longueur`, `ChampAdhesion`, `ChampContact`, `Resultat`, `Erreurs`, `ReponseFormulaire` | 3 | 4, 5 |
| `optionsPays`, `nomPays`, `estCodePays` | 3 | 3, 5 |
| `lignesLisibles` | 3 | 3 (`email.ts`), 6 (`DonneesLisibles`) |
| `notifierMessage(payload, message)`, `EtatEmail` | 3 | 3, 6 (`renvoi.ts`) |
| `envoyerFormulaire`, `ipAleatoire`, `lireMessage`, `purgerMessages`, `MessageApi` | 3 | 4, 5, 6 |
| `useEnvoiFormulaire`, `ChampErreur`, `SuccesEnvoi`, `texteErreur`, dictionnaire `formulaires.*` | 4 | 4, 5 |
| préfixes e2e `e2e-api-`, `e2e-mail-`, `e2e-form-ct-`, `e2e-form-adh-`, `e2e-kpi-`, `e2e-postes-`, `e2e-org-` | 3 à 8 | un seul `describe` sérialisé chacun |
| `messageCounts`, `loadKpis(...).messages` | 6 | 6 |
| `idDe`, `verifierRattachement`, `MESSAGES_RATTACHEMENT`, `MESSAGE_SUPPRESSION`, `PUBLISHED_POSTE`, `INTITULE_RENSEIGNE` | 7 | 7, 8 |
| `creerPoste`, `purgerPostes`, `Entetes` | 7 | 7, 8 |
| `construireArbre`, `PosteNoeud`, `getPostes(locale, draft)`, dictionnaire `organigramme.*` | 8 | 8, 9 |
| `upsertMedia`, `MediaSeed` | 9 (déplacés) | 9 |
| `POSTES`, `PORTRAITS`, `seedOrganigramme` | 9 | 9 |
