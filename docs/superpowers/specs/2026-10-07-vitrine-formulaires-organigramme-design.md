# Spec : formulaires par e-mail, organigramme administrable et compte admin unique

- **Date :** 2026-10-07
- **Branche :** `vitrine-formulaires-organigramme`, partie de `main` @ 4a1e62d
- **Statut :** design validé par l'utilisateur le 2026-10-07

## 1. Contexte et périmètre

Le site est un **site vitrine**. L'utilisateur abandonne le découpage en 5 lots du PRD v1.3, donc il n'y aura :
- ni rôles multiples ;
- ni registre de membres ;
- ni transactions ;
- ni sauvegardes BO-14.

Cette spec couvre trois chantiers :
1. **Formulaires d'adhésion et de contact actifs.** Chaque envoi est enregistré dans l'admin, puis envoyé par e-mail quand l'envoi est configuré.
2. **Organigramme administrable :** postes, personnes, rattachements. Il est livré avec un contenu fictif en brouillon.
3. **Compte admin unique :** aucun autre compte ne peut être créé.

Hors périmètre : espace membre, CAPTCHA tiers, newsletter, notifications SMS ou WhatsApp, langues autres que FR et EN.

## 2. Formulaires

### 2.1 Champs

**Adhésion.** Les champs suivent le PRD, section « Espace d'adhésion ».

| Champ | Requis | Validation serveur |
|---|---|---|
| nom | oui | 1 à 80 caractères |
| prenoms | oui | 1 à 80 caractères, noms non latins acceptés |
| telephone | oui | format international, indicatif visible ; espaces acceptés puis normalisés |
| email | non | format e-mail, 254 caractères maximum |
| pays | non | liste internationale traduite, aucune valeur imposée |
| ville | non | 100 caractères maximum |
| interets | non | cases multiples : jeunesse, santé/sensibilisation, sport, solidarité/vie locale, autre contribution |
| motivation | non | 1000 caractères maximum, avec un compteur |
| notice_lue | oui | case non précochée ; la version de la notice et la date sont enregistrées |
| locale | automatique | `fr` ou `en`, la valeur envoyée par le client n'est pas reprise |

**Contact.** On garde les champs actuels de `ContactForm` :
- nom et e-mail : requis ;
- prénom, téléphone et organisation : facultatifs ;
- message : requis, 2000 caractères maximum.

### 2.2 Traitement d'un envoi

Un **Server Action**, ou une route `POST /api/formulaires/{adhesion|contact}`, traite l'envoi. Lire la doc Next 16 avant de choisir.

1. **Contrôles avant enregistrement :**
   - Un champ **pot de miel** caché est vérifié. S'il est rempli, la réponse est un succès apparent, mais rien n'est enregistré.
   - Le nombre d'envois est **limité à 5 par IP et par 10 minutes**, en mémoire. Au-delà, un message traduit invite à réessayer.
   - La validation complète se fait côté serveur, avec les erreurs par champ.
2. **Idempotence :** le client génère une clé d'idempotence (UUID) au premier envoi. La même clé renvoie la même référence, sans créer de doublon.
3. **Enregistrement d'abord :** un document `messages` est créé avec la référence, le type, les données, la locale et la date. Le visiteur ne voit un succès que si cet enregistrement a réussi.
4. **Envoi de l'e-mail ensuite :**
   - Il part vers l'adresse de destination réglée dans les Réglages. L'e-mail contient un résumé et le lien vers le message dans l'admin.
   - L'état est mis à jour : `envoye`, `echec` (avec l'erreur) ou `non_configure`.
   - Un échec d'e-mail **n'annule pas** l'enregistrement.
5. **Réponse au visiteur :** un message de confirmation traduit avec la **référence**, sous la forme `ADH-XXXXXX` ou `CT-XXXXXX` (6 caractères aléatoires, non devinables). La référence ne donne accès à aucun dossier public.
   - Aucun accusé de réception n'est envoyé au candidat dans cette version.
   - Le texte de confirmation ne dit jamais qu'un e-mail a été envoyé.
6. **États côté client :** saisie, erreur de champ, envoi en cours, succès, erreur réseau.
   - En cas d'erreur réseau, les champs sont conservés et le visiteur peut réessayer avec la même clé.
   - Le bouton est désactivé pendant l'envoi.

### 2.3 Envoi d'e-mails

- Le transport est l'adaptateur Nodemailer de Payload (`@payloadcms/email-nodemailer`), configuré en SMTP par `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` et `SMTP_FROM` dans `.env`.
- Ces variables sont documentées dans `.env.example` et le README, sans valeur réelle.
- Si `SMTP_HOST` est absent, aucun adaptateur n'est configuré : les e-mails ne partent pas et l'état vaut `non_configure`. Le reste du site fonctionne normalement.
- Le global `Reglages` reçoit deux nouveaux champs : `emailAdhesions` et `emailContact`. Si l'adresse correspondante est vide, l'état vaut aussi `non_configure`.
- En e2e, un faux transport capture les e-mails pour les tests, sans aucun envoi réel.

