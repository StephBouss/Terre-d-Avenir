# Lot 1 — Socle Next.js + Payload et site public FR/EN animé

- **Date :** 2026-10-05
- **Statut :** validé en brainstorming, en attente de relecture de la spec
- **Sources :** PRD v1.3, Textes v1.3, Brief Banani v1.3, Mini charte Banani v1.0 (dossier `../Source/`), maquette Banani exportée dans `.banani-export/`, prototype Codex (commit `72dc396`)

## 1. Objectif

Remplacer le prototype Vite/React produit par Codex par l'application cible **Next.js + Payload CMS + PostgreSQL** et livrer le site public complet du lot 1 en français et en anglais. Le rendu reste fidèle à la maquette Banani, avec une couche d'animations « vivantes mais sobres ».

Le lot 1 ne collecte **aucune donnée personnelle**. Les formulaires d'adhésion et de contact sont affichés, mais leur envoi est désactivé.

## 2. Hors périmètre

- L'adhésion de bout en bout, les écrans BO-01 et BO-03 à BO-05 (lot 2).
- L'envoi du formulaire de contact (traité plus tard, après décision sur le stockage et l'e-mail).
- Les écrans d'administration sur mesure BO-xx. Au lot 1, seul l'admin Payload standard est utilisé pour gérer les contenus.
- Les langues es, pt, ar et zh-Hans. L'architecture les prévoit, mais elles ne sont pas activées.
- Le choix et la configuration du VPS, et le déploiement en production.

## 3. Règles transverses

1. **La maquette dicte la forme :** couleurs, typographies, composants et mise en page viennent de Banani et du prototype Codex. Aucun nouveau style n'est inventé.
2. **Les Textes v1.3 dictent le fond.** En cas d'écart avec les textes de la maquette, ce sont les Textes v1.3 qui s'appliquent (ex. « Depuis février 2025 » remplace « Fondée en 2022 »).
3. **Pas d'information inventée.** Une information inconnue (mentions légales, organigramme, documents de transparence…) n'est pas affichée en ligne. Elle est signalée « à compléter » dans l'admin.
4. **Portabilité :** tout tourne via Docker Compose et une configuration en variables d'environnement, sans dépendance à un hébergeur particulier.

## 4. Architecture

### 4.1 Dépôt et migration

- Le dépôt git est initialisé dans `website/`. Le commit `72dc396` contient le prototype Codex et sert de référence.
- Le projet Vite est remplacé sur place par l'application Next.js. Le code Codex reste consultable dans l'historique git.
- `.banani-export/` est conservé et versionné comme référence de la maquette.
- Les composants Codex (`SiteHeader`, `SiteFooter`, `HeroSlider`, `SectionHeader`, `GoldDivider`, `ActionThemeCard`, `NewsCard`, `Icon`) sont portés en composants Next.js. Ce sont des Server Components par défaut, et passent en Client Components seulement quand l'interactivité l'exige.

### 4.2 Stack

| Élément | Choix |
|---|---|
| Framework | Next.js (dernière version majeure prise en charge par Payload 3), App Router, TypeScript |
| CMS | Payload 3, intégré à l'application Next.js |
| Base de données | PostgreSQL 16 (adaptateur `@payloadcms/db-postgres`) |
| Styles | Tailwind CSS v4, avec les tokens de la charte déjà définis dans le `@theme` de Codex |
| Police | DM Sans via `next/font` |
| Médias | Upload Payload sur disque local (volume Docker) |
| Conteneurs | `docker-compose.yml` avec les services `app` et `postgres`, plus `.env.example` |

### 4.3 Arborescence du code

```
src/
  app/
    (site)/[locale]/...     pages publiques
    (payload)/admin/...     admin Payload
  components/               composants portés + briques d'animation
  lib/i18n/                 langues, dictionnaire des libellés, helpers d'URL
  collections/              Actualites, Projets, Medias, Users
  globals/                  Pages (textes par page), Navigation, Reglages
  seed/                     script de seed (Textes v1.3 FR + traduction EN + médias)
  middleware.ts             redirection / → /fr/, langues inactives
payload.config.ts
```

### 4.4 Multilingue

- **Contenus :** la localisation native de Payload, avec les locales `fr` (par défaut) et `en`. Les champs textuels sont localisés.
- **Libellés de l'interface** (boutons, navigation, messages communs) : un dictionnaire léger par langue dans `lib/i18n`. Il s'appuie sur le « socle de libellés multilingues » des Textes v1.3.
- **Langues actives :** elles sont définies dans le global `Reglages` (`fr` et `en` au lot 1). Le sélecteur ne montre que celles-là, sous leur nom natif.
- **Routes :** `/{locale}/…`, avec les mêmes slugs dans toutes les langues. `/` redirige vers `/fr/`.
- **Langue inactive** (ex. `/es/…`) : message « Cette version linguistique n'est pas encore publiée » et liens vers les versions disponibles.
- **HTML :** `lang` et `dir` sont posés sur `<html>`, ce qui prépare l'arabe en lecture de droite à gauche, et les balises `hreflang` sont générées pour les langues actives.
- **Anglais :** la traduction EN de tous les textes est rédigée et publiée dès le lot 1.

