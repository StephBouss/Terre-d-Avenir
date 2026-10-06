# Terre d'Avenir (Komo Kango)

Site public multilingue de Terre d'Avenir (lot 1 : socle du site public), construit avec Next.js, Payload CMS et PostgreSQL.

- Spécification : [docs/superpowers/specs/2026-10-05-lot1-socle-site-public-design.md](docs/superpowers/specs/2026-10-05-lot1-socle-site-public-design.md)
- Plan : [docs/superpowers/plans/2026-10-05-lot1-socle-site-public.md](docs/superpowers/plans/2026-10-05-lot1-socle-site-public.md)

## Prérequis

- Node.js 22 LTS ou plus récent
- npm

## Démarrage en développement

Aucun Docker n'est nécessaire : PostgreSQL tourne en local via un paquet embarqué.

1. `npm install`
2. `copy .env.example .env` (PowerShell ; `cp` sous Linux/macOS), puis remplacer `PAYLOAD_SECRET` par une chaîne aléatoire, par exemple :
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. `npm run db` dans un terminal séparé (PostgreSQL sur le port 5433, base `terredavenir`, utilisateur et mot de passe `postgres`, données dans `.data/postgres`)
4. `npm run migrate`
5. `npm run seed`
6. `npm run dev`, puis ouvrir `http://localhost:3000` et `http://localhost:3000/admin`

> **Attention :** relancer `npm run seed` réinitialise le contenu seedé et écrase les modifications faites dans l'administration.

## Scripts

| Script | Rôle |
|---|---|
| `npm run db` | Démarre PostgreSQL de développement (port 5433, données dans `.data/postgres`) |
| `npm run dev` | Serveur de développement Next.js |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production (après `build`) |
| `npm run payload` | CLI Payload (les arguments suivent `--`) |
| `npm run migrate` | Applique les migrations de base de données |
| `npm run migrate:create` | Crée une migration après un changement de schéma |
| `npm run seed` | Charge le contenu initial (voir l'avertissement ci-dessus) |
| `npm run generate:types` | Régénère `src/payload-types.ts` |
| `npm run generate:importmap` | Régénère l'import map de l'administration |
| `npm run lint` | Vérification ESLint |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Build, puis tests de bout en bout (Playwright) |

## Contenus

Tout se modifie dans `/admin`. Un champ vide ou contenant `[...]` est masqué sur le site. Les images marquées « provisoire » sont à remplacer.

Au lot 1, les formulaires (adhésion, contact) sont affichés mais désactivés : aucune donnée personnelle n'est collectée.

## Langues

Le français et l'anglais sont actifs. Pour ajouter une langue, l'ajouter à `LOCALES` (`src/lib/i18n/config.ts`), créer son dictionnaire, puis lancer `npm run migrate:create` et `npm run migrate`.

## Tests

- `npm test` : tests unitaires
- `npm run test:e2e` : tests de bout en bout

## Production

Déploiement avec Docker Compose (PostgreSQL 18 et application sur le port 3000). Variables à définir, dans un fichier `.env` à côté de `docker-compose.yml` ou dans l'environnement :

- `POSTGRES_PASSWORD` (obligatoire)
- `PAYLOAD_SECRET` (obligatoire)
- `NEXT_PUBLIC_SITE_URL` (URL publique du site ; `http://localhost:3000` par défaut)
- `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` (compte administrateur créé par le seed)

Premier déploiement :

```
docker compose up -d --build
docker compose exec app npm run seed
```

Les migrations sont appliquées automatiquement au démarrage de l'application. Les médias téléversés sont conservés dans le volume `media`.

## Référence

Le prototype de maquette est le commit `72dc396` et le dossier `.banani-export/`.