### 2.4 Collection `messages` (admin, groupe « Formulaires »)

- **Libellé :** « Messages reçus ».
- **Champs en lecture seule dans l'admin :** `reference` (unique), `type` (adhésion ou contact), `donnees` (JSON, affiché sous forme lisible), `locale`, `noticeVersion`, `createdAt`, `cleIdempotence` (index unique), `emailEtat`, `emailErreur`, `emailEnvoyeLe`.
- **Champs modifiables :** `traite` (case à cocher) et `notes` (texte privé).
- **Accès :** aucune lecture publique. Écriture et suppression réservées à l'admin connecté. La création publique passe uniquement par l'API locale du traitement de formulaire (§2.2), jamais par REST ou GraphQL.
- **Action « Renvoyer l'e-mail »** sur un message dont l'état est `echec` ou `non_configure` : un bouton dans la vue d'édition.
- **Colonnes de la liste :** référence, type, nom, état e-mail, traité, date.
- **Filtre par défaut :** non traités en premier.
- **Tableau de bord KPI :** nouvelle carte « Messages non traités », avec sa répartition par type et un lien vers la liste filtrée. Elle suit les mêmes règles que les autres cartes : valeur réelle ou « Indisponible ».

### 2.5 Textes et pages

- **Pages `/adhesion` et `/contact` :** le bandeau « pas encore ouvertes » et l'état désactivé disparaissent.
- **Mention sous le bouton d'envoi :** elle est complétée pour expliquer le traitement des données. Le texte de la notice reprend celui de Textes v1.3 s'il existe ; sinon, une notice courte FR et EN est proposée dans le plan, avec un `noticeVersion` égal à `2026-10-07`.
- **Dictionnaires :** toutes les nouvelles clés existent en FR et en EN.

## 3. Organigramme

### 3.1 Collection `postes` (admin, groupe « Contenus », libellé « Organigramme »)

| Champ | Type | Notes |
|---|---|---|
| intitule | texte, localisé, requis | |
| mission | textarea, localisé | |
| parent | relation vers `postes`, facultative | une seule racine conseillée |
| ordre | nombre | ordre parmi les postes de même niveau |
| personneNom | texte | nom public |
| personnePhoto | upload vers `medias` | |
| personneBio | textarea, localisé | courte biographie |

Règles :
- **Brouillons :** `versions: { drafts: true }`.
- **Lecture publique :** limitée aux postes publiés (`_status = published`).
- **Validation serveur du parent, dans un hook `beforeValidate` :**
  - pas d'auto-rattachement ;
  - pas de cycle (remontée de la chaîne des parents) ;
  - pas de parent absent ;
  - chaque refus produit un message explicite en français.
- **Suppression :** refusée si des postes, publiés ou en brouillon, ont ce poste pour parent. Le message demande de les rattacher ailleurs d'abord.
- **Revalidation :** les pages organisation sont revalidées après chaque écriture ou suppression, via le mécanisme existant `revalidateSite`.
- **Aperçu :** il fonctionne comme pour les actualités, avec `admin.preview` vers `/{locale}/organisation`. En mode aperçu avec une session admin valide, la page affiche les brouillons.

### 3.2 Page publique `/organisation`

- **Données :** seuls les postes publiés sont lus, ainsi que leur hiérarchie.
- **Les sections existantes restent :** hero, « demarche » et FAQ. La section `organigramme` de la page actuelle (texte) est **remplacée** par le composant organigramme.
- **Composant :**
  - Un **schéma en arbre** CSS (flexbox/grid, sans bibliothèque) : cartes avec photo ronde, nom, intitulé et mission courte, reliées par des traits.
  - Une **liste imbriquée accessible**, `<ul>` hiérarchique, avec le même contenu et le même ordre. Elle est toujours dans le DOM :
    - visible sur mobile à la place de l'arbre ;
    - sous l'arbre sur desktop, ou masquée visuellement mais lisible par les lecteurs d'écran (choix à faire dans le plan, le critère étant « mêmes rattachements, même ordre »).
  - Les photos ont un alt traduit, qui reprend celui du média.
- **Aucun poste publié :** la page affiche le message traduit « Organigramme en cours de validation. » / « Organisation chart being finalised. ».
- **Liens :** la page reste accessible depuis le menu et le pied de page, comme aujourd'hui.

### 3.3 Contenu de départ (seed), **tout en brouillon**