### 4.5 Modèle de contenu Payload

| Type | Nom | Contenu principal |
|---|---|---|
| Collection | `actualites` | titre, slug, date, extrait, corps (rich text), image, source (libellé + URL), statut brouillon/publié |
| Collection | `projets` | titre, slug, thème, résumé, corps, image, source |
| Collection | `medias` | fichier, texte alternatif (localisé), légende (localisée), crédit, mention « provisoire » |
| Collection | `users` | comptes d'administration (auth Payload) |
| Global | `pages` | un groupe de champs localisés par page (accueil, ong, mot-presidente, organisation, adhesion, partenariats, transparence, contact, confidentialite, mentions-legales, 404) |
| Global | `navigation` | entrées de l'en-tête et liens du pied de page, textes du pied de page |
| Global | `reglages` | langues actives, lien Facebook, nom de l'organisation, copyright |

Un champ vide est masqué côté site. Dans l'admin, une description « à compléter » le signale.

### 4.6 Rendu et cache

- Les pages sont générées statiquement avec revalidation (ISR). Un hook `afterChange` de Payload déclenche `revalidatePath` sur les pages concernées.
- Si la base est injoignable, les pages déjà générées continuent d'être servies. Sinon, une page d'erreur sobre s'affiche.

### 4.7 Seed

`npm run seed` (npm, comme le prototype) remplit une base vide avec :
- les Textes v1.3 en français, dans les globals et les collections ;
- la traduction anglaise ;
- les 3 actualités de PAGE-05 et les 4 thèmes de PAGE-04 ;
- les images : `banner.jpg` et les logos de `../Source/`, plus les photos Unsplash du prototype importées comme médias marqués « provisoire » et remplaçables depuis l'admin ;
- un compte administrateur créé à partir des variables d'environnement.

Le seed est idempotent : il ne crée pas de doublons s'il est relancé.

## 5. Pages et routes

Toutes les routes sont préfixées par la langue (`fr`, `en`).

