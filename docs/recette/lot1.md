# Recette du lot 1 — site public

Date : 2026-10-06 (branche `lot1-socle-site-public`).

## Résultats

- `npx tsc --noEmit` : OK. `npm run lint` : 0 erreur (2 avertissements préexistants sur `eslint.config.mjs` et `postcss.config.mjs`).
- `npm test` (Vitest) : 84 tests, 18 fichiers, tous verts.
- `npm run test:e2e` (desktop 1440 px + mobile 390 px) : 120 réussis, 2 ignorés (tests réservés au desktop).
- Lighthouse mobile sur `/fr` (build de production, serveur e2e) : performance **92**, accessibilité **100**, SEO **100** (FCP 1,1 s, LCP 3,3 s, TBT 120 ms, CLS 0).

## Couverture de la recette transverse

- Toutes les routes (13 pages statiques, 3 actualités, 4 projets) répondent 200 en FR et EN, avec `lang`, un seul `h1`, canonique et hreflang.
- Aucun lien interne d'en-tête ou de pied de page ne mène à une 404 (FR et EN).
- Le sélecteur de langue conserve la page (desktop) ; `/` et `/contact` redirigent vers `/fr` ; `/es` affiche le message de langue non publiée.
- Sans JavaScript : le contenu animé reste visible (opacité 1). Mouvement réduit : contenu affiché, transitions à 0 s.
- axe-core (wcag2a, wcag2aa, wcag21aa) sur les 20 pages FR, desktop et mobile : aucune violation serious/critical.
- Formulaires désactivés et sans requête : couverts par `formulaires.spec.ts`.
- Captures 390 px et 1440 px : `test-results/captures/` (non versionnées).

## Violations axe trouvées puis corrigées

Toutes étaient des `color-contrast` (ratio 4,2 pour 4,5 requis) :

1. Bleu Facebook `#1877F2` (texte blanc dessus, ou texte bleu sur blanc) : remplacé par `#1670E0` (ratio 4,7) dans le bouton Facebook du pied de page, le bouton de partage, le lien source des cartes d'actualité et les liens de l'article. Ce n'est pas une couleur de la charte (couleur tierce) ; l'écart visuel est imperceptible. L'icône Facebook de `Cta`/`FacebookIcon` garde `#1877F2` (non textuelle).
2. Libellé « Suivez-nous » du pied de page : opacité 50 % portée à 60 % (ratio 5,4) sur le vert profond.

## Performance

Le score initial était de 77. Corrections : favicon allégé (`public/brand/favicon.png`, 64 px, 3 Ko au lieu du logo de 471 Ko) et attribut `sizes` sur les logos de l'en-tête et du pied de page (srcset Next jusqu'à 3840 px auparavant). Résultat : 92.

## Écarts visuels avec la maquette Banani

Le MCP Banani était indisponible (délai de connexion dépassé) et `.banani-export/screens/` ne contient que du JSX, sans images de référence : la comparaison visuelle écran par écran n'a pas pu être faite. Seul un contrôle de cohérence des captures a eu lieu (accueil mobile : hero, sections, pied de page conformes à la structure attendue). **À faire par une personne** : comparer `test-results/captures/` aux écrans Banani (Accueil, Actualités, Article, Contact, Médiathèque, L'ONG).

## 404 : rendu serveur

- URL inconnue (`/fr/xyz`, `/en/xyz`) : statut 404 et page localisée présente dans le HTML brut (via `global-not-found`). Vérifié par test.
- Slug inconnu (`/fr/actualites/inexistant`, `/fr/projets/inexistant`) : statut 404 correct, mais le HTML brut contient la coquille `__next_error__` avec le contenu 404 localisé uniquement dans la charge RSC, rendu côté client. Limite connue de Next 16, acceptée. Sans JavaScript, la page affiche donc un 404 sans contenu visible. Vérifié par test (statut + titre visible avec JS).

## Points ouverts

- Comparaison visuelle Banani à faire (voir ci-dessus).
- Mineurs consignés pendant le lot (voir le journal SDD) : menu mobile et sélecteur de langue inutilisables sans JavaScript, duplication police/coquille dans `global-not-found`, etc.

## Décisions validées

- Le 2026-10-06, l'utilisateur a validé deux ajustements de contraste faits pendant la recette : le bleu Facebook `#1877F2` devient `#1670E0`, et l'opacité du libellé « Suivez-nous » du pied de page passe de 50 % à 60 %.
- L'icône Facebook garde volontairement le bleu officiel `#1877F2` (`Cta.tsx`, `FacebookIcon`).
- Diaporama du héros : un bouton de pause (WCAG 2.2.2), visible uniquement avec JavaScript et masqué sous `prefers-reduced-motion`, a été ajouté lors de la revue finale.
- API REST de Payload : les actualités non publiées, les pages, les projets et les réglages ne sont lisibles que par un utilisateur connecté ; les médias restent publics.

## Vérifications manuelles

### Critère 7 — modification d'une actualité

Statut : à faire par l'ONG / le responsable.

1. Dans `/admin`, modifier le titre ou le résumé d'une actualité, puis enregistrer.
2. Recharger `/fr` et `/en` (et la page de l'actualité) : la modification doit être visible après la revalidation, sans redéploiement.
3. Supprimer ou dépublier une actualité de test : elle doit disparaître du site.

### Critère 2 — fidélité à la maquette

Statut : à faire.

Comparer les captures de `test-results/captures/` (générées par `npm run test:e2e`) avec les écrans Banani, page par page, en desktop et en mobile. Consigner les écarts dans « Écarts visuels avec la maquette Banani ».

## Contenus en attente de l'ONG (section 9 de la spec)

- Présidente : nom, titre, texte, portrait.
- Organigramme.
- Mentions légales et responsable du traitement : données.
- Documents de transparence.
- Contacts officiels.
- Photos réelles, pour remplacer les images « provisoire ».
- Relecture de la traduction anglaise.