| # | Intitulé FR / EN | Parent | Personne |
|---|---|---|---|
| 1 | Présidente / President | — | Madame Laurence Ndong (réelle). Photo recadrée depuis `src/seed/images/albums/rencontre-populations-2026-08/photo-3.jpg` (droits confirmés) |
| 2 | Vice-président / Vice-President | 1 | Jean-Baptiste Mboumba (fictif) |
| 3 | Secrétaire générale / Secretary-General | 1 | Clarisse Nzé Obiang (fictive) |
| 4 | Trésorier / Treasurer | 1 | Rodrigue Mintsa Ella (fictif) |
| 5 | Secrétaire général adjoint / Deputy Secretary-General | 3 | Hervé Koumba Ondo (fictif) |
| 6 | Trésorière adjointe / Deputy Treasurer | 4 | Prisca Mabika (fictive) |
| 7 | Chargé des projets et actions / Projects and Initiatives Officer | 3 | Fabrice Ondo Mba (fictif) |
| 8 | Chargée de la jeunesse et du sport / Youth and Sport Officer | 3 | Sandrine Ekomi (fictive) |
| 9 | Chargée de la communication / Communications Officer | 3 | Aurélie Bivigou (fictive) |
| 10 | Chargé des adhésions et de la vie associative / Membership and Community Officer | 3 | Steeve Nziengui (fictif) |

- **Missions :** une phrase courte et générique par poste, en FR et en EN, rédigée dans le plan. Elle ne mentionne aucun fait.
- **Biographies :** vides.
- **Portraits fictifs (postes 2 à 10) :**
  - déjà générés par IA avec Canva le 2026-10-07 : personnes noires, tenue professionnelle sans logo, fond gris clair uni, 200×200 ;
  - placés hors git dans `.superpowers/contenus/organigramme/poste-02.jpg` à `poste-10.jpg`, à copier dans `src/seed/images/organigramme/` ;
  - le portrait de la Présidente est déjà recadré : `poste-01.jpg`, 400×400 ;
  - médias seedés avec `credit` « Portrait généré par IA — provisoire », `provisoire: true`, `galerie: false` et un alt neutre (« Portrait provisoire »).
- **Portrait de la Présidente :** `credit` « Terre d'Avenir KOMO-KANGO », `droitsConfirmes: true` et l'alt « Portrait de la Présidente ».
- **Idempotence :** le seed retrouve les postes par une clé stable, un champ `cle` caché ou l'intitulé FR, et reste idempotent.
- **État initial :** tous les postes sont créés en `draft`. La page publique affiche donc « Organigramme en cours de validation » jusqu'à ce que l'admin publie.

## 4. Compte admin unique

- `Users.access.create` n'autorise la création que s'il n'existe **aucun** utilisateur. Cela permet le parcours « premier utilisateur » de Payload : vérifier dans `node_modules/payload` comment `create-first-user` contrôle l'accès.
- Tout le reste est refusé, y compris pour l'admin connecté. Le bouton « Créer » de la liste des utilisateurs n'est donc plus disponible.
- Le seed et l'e2e créent leur compte par l'API locale, qui contourne l'accès : le seed existant reste compatible.
- **Suppression :** l'admin ne peut pas supprimer le dernier compte (`delete` refusé).
- **Mot de passe oublié :** le parcours Payload standard fonctionne dès que le SMTP est configuré. Sans SMTP, la page reste disponible mais l'e-mail ne part pas, et c'est documenté dans le README.

## 5. Tests et critères d'acceptation

1. Un envoi valide d'adhésion ou de contact affiche une référence. Le message apparaît dans « Messages reçus » avec la même référence, même sans SMTP (`emailEtat = non_configure`).
2. Avec le faux transport e2e et une adresse configurée, l'e-mail capturé contient la référence et le lien admin, et `emailEtat = envoye`.
3. Un double envoi avec la même clé donne une seule entrée et la même référence.
4. Un pot de miel rempli ne crée rien. Au-delà de la limite, le visiteur reçoit le message de limite.
5. Les champs invalides affichent leur erreur, côté serveur comme côté client, et la saisie est conservée.
6. `/api/messages` sans jeton renvoie 403, en lecture comme en création.
7. L'organigramme publié s'affiche en arbre et en liste, avec les mêmes rattachements et le même ordre. Il est lisible au clavier et sur mobile.
8. Aucun poste publié : le message « en cours de validation » s'affiche. Un poste en brouillon n'apparaît ni sur la page, ni dans l'API publique, ni dans le sitemap.
9. Un auto-rattachement, un cycle ou un parent absent est refusé avec un message explicite. Supprimer un parent qui a des enfants est refusé.
10. L'aperçu de l'admin affiche les postes en brouillon.
11. Il est impossible de créer un second utilisateur, que ce soit par l'admin ou par REST avec le jeton admin.
12. Le tableau de bord affiche « Messages non traités » et son lien filtre correctement.
13. `tsc`, `npm test`, le lint, le build et l'e2e complet passent deux fois de suite, sans test instable.

## 6. Migrations

- Il faut une migration par chantier :
  - `messages` ;
  - les champs e-mail des Réglages ;
  - `postes` et ses versions.
- Pour chaque migration, tester `up`, `down` puis `up` sur une base jetable.
- Ne pas utiliser `migrate:reset` (voir le README).
