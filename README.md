# Terre d'Avenir (Komo Kango)

Site public multilingue de Terre d'Avenir (lot 1 : socle du site public), construit avec Next.js, Payload CMS et PostgreSQL.

- Spécification : [docs/superpowers/specs/2026-10-05-lot1-socle-site-public-design.md](docs/superpowers/specs/2026-10-05-lot1-socle-site-public-design.md)
- Plan : [docs/superpowers/plans/2026-10-05-lot1-socle-site-public.md](docs/superpowers/plans/2026-10-05-lot1-socle-site-public.md)

## Prérequis

- Node.js 22 LTS (20.9 minimum, version exigée par `engines`) ou plus récent
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

## Administration

- **Admin :** `/admin`, en français.
- **Compte unique :** l'administration n'a qu'un seul compte. Il est créé par le seed (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) ou par la page « premier utilisateur ». Aucun autre compte ne peut être créé, et le dernier compte ne peut pas être supprimé. Pour changer d'adresse ou de mot de passe, modifier ce compte dans *Administration > Utilisateurs*.
- **Mot de passe oublié :** le lien de la page de connexion envoie un e-mail de réinitialisation **uniquement si le SMTP est configuré** (voir « Envoi des e-mails »). Sans SMTP, la page reste accessible mais aucun e-mail ne part.
- **Actualités :** « Enregistrer le brouillon » ne publie pas ; « Publier » met en ligne. « Archivée » retire l'actualité du site sans la supprimer. « Aperçu » montre un brouillon aux admins connectés et nécessite `PREVIEW_SECRET`.
- **Images :** *Diaporama d'accueil* pour le Hero de l'accueil ; « Image d'en-tête » dans chaque page ; *Médiathèque* : cocher « Afficher dans la médiathèque » et régler l'ordre.
- **Indicateurs :** page d'accueil de l'admin, avec des valeurs réelles uniquement (« Indisponible » en cas d'erreur de lecture). Les cartes adhésions et transactions s'activeront avec les lots 2 et 4.
  Les compteurs reflètent l'état publié, c'est-à-dire ce que voit le visiteur (une actualité archivée n'est jamais comptée comme publiée). Le lien « Sans texte alternatif » liste les photos non provisoires dont le texte est absent ou vide ; le compte inclut aussi les textes blancs ou contenant `[...]`, qu'un filtre d'URL ne peut pas isoler (rappelé en infobulle sur la carte).
- **Base de données :** ne pas utiliser `npm run payload -- migrate:reset` : bug de Payload 3.90, qui lance d'abord le `down` de la migration initiale et échoue. En développement, utiliser `migrate:down` (retour arrière d'un lot) ou `migrate:fresh` (base reconstruite).
- **Seed :** `npm run seed` écrase les modifications faites dans l'admin sur les contenus qu'il fournit (actualités, albums, pages, réglages). Ne pas le relancer sur une base dont le contenu a été édité à la main.

## Envoi des e-mails

Les formulaires d'adhésion et de contact sont toujours enregistrés dans *Formulaires > Messages reçus*. Un e-mail de notification part en plus si deux conditions sont réunies :

1. **SMTP configuré** : `SMTP_HOST`, `SMTP_PORT` (587 par défaut ; 465 active TLS), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (« Nom <adresse> » ou une adresse seule), dans `.env` ou dans l'environnement Docker. Ne jamais commiter de valeur réelle. Le serveur SMTP doit proposer STARTTLS (port 587) ou TLS direct (port 465) : sans cela, la connexion est refusée et aucun identifiant ne circule en clair. `SMTP_INSECURE=1` désactive cette exigence ; il est réservé au développement local (Mailpit, port 1025). Si `SMTP_FROM` et `SMTP_USER` ne donnent aucune adresse valide, le SMTP est considéré comme non configuré.
2. **Adresse de réception** renseignée dans *Site > Réglages du site > Formulaires* (une adresse pour les adhésions, une pour le contact).

Sinon, l'état e-mail du message vaut « Non configuré » et le site fonctionne normalement. Le même SMTP sert au « mot de passe oublié » de l'admin.

En e2e, `EMAIL_CAPTURE_DIR` remplace le SMTP : les e-mails sont écrits en JSON dans `.data/e2e-emails`, rien n'est envoyé.

## Langues

Le français et l'anglais sont actifs. Pour ajouter une langue, l'ajouter à `LOCALES` (`src/lib/i18n/config.ts`), créer son dictionnaire, puis lancer `npm run migrate:create` et `npm run migrate`.

## Tests

- `npm test` : tests unitaires
- `npm run test:e2e` : tests de bout en bout (base dédiée sur le port 5434, `.data/postgres-e2e`, distincte de la base de développement)

## Production

Déploiement avec Docker Compose (PostgreSQL 18 et application sur le port 3000). Variables à définir, dans un fichier `.env` à côté de `docker-compose.yml` ou dans l'environnement :

- `POSTGRES_PASSWORD` (obligatoire). Il est inséré tel quel dans `DATABASE_URI` : n'utiliser que des caractères sans risque dans une URL (lettres et chiffres), ou l'encoder (`@` → `%40`, `:` → `%3A`, `/` → `%2F`, etc.)
- `PAYLOAD_SECRET` (obligatoire)
- `NEXT_PUBLIC_SITE_URL` (**obligatoire en production**, par exemple `https://exemple.org` : sans elle, les liens canoniques, le sitemap et les liens de partage pointent vers `http://localhost:3000`). Elle est intégrée au site lors de la construction : la modifier exige `docker compose up -d --build`
- `PREVIEW_SECRET` sécurise l'aperçu des brouillons. Il est obligatoire en production. Sans lui, le bouton Aperçu de l'admin est désactivé. L'aperçu exige que `NEXT_PUBLIC_SITE_URL` ait la même origine que l'admin : sinon le cookie de connexion est absent et l'aperçu renvoie 401
- `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` (compte administrateur créé par le seed)

Premier déploiement :

```
docker compose up -d --build
docker compose exec app npm run seed
```

> **Sécurité :** tant que le seed n'a pas créé le compte administrateur, la page `/admin/create-first-user` permet à n'importe qui de créer le premier administrateur. Lancer le seed (ou créer l'administrateur) immédiatement après le premier déploiement, avec `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` définis.

Les migrations sont appliquées automatiquement au démarrage de l'application. Les médias téléversés sont conservés dans le volume `media`.

## Référence

Le prototype de maquette est le commit `72dc396` et le dossier `.banani-export/`.
