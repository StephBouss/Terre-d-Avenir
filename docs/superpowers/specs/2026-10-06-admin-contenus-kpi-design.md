# Espace admin : tableau de bord KPI, actualités, images du Hero et médiathèque

- **Date :** 2026-10-06
- **Statut :** validé par l’utilisateur le 2026-10-06
- **Sources :** PRD v1.3 (BO-02, BO-08 à BO-11, dictionnaire des KPI), spec du lot 1 (`2026-10-05-lot1-socle-site-public-design.md`), code du lot 1 fusionné dans `main` (8d1b172, b94760b)

## 1. Objectif

Donner à l'ONG un espace d'administration utilisable au quotidien, sans back-office séparé :
- un tableau de bord d'indicateurs (KPI) évolutif ;
- un vrai circuit de publication des actualités ;
- la gestion des images du Hero : le diaporama d'accueil et l'image d'en-tête de chaque page ;
- la gestion des photos de la médiathèque.

L'admin reste celle de Payload (`/admin`), enrichie. Les règles transverses du lot 1 restent en vigueur :
- les Textes v1.3 dictent le fond ;
- aucune information n'est inventée ;
- un brouillon `[…]` est masqué ;
- aucune donnée personnelle n'est collectée.

## 2. Hors périmètre

- La publication programmée.
- Les vidéos : la médiathèque reste limitée aux photos tant que l'hébergement n'est pas choisi.
- Les rôles différenciés (présidence, éditeur, etc.) : prévus au lot 5. Au lot actuel, tout utilisateur connecté est administrateur.
- La gestion des demandes d'adhésion (lot 2) et des transactions (lot 4). Leurs KPI sont seulement réservés sur le tableau de bord.
- Un back-office sur mesure aux couleurs de la charte.

## 3. Architecture de l'admin

- **Langue :** l'interface de Payload passe en français, via `i18n` avec `@payloadcms/translations/languages/fr` comme seule langue proposée.
- **Menu regroupé** (`admin.group`) :

  | Groupe | Entrées |
  |---|---|
  | Contenus | Actualités, Pages, Projets |
  | Images | Médiathèque (collection `medias`), Diaporama d'accueil (global `diaporama`) |
  | Site | Réglages |
  | Administration | Utilisateurs |

- **Tableau de bord :** un Server Component enregistré via `admin.components.beforeDashboard`, affiché au-dessus des raccourcis de Payload. Il lit les données par l'API locale de Payload, côté serveur.
- **Code des indicateurs :** dans `src/lib/kpi/`. Les fonctions de calcul sont pures : elles prennent des listes de documents et renvoient des valeurs. Elles sont séparées de la lecture en base et de l'affichage (`src/components/admin/`).

## 4. Actualités : brouillon, publication, archives

### 4.1 Modèle

- La collection `actualites` active les versions et brouillons natifs de Payload : `versions: { drafts: true, maxPerDoc: 50 }`. L'état est porté par le champ système `_status`, qui vaut `draft` ou `published`.
- Le champ booléen `publie` est **supprimé**. La migration convertit les données :
  - `publie = true` donne `_status = 'published'` ;
  - `publie = false` donne `_status = 'draft'`.
- Nouveau champ `archivee` (« Archivée », case à cocher, `false` par défaut, non localisé). Sa description dans l'admin : « Retire l'actualité du site sans la supprimer. »

### 4.2 Règles de visibilité

- Une actualité est **visible publiquement** si `_status = 'published'` **et** `archivee != true`.
- **Accès en lecture :**
  - un utilisateur connecté lit tout ;
  - un visiteur ne lit que ce qui est publié et non archivé, sous forme d'une requête `where`. Cela s'applique aussi à l'API REST et à GraphQL.
- **Lectures du site (`src/lib/content.ts`) :** elles filtrent explicitement sur publié et non archivé, car l'API locale contourne les règles d'accès. Le filtre est porté par une seule fonction partagée, utilisée par :
  - la liste des actualités ;
  - le détail d'une actualité ;
  - les 3 dernières actualités de l'accueil ;
  - les autres actualités sous un article ;
  - le plan du site.
- La revalidation existante (`afterChange`, `afterDelete`) reste en place. Publier, dépublier ou archiver revalide le site.

### 4.3 Aperçu

- `admin.preview` génère une URL vers une route `/api/apercu`, qui reçoit :
  - le chemin de l'actualité ;
  - la langue ;
  - un jeton secret, `PREVIEW_SECRET`, une nouvelle variable d'environnement documentée dans `.env.example` et le README.
- La route vérifie le jeton **et** la présence d'un utilisateur Payload connecté. Elle active ensuite le `draftMode` de Next et redirige vers la page.
- En `draftMode`, la page de détail lit la dernière version (`draft: true`), y compris un brouillon ou une actualité archivée. Un bandeau « Aperçu — non publié » s'affiche, avec un lien pour quitter l'aperçu (`/api/apercu/fin`).
- Hors `draftMode`, rien ne change. L'aperçu n'est jamais mis en cache public.