| Route | Source visuelle | Contenu |
|---|---|---|
| `/{l}/` | Accueil Codex | Hero diaporama, mission, aperçu du mot de la présidente, thèmes, 3 dernières actualités, appel à adhérer |
| `/{l}/ong` | Écran ONG Codex (présentation + valeurs) | Présentation, valeurs, ancrage |
| `/{l}/mot-de-la-presidente` | Composée (bloc présidente + hero de page) | PAGE-02 en entier, avec signature et portrait si autorisé |
| `/{l}/organisation` | Composée (section équipe de l'écran ONG) | PAGE-11. Si l'organigramme n'est pas validé : message « en cours de validation » |
| `/{l}/projets`, `/{l}/projets/[slug]` | Composée (ActionThemeCard + gabarit Article) | Thèmes et fiches PAGE-04 |
| `/{l}/actualites`, `/{l}/actualites/[slug]` | Actualités + Article Codex | PAGE-05 avec leurs sources |
| `/{l}/adhesion` | Section adhésion de l'écran ONG Codex | Démarche, étapes, critères, avantages, FAQ. Formulaire visible mais désactivé, avec le bandeau « L'adhésion n'est pas encore ouverte » |
| `/{l}/mediatheque` | Médiathèque Codex | Galerie de la collection `medias` et lien Facebook |
| `/{l}/partenariats` | Composée | PAGE-06 |
| `/{l}/transparence` | Composée | PAGE-07. Documents publics, ou mention « à venir » |
| `/{l}/contact` | Contact Codex | Orientations adhésion / partenariat / échange. Formulaire visible mais envoi désactivé, avec renvoi vers Facebook |
| `/{l}/confidentialite` | Composée, gabarit texte | PAGE-09 |
| `/{l}/mentions-legales` | Composée, gabarit texte | PAGE-10 |
| 404 | Composée | Texte commun des Textes v1.3, avec les boutons « Retour à l'accueil » et « Voir nos actions » |

**Navigation.** L'en-tête reprend le menu Banani avec de vrais liens : L'ONG, Mot de la présidente, Organisation, Projets & actions, Actualités, Médiathèque, Contact. Il contient aussi le bouton « Adhérer » et le sélecteur de langue. Le sélecteur garde la page courante quand on change de langue. Le pied de page reprend la liste de liens des Textes v1.3.

**Pages composées.** Elles réutilisent exclusivement des briques existantes : le hero de page vert profond de l'écran ONG, `SectionHeader`, `GoldDivider`, les cartes, et l'alternance des fonds blanc / `#F7F8F4`.

**Responsive.** Les points de rupture du prototype (1100, 900, 700 et 430 px) sont conservés. Chaque page est vérifiée à 390 px et à 1440 px.

## 6. Animations — niveau « vivant mais sobre »

Les animations sont faites sans bibliothèque. Elles utilisent du CSS, IntersectionObserver et la View Transitions API.

| Brique | Comportement | Usage |
|---|---|---|
| `<Reveal>` (client) | Fondu + translation de 16 px vers le haut, 600 ms, `cubic-bezier(0.22, 1, 0.36, 1)`, joué une fois à l'entrée dans l'écran | Titres de section, paragraphes, images |
| `<RevealGroup>` (client) | Apparition décalée des enfants, 80 ms d'écart | Grilles : thèmes, actualités, valeurs, galerie |
| `<CountUp>` (client) | Défile de 0 à la valeur cible en 1,2 s quand il devient visible | Uniquement les chiffres réels des Textes v1.3 |
| En-tête au défilement | Au-delà de 40 px : hauteur de 80 à 64 px, ombre légère, fond plus opaque | Toutes les pages |
| Survol des cartes | Élévation de 4 px, ombre plus marquée, zoom de l'image ×1,04, filet doré sous le titre | Cartes thèmes, actualités, projets, médias |
| Boutons | Changement de teinte, la flèche glisse de 4 px | Tous les CTA |
| Transitions de page | Fondu croisé de 200 ms via la View Transitions API ; l'en-tête reste fixe | Navigation interne |
| Hero | Diaporama et apparition du texte du prototype conservés | Accueil |
| Visionneuse médiathèque | Ouverture en fondu + zoom, Échap pour fermer, flèches du clavier, focus piégé dans la visionneuse | Médiathèque |

**Contraintes :**
- On anime uniquement `opacity` et `transform`, jamais les propriétés qui déclenchent un recalcul de mise en page.
- `prefers-reduced-motion: reduce` désactive toutes les animations, et le contenu s'affiche immédiatement.
- L'état masqué initial n'est appliqué que si JavaScript est actif : une classe est posée sur `<html>` par un script inline. Sans JS, tout le contenu est visible et indexable.
- Le budget est d'environ 3 Ko de JavaScript ajouté pour l'ensemble des briques d'animation.

## 7. Gestion des erreurs

| Situation | Comportement |
|---|---|
| Route ou slug inconnu | 404 localisée |
| Langue inactive | Message « version non publiée » et liens vers les langues actives |
| Champ ou section vide dans Payload | Section masquée, sans erreur ; signalée « à compléter » dans l'admin |
| Base de données injoignable | Pages en cache servies ; sinon page d'erreur sobre |
| Image manquante | Fond de la couleur de la charte et texte alternatif |
| Formulaires (adhésion, contact) | Champs et bouton désactivés (`disabled` + `aria-disabled`), message explicite. Aucune requête réseau |

## 8. Tests et recette

### 8.1 Tests automatisés

- **Unitaires (Vitest) :**
  - résolution de la langue et décision du middleware ;
  - construction des URL et des balises `hreflang` ;
  - sélecteur de langue (même page, autre locale) ;
  - `CountUp` ;
  - `Reveal` avec et sans `prefers-reduced-motion`.
- **Bout en bout (Playwright) :**
  - chaque route répond en 200 en FR et en EN ;
  - aucun lien de l'en-tête ou du pied de page ne mène à une 404 ;
  - le sélecteur conserve la page ;
  - les formulaires sont désactivés et n'émettent aucune requête ;
  - le contenu est visible sans JavaScript ;
  - une langue inactive affiche le bon message ;
  - captures d'écran à 390 px et à 1440 px.
- **Accessibilité :** `@axe-core/playwright` sur chaque page, sans violation de niveau « serious » ou « critical ».
- **Intégration :** depuis une base vide, `docker compose up` suivi du seed permet d'afficher le site complet.

### 8.2 Critères d'acceptation du lot 1

1. Toutes les routes de la section 5 existent en FR et en EN, avec des contenus issus des Textes v1.3 et de leur traduction.
2. Les 6 écrans maquettés sont visuellement fidèles à la maquette Banani, en desktop et en mobile.
3. Les animations respectent la section 6, y compris `prefers-reduced-motion`.
4. Lighthouse mobile sur l'accueil : au moins 90 en Performance, Accessibilité et SEO.
5. `sitemap.xml` (langues actives, avec `hreflang`) et `robots.txt` sont valides. L'admin est exclu de l'indexation.
6. Aucune donnée personnelle n'est collectée ni transmise.
7. Tous les contenus sont modifiables dans l'admin Payload, et une modification est visible sur le site après revalidation.

## 9. Points ouverts côté ONG (non bloquants pour le développement)

- Les éléments à fournir ou valider : nom, titre, texte et portrait de la présidente ; organigramme ; données des mentions légales et responsable du traitement ; documents de transparence ; contacts officiels.
- Les photos réelles, pour remplacer les images marquées « provisoire ».
- La relecture de la traduction anglaise.