### 4.4 Liste dans l'admin

- **Colonnes par défaut :** titre, état (`_status`), archivée, date affichée, modifiée le.
- **Filtres :** par état et par archivée.
- **Recherche :** titre, résumé.
- Les traductions anglaises manquantes sont signalées par la carte « Traductions à revoir » du tableau de bord (§7.2), qui mène à la liste concernée. La liste des actualités n'a pas de colonne dédiée.

## 5. Images du Hero

### 5.1 Diaporama d'accueil

- **Nouveau global `diaporama`** (« Diaporama d'accueil », groupe Images). Son champ `images` est un upload `medias` à valeurs multiples, ordonné et réordonnable par glisser-déposer, avec au moins une image. Sa description, conforme au `HeroSlider` actuel : « Les 3 premières images défilent en fond du Hero ; l'ensemble des images alimente aussi le collage de droite. » Dans le code, les diapositives utilisent `images[0..2]` et le collage l'index `(3 + b*3 + p) % longueur`.
- La migration copie `reglages.heroImages` dans `diaporama.images`, puis supprime `heroImages` de `reglages`.
- La revalidation passe par `revalidateGlobal`.
- **Accès :**
  - lecture réservée aux utilisateurs connectés, comme `reglages` ;
  - le site lit le global par l'API locale.

### 5.2 Image d'en-tête de chaque page

- **Nouveau champ `heroImage`** dans la collection `pages`, libellé « Image d'en-tête ». C'est un upload `medias` non localisé et facultatif.
- **Migration et seed :** ils préremplissent `heroImage` avec l'image que chaque page affiche aujourd'hui, c'est-à-dire l'index qu'elle utilise actuellement dans `reglages.heroImages`. La table de correspondance page → index est relevée dans le code des pages avant la migration.
- **Pages et composants de Hero :** ils lisent `page.heroImage` et plus aucun index du diaporama. Si le champ est vide, `MediaImage` affiche son fond de couleur de la charte, comme le prévoit déjà la spec du lot 1 (§7).
- **Exception de la page d'accueil :** son Hero reste le diaporama.

## 6. Médiathèque (photos)

### 6.1 Nouveaux champs de `medias`

Ces champs correspondent au BO-11 du PRD. Ils sont facultatifs sauf mention contraire.

| Champ | Libellé | Type | Localisé |
|---|---|---|---|
| `ordre` | Ordre d'affichage dans la médiathèque | nombre, défaut 0 | non |
| `source` | Source | texte | non |
| `lieu` | Lieu (si documenté) | texte | oui |
| `datePrise` | Date de prise de vue (si documentée) | date | non |
| `droitsConfirmes` | Droits de diffusion confirmés | case à cocher, défaut `false` | non |
| `droitsNote` | Précisions sur les droits | zone de texte | non |

Les champs existants restent inchangés : `alt` et `caption` (localisés), `credit`, `galerie` et `provisoire`.

La description de `droitsConfirmes` reprend le PRD : « Renseigne le dossier ; ne remplace pas une preuve de droits. »

### 6.2 Admin

- **Colonnes :** miniature, nom de fichier, « en médiathèque », provisoire, droits confirmés, ordre.
- **Recherche :** nom de fichier, texte alternatif, légende, crédit.
- **Filtres :** en médiathèque, provisoire, droits confirmés. « Sans texte alternatif » passe par un lien du tableau de bord vers la liste filtrée sur `alt` vide.
- **Taille maximale :** 20 Mo par fichier (`upload.limits.fileSize`). Les types acceptés restent JPEG, PNG, WebP et AVIF.

### 6.3 Site

- La médiathèque publique trie les photos par `ordre`, puis par date de création.
- Les règles d'affichage du lot 1 ne changent pas :
  - texte alternatif réel ;
  - décoratif si la photo est provisoire ;
  - légende masquée si c'est un brouillon.

## 7. Tableau de bord des indicateurs

### 7.1 Principes (PRD §« Dictionnaire des KPIs »)

- **Données :** chaque valeur est calculée sur les vraies données au moment de l'affichage.
- **Date :** elle est affichée en `Africa/Libreville`, sous la forme « Situation au … ».
- **Trois états distincts :**
  - **zéro réel** : la source est disponible et vide ;
  - **non calculable** : par exemple un dénominateur nul ;
  - **aucune source configurée**.
- **Aucun chiffre, aucune tendance ni aucun pourcentage fictifs.**
- **Navigation :** chaque carte calculée est un lien vers la liste de l'admin filtrée correspondante.

### 7.2 Cartes

| Carte | Valeurs | Lien |
|---|---|---|
| Actualités (KPI-18) | publiées et visibles, brouillons, archivées | liste des actualités filtrée par état ou archivée |
| Pages et projets (KPI-18) | nombre de pages, nombre de projets | listes correspondantes |
| Traductions à revoir (KPI-18) | actualités, pages et projets dont le titre (ou H1) anglais est vide | liste filtrée |
| Photos | total ; dans la médiathèque | liste des médias, filtrée sur la médiathèque |
| Alertes photos | provisoires à remplacer ; sans texte alternatif ; droits non confirmés | listes filtrées |
| Adhésions (KPI-01 à KPI-10) | « Aucune source configurée — disponible au lot 2 » | — |
| Transactions (KPI-11 à KPI-17) | « Aucune source configurée — disponible au lot 4 » | — |
| Chargements en erreur (KPI-19) | « Aucune source configurée » | — |
| Sauvegardes (KPI-20) | « Aucune sauvegarde configurée » | — |

Pour la carte « Traductions à revoir », le texte anglais d'un document se lit avec `locale: 'en'` et `fallbackLocale: false`. Un titre vide ou contenant un brouillon `[…]` compte comme manquant.

Les cartes sans source sont grisées et ne sont pas des liens.

### 7.3 Accès

Le tableau de bord n'est rendu que dans l'admin, pour un utilisateur connecté. Il ne lit aucune donnée personnelle.

## 8. Migration et seed

- Une seule migration Payload est générée par `npm run migrate:create` (`push: false`). Elle couvre :
  - les versions d'`actualites`, avec les tables de versions ;
  - le passage de `publie` à `_status` ;
  - `archivee` ;
  - le global `diaporama` et la reprise de `heroImages` ;
  - `pages.heroImage`, prérempli ;
  - les nouveaux champs de `medias`.
- Les étapes de reprise de données sont écrites dans la migration elle-même : conversion de l'état, copie du diaporama, remplissage de `heroImage`. Elles sont testées en e2e sur une base neuve.
- **Seed :**
  - les actualités sont publiées par `_status: 'published'` ;
  - le diaporama passe par le global `diaporama` ;
  - chaque page reçoit son `heroImage` ;
  - le seed reste idempotent.

## 9. Gestion des erreurs

| Situation | Comportement |
|---|---|
| Diaporama vide | Le Hero de l'accueil affiche son fond de charte. Il n'y a pas d'erreur, et le minimum de 1 image empêche ce cas depuis l'admin. |
| `heroImage` d'une page vide ou média supprimé | Fond de couleur de la charte |
| Lien d'aperçu avec un jeton invalide ou sans utilisateur connecté | Réponse 401, sans activer le `draftMode` |
| Erreur de lecture pendant le calcul d'une carte | La carte affiche « Indisponible » ; les autres cartes s'affichent normalement |
| Actualité archivée appelée par son URL publique | 404 |

## 10. Tests

### 10.1 Unitaires (Vitest)

- Fonctions de calcul des KPI :
  - comptages par état ;
  - traductions manquantes ;
  - alertes photos ;
  - cas vide (zéro réel) ;
  - carte sans source.
- Règles d'accès de lecture d'`actualites` : visiteur contre utilisateur connecté, publié, brouillon et archivé.
- Filtre partagé « actualité visible ».
- Route d'aperçu : refus si le jeton est invalide ou si l'utilisateur est absent.

### 10.2 Bout en bout (Playwright, base e2e dédiée)

- Visibilité des actualités :
  - une actualité en brouillon est absente de la liste, de l'accueil, du plan du site et de l'API publique ;
  - une actualité archivée est absente partout, et son URL renvoie 404.
- L'image d'en-tête d'une page vient de son champ `heroImage`.
- La médiathèque respecte l'ordre d'affichage.
- Admin, avec le compte créé par le seed (`SEED_ADMIN_*` défini pour l'e2e) :
  - le tableau de bord s'affiche une fois connecté ;
  - les cartes adhésions et transactions indiquent « Aucune source configurée » ;
  - l'admin est en français.
- Les tests existants du lot 1 restent verts : accessibilité, sans JS, formulaires, SEO.

## 11. Critères d'acceptation

1. L'admin est en français et son menu est regroupé selon le §3.
2. « Enregistrer le brouillon » ne publie jamais. « Publier » met en ligne et revalide le site.
3. Une actualité archivée disparaît du site, de l'accueil, du plan du site et de l'API publique sans être supprimée.
4. L'aperçu affiche un brouillon à un admin connecté, et à personne d'autre.
5. Le diaporama d'accueil se gère depuis son écran dédié. Le réordonner ne change aucune autre page.
6. Chaque page a sa propre image d'en-tête, modifiable dans l'admin.
7. Les photos de la médiathèque ont leurs champs de droits, de source et d'ordre, et le site respecte l'ordre.
8. Le tableau de bord n'affiche que des valeurs réelles ou « Aucune source configurée ». Chaque carte calculée mène à la liste filtrée correspondante.
9. Tous les tests (unitaires et e2e) passent.
