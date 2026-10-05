# Annexe du plan lot 1 — Contenus FR/EN du seed

Cette annexe est utilisée par la **tâche 4** du plan `2026-10-05-lot1-socle-site-public.md`. Copier chaque bloc de code **à l'identique** dans le fichier indiqué.

**Règles de transcription appliquées :**
- Les textes français viennent des Textes v1.3 (`../Source/Terre_Avenir_KOMO_KANGO_03_Textes_Site_v1.3.md`).
- Les marqueurs `[…]`, les notes internes et la mention « selon la confirmation de Stéphane » sont **omis**.
- Une phrase qui contient un marqueur est supprimée en entier.
- Les liens internes sont écrits sans langue (`/adhesion`) ; le site ajoute `/fr` ou `/en`.
- Les **textes nouveaux** (absents des Textes v1.3, rédigés pour les pages ajoutées par le design hybride) sont marqués `// NOUVEAU — à valider par l'ONG` :
  - les métadonnées de la page « L'ONG » ;
  - la page Médiathèque ;
  - les sections `formulaire` et `localisation` de Contact.
- Le titre `h1` de l'accueil utilise `*…*` pour la mise en avant dorée de la maquette.

## `src/seed/data/fr.ts`

```ts
import type { LocaleContent } from './types'

export const FACEBOOK_URL = 'https://www.facebook.com/p/Komo-Kango-Terre-dAvenir-61573035845197/'
export const FB_PERMIS =
  'https://www.facebook.com/61573035845197/posts/initiative-komo-kango-un-jeune-un-permis-communiqu%C3%A9/122197024574767861/'
export const FB_SANTE =
  'https://www.facebook.com/61573035845197/posts/les-femmes-du-d%C3%A9partement-du-komo-kango-ont-b%C3%A9n%C3%A9fici%C3%A9-dune-journ%C3%A9e-de-sensibilis/122117470028767861/'
export const GABON_OFFICIEL =
  'https://gabonofficiel.com/kango-lassociation-komo-kango-terre-davenir-trace-les-contours-du-developpement-local-pour-2026/'

const REPERES = [
  { title: 'Komo-Kango, Gabon', text: 'Notre ancrage' },
  { title: 'Depuis février 2025', text: 'Une dynamique de rassemblement' },
  { title: 'Solidarité et développement local', text: 'Notre engagement' },
]

const ANCRAGE = {
  key: 'ancrage',
  eyebrow: 'Notre ancrage',
  heading: 'Une ONG ancrée dans son territoire',
  body: 'Notre démarche rassemble autour du Komo-Kango celles et ceux qui souhaitent contribuer à la solidarité et au développement local. Notre ouverture vise à faciliter les échanges avec les ressortissants établis ailleurs et avec des organisations qui souhaitent proposer une coopération.',
}

const PARTICIPER = {
  key: 'participer',
  heading: 'Participer à la démarche',
  body: 'Vous souhaitez rejoindre l’ONG, échanger sur une contribution ou proposer une collaboration ? Découvrez les démarches et choisissez le parcours adapté à votre projet.',
  ctas: [
    { label: 'Demander l’adhésion', href: '/adhesion' },
    { label: 'Proposer un partenariat', href: '/partenariats' },
  ],
}

const INTRO_ACCUEIL =
  'Ancrée au Komo-Kango, au Gabon, Terre d’Avenir rassemble les énergies autour de la solidarité et du développement local. Découvrez notre démarche, les initiatives documentées et les possibilités de participation.'

const DEMARCHE_TEXTE = 'Retrouvez le mot de la présidente, les informations de transparence et les possibilités de participation.'

export const fr: LocaleContent = {
  reglages: {
    location: 'Komo-Kango, Gabon',
    footerTagline: 'Terre d’Avenir KOMO-KANGO — Une ONG ancrée au Gabon, ouverte aux échanges et aux coopérations.',
  },

  pages: [
    {
      slug: 'accueil',
      seoTitle: 'Terre d’Avenir KOMO-KANGO — ONG, solidarité et développement local',
      metaDescription:
        'Découvrez Terre d’Avenir KOMO-KANGO, ONG ancrée au Gabon, ses actions, le mot de sa présidente et la démarche d’adhésion ou de partenariat.',
      h1: 'Du Komo-Kango au monde, *faisons grandir* la solidarité.',
      intro: INTRO_ACCUEIL,
      sections: [
        {
          key: 'hero',
          eyebrow: 'Komo-Kango, Gabon',
          items: REPERES,
          ctas: [
            { label: 'Adhérer', href: '/adhesion' },
            { label: 'Découvrir nos actions', href: '/projets' },
          ],
        },
        ANCRAGE,
        {
          key: 'mot',
          heading: 'Le mot de la présidente',
          body: 'Notre démarche s’appuie sur un ancrage local et une volonté d’ouverture. Aux habitants, aux ressortissants établis ailleurs, aux acteurs économiques et aux organisations qui partagent cette attention aux communautés, nous souhaitons proposer un espace de rencontre et de coopération.',
          ctas: [{ label: 'Lire le mot de la présidente', href: '/mot-de-la-presidente' }],
        },
        {
          key: 'engagements',
          heading: 'Des engagements à découvrir',
          ctas: [{ label: 'Découvrir les actions', href: '/projets' }],
        },
        {
          key: 'actualites',
          heading: 'La vie de Terre d’Avenir',
          ctas: [{ label: 'Toutes les actualités', href: '/actualites' }],
        },
        PARTICIPER,
        {
          key: 'transparence',
          heading: 'Des informations pour comprendre notre démarche',
          body: 'Consultez les éléments de présentation et les documents validés mis à disposition. Vous pouvez aussi nous adresser une demande d’information.',
          ctas: [{ label: 'Consulter la transparence', href: '/transparence' }],
        },
      ],
    },

    {
      slug: 'ong',
      seoTitle: 'L’ONG — Terre d’Avenir KOMO-KANGO', // NOUVEAU — à valider par l'ONG
      metaDescription:
        'Découvrez Terre d’Avenir KOMO-KANGO, ONG ancrée au Komo-Kango, au Gabon, et sa démarche de solidarité et de développement local.', // NOUVEAU — à valider par l'ONG
      h1: 'Terre d’Avenir KOMO-KANGO',
      intro: INTRO_ACCUEIL,
      sections: [
        { key: 'reperes', items: REPERES },
        ANCRAGE,
        {
          key: 'engagements',
          heading: 'Des engagements à découvrir',
          ctas: [{ label: 'Découvrir les actions', href: '/projets' }],
        },
        {
          key: 'demarche',
          heading: 'Découvrir notre démarche',
          body: DEMARCHE_TEXTE,
          ctas: [
            { label: 'Lire le mot de la présidente', href: '/mot-de-la-presidente' },
            { label: 'Découvrir notre organisation', href: '/organisation' },
            { label: 'Consulter la transparence', href: '/transparence' },
            { label: 'Demander l’adhésion', href: '/adhesion' },
          ],
        },
        PARTICIPER,
      ],
    },

    {
      slug: 'mot-de-la-presidente',
      seoTitle: 'Le mot de la présidente — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Découvrez le mot de la présidente de Terre d’Avenir KOMO-KANGO et son invitation à participer à la démarche de l’ONG.',
      h1: 'Le mot de la présidente',
      intro: 'Faire de nos liens une force pour l’avenir du Komo-Kango.',
      sections: [
        {
          key: 'message',
          body: [
            'Chères filles et chers fils du Komo-Kango,\nChers amis et partenaires,',
            'Notre attachement à une terre prend tout son sens lorsque nous choisissons de contribuer à son avenir. Le Komo-Kango est un lieu de vie, de liens et de transmission. Il nous invite à regarder ensemble les besoins de nos communautés et les possibilités que nous pouvons faire grandir.',
            'Avec Terre d’Avenir KOMO-KANGO, nous souhaitons rassembler les énergies autour d’une conviction : la solidarité se construit dans l’écoute, le dialogue et l’engagement. La jeunesse, la santé, le sport et la vie locale offrent autant d’occasions de nous retrouver et de réfléchir aux contributions utiles à notre territoire.',
            'Notre démarche s’appuie sur un ancrage local et une volonté d’ouverture. Aux habitants, aux ressortissants établis ailleurs, aux acteurs économiques et aux organisations qui partagent cette attention aux communautés, nous souhaitons proposer un espace de rencontre et de coopération.',
            'Ce site a vocation à rendre notre démarche plus lisible, à présenter les initiatives documentées et à faciliter les échanges. Il doit aussi permettre à celles et ceux qui souhaitent nous rejoindre d’exprimer leur intérêt dans un cadre clair.',
            'Je vous invite à découvrir nos actions, à nous faire part de vos idées et, si vous souhaitez vous engager à nos côtés, à déposer une demande d’adhésion. Les modalités de participation seront précisées avec l’ONG afin que chacun comprenne la démarche et la place qu’il pourra y prendre.',
            'Ensemble, faisons de notre attachement au Komo-Kango une volonté partagée d’agir pour son avenir.',
            'Je vous remercie pour votre intérêt et pour l’attention que vous portez à notre territoire.',
          ].join('\n\n'),
          ctas: [
            { label: 'Demander l’adhésion', href: '/adhesion' },
            { label: 'Découvrir nos actions', href: '/projets' },
            { label: 'Découvrir notre organisation', href: '/organisation' },
          ],
        },
      ],
    },

    {
      slug: 'organisation',
      seoTitle: 'Organisation et organigramme — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Découvrez l’organisation de Terre d’Avenir KOMO-KANGO, ses fonctions et les personnes présentées avec l’accord de l’ONG.',
      h1: 'Notre organisation',
      intro: 'Comprendre les fonctions, les responsabilités et les liens au sein de Terre d’Avenir KOMO-KANGO.',
      sections: [
        {
          key: 'organigramme',
          heading: 'Notre organigramme',
          body: 'La présentation de notre organisation est en cours de préparation. Vous pouvez consulter le mot de la présidente ou contacter l’ONG.',
        },
        {
          key: 'demarche',
          heading: 'Découvrir notre démarche',
          body: DEMARCHE_TEXTE,
          ctas: [
            { label: 'Lire le mot de la présidente', href: '/mot-de-la-presidente' },
            { label: 'Consulter la transparence', href: '/transparence' },
            { label: 'Demander l’adhésion', href: '/adhesion' },
            { label: 'Contacter l’ONG', href: '/contact' },
          ],
        },
        {
          key: 'faq',
          items: [
            {
              title: 'Comment contacter l’ONG ?',
              text: 'Utilisez les moyens de contact présentés sur notre page Contact. Les coordonnées personnelles des responsables ne sont pas publiées automatiquement.',
            },
          ],
        },
      ],
    },

    {
      slug: 'projets',
      seoTitle: 'Projets et actions — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Retrouvez les initiatives documentées de Terre d’Avenir KOMO-KANGO autour de la jeunesse, de la sensibilisation, du sport et de la solidarité.',
      h1: 'Des initiatives à découvrir',
      intro:
        'Les publications et rencontres de Terre d’Avenir mettent en lumière plusieurs thèmes d’engagement. Découvrez leur contexte et accédez aux informations disponibles.',
      sections: [
        {
          key: 'fin',
          ctas: [
            { label: 'Demander l’adhésion', href: '/adhesion' },
            { label: 'Proposer une collaboration', href: '/partenariats' },
          ],
        },
        {
          key: 'vide',
          body: 'Aucune initiative n’est publiée dans cette rubrique pour le moment. Retrouvez nos actualités ou contactez l’ONG pour en savoir plus.',
        },
      ],
    },

    {
      slug: 'actualites',
      seoTitle: 'Actualités — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Suivez les publications, initiatives et rencontres documentées de Terre d’Avenir KOMO-KANGO et retrouvez leurs sources.',
      h1: 'La vie de Terre d’Avenir',
      intro:
        'Retrouvez les nouvelles disponibles sur les initiatives et les rencontres. Les dates affichées correspondent à des événements documentés ; elles ne valent pas ouverture d’inscriptions.',
      sections: [
        {
          key: 'liste',
          eyebrow: 'La vie de l’association',
          heading: 'Des nouvelles du territoire.',
          ctas: [{ label: 'Toutes les publications sur Facebook', href: FACEBOOK_URL }],
        },
        {
          key: 'fin',
          ctas: [
            { label: 'Découvrir nos actions', href: '/projets' },
            { label: 'Adhérer', href: '/adhesion' },
          ],
        },
        { key: 'vide', body: 'Aucune actualité n’est publiée dans cette langue pour le moment.' },
      ],
    },

    {
      slug: 'adhesion',
      seoTitle: 'Adhésion — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Découvrez la démarche d’adhésion à Terre d’Avenir KOMO-KANGO et transmettez votre demande pour examen par l’ONG.',
      h1: 'Rejoindre Terre d’Avenir KOMO-KANGO',
      intro:
        'Vous souhaitez vous engager à nos côtés ? Présentez-vous et exprimez votre souhait de rejoindre l’ONG. Votre demande sera examinée selon les modalités d’adhésion définies par Terre d’Avenir KOMO-KANGO.',
      sections: [
        {
          key: 'indisponible',
          body: 'Les demandes d’adhésion en ligne ne sont pas encore ouvertes. Vous pouvez contacter l’ONG via sa page Facebook pour vous renseigner sur la démarche.',
          ctas: [
            { label: 'Ouvrir la page Facebook', href: FACEBOOK_URL },
            { label: 'Contacter l’ONG', href: '/contact' },
          ],
        },
        {
          key: 'etapes',
          heading: 'Une démarche en trois étapes',
          items: [
            { text: 'Vous complétez votre demande.' },
            { text: 'L’ONG examine les informations transmises et vous contacte si nécessaire.' },
            { text: 'La décision et les modalités de votre participation vous sont communiquées.' },
          ],
        },
        {
          key: 'formulaire',
          heading: 'Votre demande d’adhésion',
          body: 'Les champs marqués d’un astérisque sont nécessaires pour traiter votre demande. L’envoi du formulaire ne vaut pas admission automatique.',
        },
        {
          key: 'faq',
          heading: 'Avant de déposer votre demande',
          items: [
            {
              title: 'L’envoi du formulaire me rend-il membre ?',
              text: 'Non. Le formulaire permet de transmettre une demande. L’ONG vous informera de la décision et des modalités applicables.',
            },
            {
              title: 'Une cotisation est-elle prévue ?',
              text: 'Les conditions d’adhésion, y compris l’éventuelle cotisation, seront précisées par l’ONG. Aucun paiement n’est demandé dans ce formulaire.',
            },
            {
              title: 'Puis-je prendre contact depuis l’étranger ?',
              text: 'Vous pouvez nous présenter votre intérêt et indiquer votre lieu de résidence. Les possibilités de participation seront examinées avec l’ONG ; les critères d’admission restent à préciser.',
            },
            {
              title: 'Quand recevrai-je une réponse ?',
              text: 'L’ONG vous recontactera au moyen des coordonnées fournies. Aucun délai de traitement n’est annoncé à ce stade.',
            },
          ],
        },
      ],
    },

    {
      // NOUVEAU — page entière à valider par l'ONG
      slug: 'mediatheque',
      seoTitle: 'Médiathèque — Terre d’Avenir KOMO-KANGO',
      metaDescription: 'Photos et vidéos publiées par Terre d’Avenir KOMO-KANGO.',
      h1: 'Médiathèque',
      intro: 'Retrouvez les photos et vidéos publiées par Terre d’Avenir KOMO-KANGO.',
      sections: [
        {
          key: 'vide',
          body: 'Aucun média n’est encore publié dans la médiathèque. Retrouvez les publications de l’association sur Facebook.',
        },
        {
          key: 'facebook',
          heading: 'Suivre la vie de l’association',
          ctas: [{ label: 'Voir les publications sur Facebook', href: FACEBOOK_URL }],
        },
      ],
    },

    {
      slug: 'partenariats',
      seoTitle: 'Partenariats — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Présentez un projet de coopération à Terre d’Avenir KOMO-KANGO et échangez sur une contribution au développement local et à la solidarité.',
      h1: 'Construire des coopérations utiles',
      intro:
        'Vous représentez une entreprise, une fondation, une ONG, une institution ou un collectif ? Nous souhaitons faciliter les échanges autour des besoins du territoire et des contributions possibles.',
      sections: [
        {
          key: 'proposition',
          heading: 'Une proposition à discuter ensemble',
          body: 'Une collaboration peut commencer par le partage d’une expertise, une idée d’action ou une mise en relation. Présentez votre organisation, votre projet et la manière dont vous souhaitez contribuer. Les possibilités seront examinées avec l’ONG.',
        },
        {
          key: 'informations',
          heading: 'Les informations utiles pour un premier échange',
          body: 'Le nom de votre organisation, votre pays, le projet envisagé, la contribution proposée et les coordonnées de votre interlocuteur permettront d’orienter la discussion. Le premier contact ne crée pas un partenariat ni une autorisation d’usage du logo.',
        },
        {
          key: 'presse',
          heading: 'Presse et information',
          body: 'Vous préparez un article ou souhaitez obtenir des informations sur Terre d’Avenir ? Adressez votre demande à l’ONG. Les éléments institutionnels et médias autorisés pourront être précisés dans le cadre de cet échange.',
        },
        {
          key: 'fin',
          ctas: [
            { label: 'Présenter un partenariat', href: '/contact#partenariat' },
            { label: 'Consulter nos actions', href: '/projets' },
            { label: 'Consulter la transparence', href: '/transparence' },
          ],
        },
      ],
    },

    {
      slug: 'transparence',
      seoTitle: 'Transparence et documents — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Consultez les informations et les documents institutionnels approuvés mis à disposition par Terre d’Avenir KOMO-KANGO ou adressez une demande d’information.',
      h1: 'Comprendre notre démarche',
      intro:
        'Cette rubrique a vocation à présenter les informations institutionnelles, documents et résultats validés que l’ONG souhaite rendre accessibles.',
      sections: [
        {
          key: 'documents',
          heading: 'Documents institutionnels',
          body: 'Aucun document public n’est disponible dans cette rubrique pour le moment. Vous pouvez adresser une demande d’information à l’ONG.',
          ctas: [{ label: 'Demander un document', href: '/contact' }],
        },
        {
          key: 'resultats',
          heading: 'Actions et résultats documentés',
          body: 'Nous souhaitons présenter les actions dans leur contexte et publier des résultats lorsqu’ils ont été établis et validés. Découvrez les initiatives déjà documentées dans la rubrique Projets & actions.',
          ctas: [{ label: 'Voir les initiatives', href: '/projets' }],
        },
      ],
    },

    {
      slug: 'contact',
      seoTitle: 'Contact — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Contactez Terre d’Avenir KOMO-KANGO pour une question, une demande d’adhésion ou une proposition de coopération.',
      h1: 'Entrons en contact',
      intro:
        'Vous souhaitez mieux connaître l’ONG, nous rejoindre ou proposer une collaboration ? Choisissez le parcours correspondant à votre démarche.',
      sections: [
        {
          key: 'adhesion',
          heading: 'Adhésion',
          body: 'Présentez votre demande dans l’espace dédié. Son envoi sera suivi d’un examen par l’ONG, selon les modalités à préciser.',
          ctas: [{ label: 'Accéder à l’adhésion', href: '/adhesion' }],
        },
        {
          key: 'partenariat',
          heading: 'Partenariat et presse',
          body: 'Présentez votre organisation ou le sujet de votre demande, votre pays et un moyen de vous recontacter.',
          ctas: [{ label: 'Contacter via Facebook', href: FACEBOOK_URL }],
        },
        {
          key: 'question',
          heading: 'Une autre question',
          body: 'Retrouvez notre page Komo-Kango Terre d’Avenir pour nous adresser votre demande.',
          ctas: [{ label: 'Ouvrir la page Facebook', href: FACEBOOK_URL }],
        },
        {
          // NOUVEAU — à valider par l'ONG
          key: 'formulaire',
          heading: 'Envoyer un message',
          body: 'L’envoi de messages depuis le site n’est pas encore ouvert. Vous pouvez joindre l’ONG via sa page Facebook.',
          ctas: [{ label: 'Ouvrir la page Facebook', href: FACEBOOK_URL }],
        },
        {
          // NOUVEAU — à valider par l'ONG
          key: 'localisation',
          heading: 'Notre localisation',
          body: 'Komo-Kango, Gabon',
        },
      ],
    },

    {
      slug: 'confidentialite',
      seoTitle: 'Informations sur vos données — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Informations sur le traitement de votre demande d’adhésion et les moyens de contacter le responsable.',
      h1: 'Informations sur vos données personnelles',
      intro:
        'Cette page explique comment les informations transmises dans une demande d’adhésion seront utilisées et à qui vous pourrez adresser vos questions.',
      sections: [
        {
          key: 'informations',
          heading: 'Informations concernées',
          body: 'Votre nom, vos prénoms, votre téléphone et, si vous les renseignez, votre e-mail, votre lieu de résidence, vos centres d’intérêt et votre motivation. La langue et la date de votre demande sont également associées à son dossier. Le suivi interne comprend son état, les échanges utiles, le responsable chargé du dossier et la décision.',
        },
        {
          key: 'utilisation',
          heading: 'Utilisation',
          body: 'Ces informations servent à recevoir et examiner votre demande d’adhésion, à vous contacter à son sujet et à garder une trace de la décision. Le formulaire ne vous inscrit pas à une newsletter et ne crée pas un profil public.',
        },
        {
          key: 'acces',
          heading: 'Accès',
          body: 'Les personnes autorisées à traiter les demandes au sein de l’ONG.',
        },
        {
          key: 'conservation',
          heading: 'Conservation et sauvegardes',
          body: 'Les demandes ne seront pas conservées sans une règle définie par le responsable.',
        },
        {
          key: 'liens',
          heading: 'Liens externes',
          body: 'Facebook et les médias liés disposent de leurs propres règles de traitement. Consultez leurs informations lorsque vous utilisez leurs services.',
        },
        {
          key: 'fin',
          ctas: [{ label: 'Retour au formulaire', href: '/adhesion' }],
        },
      ],
    },

    {
      slug: 'mentions-legales',
      seoTitle: 'Mentions légales — Terre d’Avenir KOMO-KANGO',
      metaDescription: 'Identification de l’éditeur du site Terre d’Avenir KOMO-KANGO et informations de contact.',
      h1: 'Mentions légales',
      sections: [
        { key: 'editeur', heading: 'Éditeur', body: 'Terre d’Avenir KOMO-KANGO, ONG.' },
        {
          key: 'contenus',
          heading: 'Contenus',
          body: 'Les informations et documents présentés doivent avoir été validés par l’ONG avant publication. Les photographies et autres médias sont utilisés dans la limite des droits obtenus. Les sources externes sont identifiées lorsqu’elles sont reprises.',
        },
        {
          key: 'donnees',
          heading: 'Données personnelles',
          body: 'Consultez la page Informations sur vos données personnelles pour connaître les traitements associés au formulaire d’adhésion.',
        },
        {
          key: 'liens',
          heading: 'Liens',
          body: 'Les liens vers des services externes sont proposés pour accéder à leurs publications ou à leurs moyens de contact.',
        },
        {
          key: 'fin',
          ctas: [
            { label: 'Nous contacter', href: '/contact' },
            { label: 'Informations sur vos données personnelles', href: '/confidentialite' },
          ],
        },
      ],
    },
  ],

  actualites: [
    {
      slug: 'tournoi-komo-kango-terre-davenir',
      order: 1,
      date: '2026-08-08',
      image: 'sport',
      title: 'Le tournoi Komo-Kango Terre d’Avenir',
      category: 'Sport',
      dateLabel: '8 août 2026',
      excerpt: 'La page de l’association annonce le lancement de la deuxième édition au stade municipal de Kango.',
      source: { label: 'Sur Facebook', url: FACEBOOK_URL },
    },
    {
      slug: 'un-jeune-un-permis',
      order: 2,
      image: 'youth',
      title: '« Un jeune, un permis »',
      category: 'Jeunesse',
      dateLabel: 'Initiative publiée',
      excerpt:
        'Une initiative destinée aux jeunes du Komo-Kango, présentée dans les publications de l’association. Retrouvez le communiqué pour connaître les modalités.',
      source: { label: 'Le communiqué', url: FB_PERMIS },
    },
    {
      slug: 'assemblee-generale-decembre-2025',
      order: 3,
      date: '2025-12-21',
      image: 'community',
      title: 'Une assemblée pour penser la suite',
      category: 'Vie associative',
      dateLabel: '21 décembre 2025',
      excerpt: 'À Kango, l’Assemblée générale a permis d’échanger sur les actions menées et les orientations pour 2026.',
      source: { label: 'Lire l’article', url: GABON_OFFICIEL },
    },
  ],

  projets: [
    {
      slug: 'jeunesse-opportunites',
      order: 1,
      icon: 'graduation-cap',
      image: 'education',
      theme: 'Jeunesse & opportunités',
      title: 'Mettre la jeunesse à l’honneur.',
      summary: 'Mettre la jeunesse à l’honneur et faire connaître les initiatives qui lui sont destinées.',
      body: 'Les publications de l’association présentent l’initiative « Un jeune, un permis » et une cérémonie d’hommage aux bacheliers du Komo-Kango.\n\nLes conditions d’accès, le calendrier et la disponibilité de l’initiative doivent être vérifiés dans le communiqué et auprès de l’association.',
      source: { label: 'Consulter la publication', url: FB_PERMIS },
    },
    {
      slug: 'sante-sensibilisation',
      order: 2,
      icon: 'heart-pulse',
      image: 'health',
      theme: 'Santé & sensibilisation',
      title: 'Faire circuler l’information utile.',
      summary: 'Relayer les mobilisations et les informations utiles aux communautés.',
      body: 'La page de l’association relaie une journée de sensibilisation destinée aux femmes du département du Komo-Kango, organisée par la Société Gabonaise de Périnatologie.\n\nRetrouvez la publication pour connaître le contexte de cette action. Cette présentation ne décrit pas un service médical permanent de l’association.',
      source: { label: 'Consulter la publication', url: FB_SANTE },
    },
    {
      slug: 'sport-cohesion',
      order: 3,
      icon: 'trophy',
      image: 'sport',
      theme: 'Sport & cohésion',
      title: 'Se rassembler autour du football.',
      summary: 'Se retrouver autour du football et entretenir les liens.',
      body: 'La page Facebook annonce le lancement de la deuxième édition du tournoi Komo-Kango Terre d’Avenir au stade municipal de Kango, le 8 août 2026.\n\nConsultez les publications de l’association pour les comptes rendus et les informations sur les éditions à venir.',
      source: { label: 'Consulter la publication', url: FACEBOOK_URL },
    },
    {
      slug: 'solidarite-vie-locale',
      order: 4,
      icon: 'handshake',
      image: 'solidarity',
      theme: 'Solidarité & vie locale',
      title: 'Donner une place au dialogue.',
      summary: 'Créer des occasions de dialogue et de rassemblement.',
      body: 'L’Assemblée générale du 21 décembre 2025, organisée dans la salle polyvalente de Kango, a réuni des participants autour du bilan des actions et des orientations pour 2026.\n\nSource : article publié le 23 décembre 2025 par Gabon Officiel.',
      source: { label: 'Lire l’article source', url: GABON_OFFICIEL },
    },
  ],
}
```

## `src/seed/data/en.ts`

Traduction anglaise rédigée pour le lot 1. Elle reprend les libellés du « socle multilingue » des Textes v1.3 (*About the NGO*, *Join us*, *Organization and organization chart*…). Elle garde les mêmes clés, les mêmes liens et le même ordre que la version française, ce que vérifie le test `seed-data`. Les métadonnées de la page « L'ONG », la page Médiathèque et les sections `formulaire` et `localisation` de Contact sont, comme en français, des textes **nouveaux à valider**.

```ts
import { FACEBOOK_URL, FB_PERMIS, FB_SANTE, GABON_OFFICIEL } from './fr'
import type { LocaleContent } from './types'

const REPERES = [
  { title: 'Komo-Kango, Gabon', text: 'Where we are rooted' },
  { title: 'Since February 2025', text: 'A growing movement' },
  { title: 'Solidarity and local development', text: 'Our commitment' },
]

const ANCRAGE = {
  key: 'ancrage',
  eyebrow: 'Where we are rooted',
  heading: 'An NGO rooted in its territory',
  body: 'Our approach brings together, around Komo-Kango, everyone who wishes to contribute to solidarity and local development. Our openness aims to make exchanges easier with people from the region living elsewhere and with organizations wishing to propose cooperation.',
}

const PARTICIPER = {
  key: 'participer',
  heading: 'Take part',
  body: 'Would you like to join the NGO, discuss a contribution or propose a collaboration? Find out how and choose the path that suits your project.',
  ctas: [
    { label: 'Apply for membership', href: '/adhesion' },
    { label: 'Propose a partnership', href: '/partenariats' },
  ],
}

const INTRO_ACCUEIL =
  'Rooted in Komo-Kango, Gabon, Terre d’Avenir brings people together around solidarity and local development. Discover our approach, our documented initiatives and the ways you can take part.'

const DEMARCHE_TEXTE = 'Read the President’s message, our transparency information and the ways you can take part.'

export const en: LocaleContent = {
  reglages: {
    location: 'Komo-Kango, Gabon',
    footerTagline: 'Terre d’Avenir KOMO-KANGO — An NGO rooted in Gabon, open to exchanges and cooperation.',
  },

  pages: [
    {
      slug: 'accueil',
      seoTitle: 'Terre d’Avenir KOMO-KANGO — NGO, solidarity and local development',
      metaDescription:
        'Discover Terre d’Avenir KOMO-KANGO, an NGO rooted in Gabon: its activities, a message from its President, and how to join or propose a partnership.',
      h1: 'From Komo-Kango to the world, *let’s grow* solidarity.',
      intro: INTRO_ACCUEIL,
      sections: [
        {
          key: 'hero',
          eyebrow: 'Komo-Kango, Gabon',
          items: REPERES,
          ctas: [
            { label: 'Join us', href: '/adhesion' },
            { label: 'Discover our activities', href: '/projets' },
          ],
        },
        ANCRAGE,
        {
          key: 'mot',
          heading: 'A message from the President',
          body: 'Our approach is built on local roots and a desire for openness. To residents, to people from the region living elsewhere, to economic actors and to organizations that share this care for communities, we wish to offer a space for meeting and cooperation.',
          ctas: [{ label: 'Read the President’s message', href: '/mot-de-la-presidente' }],
        },
        {
          key: 'engagements',
          heading: 'Commitments to discover',
          ctas: [{ label: 'Discover our activities', href: '/projets' }],
        },
        {
          key: 'actualites',
          heading: 'Life at Terre d’Avenir',
          ctas: [{ label: 'All news', href: '/actualites' }],
        },
        PARTICIPER,
        {
          key: 'transparence',
          heading: 'Information to understand our approach',
          body: 'Browse the presentation materials and approved documents made available. You can also send us a request for information.',
          ctas: [{ label: 'View transparency information', href: '/transparence' }],
        },
      ],
    },

    {
      slug: 'ong',
      seoTitle: 'About the NGO — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Discover Terre d’Avenir KOMO-KANGO, an NGO rooted in Komo-Kango, Gabon, and its approach to solidarity and local development.',
      h1: 'Terre d’Avenir KOMO-KANGO',
      intro: INTRO_ACCUEIL,
      sections: [
        { key: 'reperes', items: REPERES },
        ANCRAGE,
        {
          key: 'engagements',
          heading: 'Commitments to discover',
          ctas: [{ label: 'Discover our activities', href: '/projets' }],
        },
        {
          key: 'demarche',
          heading: 'Discover our approach',
          body: DEMARCHE_TEXTE,
          ctas: [
            { label: 'Read the President’s message', href: '/mot-de-la-presidente' },
            { label: 'Discover our organization', href: '/organisation' },
            { label: 'View transparency information', href: '/transparence' },
            { label: 'Apply for membership', href: '/adhesion' },
          ],
        },
        PARTICIPER,
      ],
    },

    {
      slug: 'mot-de-la-presidente',
      seoTitle: 'A message from the President — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Read the message from the President of Terre d’Avenir KOMO-KANGO and her invitation to take part in the NGO’s work.',
      h1: 'A message from the President',
      intro: 'Making our ties a strength for the future of Komo-Kango.',
      sections: [
        {
          key: 'message',
          body: [
            'Dear daughters and sons of Komo-Kango,\nDear friends and partners,',
            'Our attachment to a land takes on its full meaning when we choose to contribute to its future. Komo-Kango is a place of life, of ties and of transmission. It invites us to look together at the needs of our communities and at the opportunities we can help grow.',
            'With Terre d’Avenir KOMO-KANGO, we wish to bring energies together around one conviction: solidarity is built through listening, dialogue and commitment. Youth, health, sport and local life offer many opportunities to come together and to reflect on useful contributions to our territory.',
            'Our approach is built on local roots and a desire for openness. To residents, to people from the region living elsewhere, to economic actors and to organizations that share this care for communities, we wish to offer a space for meeting and cooperation.',
            'This website aims to make our approach clearer, to present our documented initiatives and to make exchanges easier. It should also allow those who wish to join us to express their interest within a clear framework.',
            'I invite you to discover our activities, to share your ideas with us and, if you wish to get involved alongside us, to submit a membership application. The terms of participation will be clarified with the NGO so that everyone understands the approach and the place they can take in it.',
            'Together, let us turn our attachment to Komo-Kango into a shared will to act for its future.',
            'Thank you for your interest and for the attention you give to our territory.',
          ].join('\n\n'),
          ctas: [
            { label: 'Apply for membership', href: '/adhesion' },
            { label: 'Discover our activities', href: '/projets' },
            { label: 'Discover our organization', href: '/organisation' },
          ],
        },
      ],
    },

    {
      slug: 'organisation',
      seoTitle: 'Organization and organization chart — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Discover how Terre d’Avenir KOMO-KANGO is organized, its roles and the people presented with the NGO’s approval.',
      h1: 'Our organization',
      intro: 'Understanding the roles, responsibilities and links within Terre d’Avenir KOMO-KANGO.',
      sections: [
        {
          key: 'organigramme',
          heading: 'Our organization chart',
          body: 'The presentation of our organization is being prepared. You can read the President’s message or contact the NGO.',
        },
        {
          key: 'demarche',
          heading: 'Discover our approach',
          body: DEMARCHE_TEXTE,
          ctas: [
            { label: 'Read the President’s message', href: '/mot-de-la-presidente' },
            { label: 'View transparency information', href: '/transparence' },
            { label: 'Apply for membership', href: '/adhesion' },
            { label: 'Contact the NGO', href: '/contact' },
          ],
        },
        {
          key: 'faq',
          items: [
            {
              title: 'How can I contact the NGO?',
              text: 'Use the contact options presented on our Contact page. The personal contact details of officers are not published automatically.',
            },
          ],
        },
      ],
    },

    {
      slug: 'projets',
      seoTitle: 'Projects and activities — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Explore the documented initiatives of Terre d’Avenir KOMO-KANGO in youth, awareness-raising, sport and solidarity.',
      h1: 'Initiatives to discover',
      intro:
        'Terre d’Avenir’s publications and gatherings highlight several areas of commitment. Discover their context and access the available information.',
      sections: [
        {
          key: 'fin',
          ctas: [
            { label: 'Apply for membership', href: '/adhesion' },
            { label: 'Propose a collaboration', href: '/partenariats' },
          ],
        },
        {
          key: 'vide',
          body: 'No initiative has been published in this section yet. Browse our news or contact the NGO to find out more.',
        },
      ],
    },

    {
      slug: 'actualites',
      seoTitle: 'News — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Follow the documented publications, initiatives and gatherings of Terre d’Avenir KOMO-KANGO and find their sources.',
      h1: 'Life at Terre d’Avenir',
      intro:
        'Find the latest news about our initiatives and gatherings. The dates shown refer to documented events; they do not mean that registration is open.',
      sections: [
        {
          key: 'liste',
          eyebrow: 'Life of the association',
          heading: 'News from the territory.',
          ctas: [{ label: 'All posts on Facebook', href: FACEBOOK_URL }],
        },
        {
          key: 'fin',
          ctas: [
            { label: 'Discover our activities', href: '/projets' },
            { label: 'Join us', href: '/adhesion' },
          ],
        },
        { key: 'vide', body: 'No news has been published in this language yet.' },
      ],
    },

    {
      slug: 'adhesion',
      seoTitle: 'Membership — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Find out how to become a member of Terre d’Avenir KOMO-KANGO and submit your application for review by the NGO.',
      h1: 'Join Terre d’Avenir KOMO-KANGO',
      intro:
        'Would you like to get involved alongside us? Introduce yourself and tell us you wish to join the NGO. Your application will be reviewed according to the membership terms set by Terre d’Avenir KOMO-KANGO.',
      sections: [
        {
          key: 'indisponible',
          body: 'Online membership applications are not open yet. You can contact the NGO through its Facebook page to learn more about the process.',
          ctas: [
            { label: 'Open the Facebook page', href: FACEBOOK_URL },
            { label: 'Contact the NGO', href: '/contact' },
          ],
        },
        {
          key: 'etapes',
          heading: 'A three-step process',
          items: [
            { text: 'You complete your application.' },
            { text: 'The NGO reviews the information provided and contacts you if needed.' },
            { text: 'You are informed of the decision and the terms of your participation.' },
          ],
        },
        {
          key: 'formulaire',
          heading: 'Your membership application',
          body: 'Fields marked with an asterisk are required to process your application. Submitting the form does not mean automatic admission.',
        },
        {
          key: 'faq',
          heading: 'Before you apply',
          items: [
            {
              title: 'Does submitting the form make me a member?',
              text: 'No. The form lets you send an application. The NGO will inform you of its decision and the applicable terms.',
            },
            {
              title: 'Is there a membership fee?',
              text: 'The membership conditions, including any fee, will be specified by the NGO. No payment is requested in this form.',
            },
            {
              title: 'Can I get in touch from abroad?',
              text: 'You can tell us about your interest and indicate where you live. Opportunities to take part will be reviewed with the NGO; the admission criteria are still to be defined.',
            },
            {
              title: 'When will I receive an answer?',
              text: 'The NGO will contact you using the details you provided. No processing time is announced at this stage.',
            },
          ],
        },
      ],
    },

    {
      slug: 'mediatheque',
      seoTitle: 'Media library — Terre d’Avenir KOMO-KANGO',
      metaDescription: 'Photos and videos published by Terre d’Avenir KOMO-KANGO.',
      h1: 'Media library',
      intro: 'Find the photos and videos published by Terre d’Avenir KOMO-KANGO.',
      sections: [
        {
          key: 'vide',
          body: 'No media has been published in the library yet. Find the association’s posts on Facebook.',
        },
        {
          key: 'facebook',
          heading: 'Follow the life of the association',
          ctas: [{ label: 'See the posts on Facebook', href: FACEBOOK_URL }],
        },
      ],
    },

    {
      slug: 'partenariats',
      seoTitle: 'Partnerships — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Present a cooperation project to Terre d’Avenir KOMO-KANGO and discuss a contribution to local development and solidarity.',
      h1: 'Building useful partnerships',
      intro:
        'Do you represent a company, a foundation, an NGO, an institution or a collective? We want to make it easier to discuss the needs of the territory and possible contributions.',
      sections: [
        {
          key: 'proposition',
          heading: 'A proposal to discuss together',
          body: 'A collaboration can start with sharing expertise, an idea for action or an introduction. Present your organization, your project and how you would like to contribute. The possibilities will be reviewed with the NGO.',
        },
        {
          key: 'informations',
          heading: 'Useful information for a first exchange',
          body: 'The name of your organization, your country, the planned project, the proposed contribution and the contact details of your representative will help guide the discussion. A first contact does not create a partnership or any permission to use the logo.',
        },
        {
          key: 'presse',
          heading: 'Press and information',
          body: 'Are you preparing an article or looking for information about Terre d’Avenir? Send your request to the NGO. Institutional materials and authorized media can be specified as part of this exchange.',
        },
        {
          key: 'fin',
          ctas: [
            { label: 'Present a partnership', href: '/contact#partenariat' },
            { label: 'See our activities', href: '/projets' },
            { label: 'View transparency information', href: '/transparence' },
          ],
        },
      ],
    },

    {
      slug: 'transparence',
      seoTitle: 'Transparency and documents — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'View the approved institutional information and documents made available by Terre d’Avenir KOMO-KANGO, or send a request for information.',
      h1: 'Understanding our approach',
      intro:
        'This section is intended to present the validated institutional information, documents and results that the NGO wishes to make available.',
      sections: [
        {
          key: 'documents',
          heading: 'Institutional documents',
          body: 'No public document is available in this section yet. You can send a request for information to the NGO.',
          ctas: [{ label: 'Request a document', href: '/contact' }],
        },
        {
          key: 'resultats',
          heading: 'Documented activities and results',
          body: 'We want to present our activities in their context and publish results once they have been established and validated. Discover the initiatives already documented in the Projects & activities section.',
          ctas: [{ label: 'See the initiatives', href: '/projets' }],
        },
      ],
    },

    {
      slug: 'contact',
      seoTitle: 'Contact — Terre d’Avenir KOMO-KANGO',
      metaDescription:
        'Contact Terre d’Avenir KOMO-KANGO with a question, a membership application or a cooperation proposal.',
      h1: 'Get in touch',
      intro:
        'Would you like to know more about the NGO, join us or propose a collaboration? Choose the path that matches your request.',
      sections: [
        {
          key: 'adhesion',
          heading: 'Membership',
          body: 'Submit your application in the dedicated area. It will then be reviewed by the NGO, according to terms still to be specified.',
          ctas: [{ label: 'Go to membership', href: '/adhesion' }],
        },
        {
          key: 'partenariat',
          heading: 'Partnerships and press',
          body: 'Present your organization or the subject of your request, your country and a way to get back to you.',
          ctas: [{ label: 'Contact us on Facebook', href: FACEBOOK_URL }],
        },
        {
          key: 'question',
          heading: 'Another question',
          body: 'Visit our Komo-Kango Terre d’Avenir page to send us your request.',
          ctas: [{ label: 'Open the Facebook page', href: FACEBOOK_URL }],
        },
        {
          key: 'formulaire',
          heading: 'Send a message',
          body: 'Sending messages from the website is not available yet. You can reach the NGO through its Facebook page.',
          ctas: [{ label: 'Open the Facebook page', href: FACEBOOK_URL }],
        },
        {
          key: 'localisation',
          heading: 'Where we are',
          body: 'Komo-Kango, Gabon',
        },
      ],
    },

    {
      slug: 'confidentialite',
      seoTitle: 'Information about your data — Terre d’Avenir KOMO-KANGO',
      metaDescription: 'Information on how your membership application is processed and how to contact the person responsible.',
      h1: 'Personal data information',
      intro:
        'This page explains how the information provided in a membership application will be used and who you can contact with your questions.',
      sections: [
        {
          key: 'informations',
          heading: 'Information concerned',
          body: 'Your last name, first names, phone number and, if you provide them, your email, place of residence, areas of interest and motivation. The language and date of your application are also associated with its file. Internal follow-up includes its status, relevant exchanges, the person in charge of the file and the decision.',
        },
        {
          key: 'utilisation',
          heading: 'Use',
          body: 'This information is used to receive and review your membership application, to contact you about it and to keep a record of the decision. The form does not subscribe you to a newsletter and does not create a public profile.',
        },
        {
          key: 'acces',
          heading: 'Access',
          body: 'The people authorized to process applications within the NGO.',
        },
        {
          key: 'conservation',
          heading: 'Retention and backups',
          body: 'Applications will not be kept without a rule defined by the person responsible.',
        },
        {
          key: 'liens',
          heading: 'External links',
          body: 'Facebook and the linked media have their own data processing rules. Check their information when you use their services.',
        },
        {
          key: 'fin',
          ctas: [{ label: 'Back to the form', href: '/adhesion' }],
        },
      ],
    },

    {
      slug: 'mentions-legales',
      seoTitle: 'Legal notice — Terre d’Avenir KOMO-KANGO',
      metaDescription: 'Identification of the publisher of the Terre d’Avenir KOMO-KANGO website and contact information.',
      h1: 'Legal notice',
      sections: [
        { key: 'editeur', heading: 'Publisher', body: 'Terre d’Avenir KOMO-KANGO, NGO.' },
        {
          key: 'contenus',
          heading: 'Content',
          body: 'The information and documents presented must have been validated by the NGO before publication. Photographs and other media are used within the limits of the rights obtained. External sources are identified when they are quoted.',
        },
        {
          key: 'donnees',
          heading: 'Personal data',
          body: 'See the Personal data information page to learn about the processing associated with the membership form.',
        },
        {
          key: 'liens',
          heading: 'Links',
          body: 'Links to external services are provided to access their publications or contact options.',
        },
        {
          key: 'fin',
          ctas: [
            { label: 'Contact us', href: '/contact' },
            { label: 'Personal data information', href: '/confidentialite' },
          ],
        },
      ],
    },
  ],

  actualites: [
    {
      slug: 'tournoi-komo-kango-terre-davenir',
      order: 1,
      date: '2026-08-08',
      image: 'sport',
      title: 'The Komo-Kango Terre d’Avenir tournament',
      category: 'Sport',
      dateLabel: '8 August 2026',
      excerpt: 'The association’s page announces the launch of the second edition at the Kango municipal stadium.',
      source: { label: 'On Facebook', url: FACEBOOK_URL },
    },
    {
      slug: 'un-jeune-un-permis',
      order: 2,
      image: 'youth',
      title: '“One young person, one licence”',
      category: 'Youth',
      dateLabel: 'Published initiative',
      excerpt:
        'An initiative for young people from Komo-Kango, presented in the association’s posts. See the announcement for the terms.',
      source: { label: 'The announcement', url: FB_PERMIS },
    },
    {
      slug: 'assemblee-generale-decembre-2025',
      order: 3,
      date: '2025-12-21',
      image: 'community',
      title: 'A general assembly to plan what comes next',
      category: 'Association life',
      dateLabel: '21 December 2025',
      excerpt: 'In Kango, the General Assembly provided an opportunity to discuss the activities carried out and the priorities for 2026.',
      source: { label: 'Read the article', url: GABON_OFFICIEL },
    },
  ],

  projets: [
    {
      slug: 'jeunesse-opportunites',
      order: 1,
      icon: 'graduation-cap',
      image: 'education',
      theme: 'Youth & opportunities',
      title: 'Putting young people in the spotlight.',
      summary: 'Putting young people in the spotlight and raising awareness of the initiatives designed for them.',
      body: 'The association’s posts present the “One young person, one licence” initiative and a ceremony honouring Komo-Kango’s baccalaureate graduates.\n\nThe eligibility conditions, schedule and availability of the initiative should be checked in the announcement and with the association.',
      source: { label: 'See the post', url: FB_PERMIS },
    },
    {
      slug: 'sante-sensibilisation',
      order: 2,
      icon: 'heart-pulse',
      image: 'health',
      theme: 'Health & awareness',
      title: 'Sharing useful information.',
      summary: 'Relaying mobilizations and information that is useful to communities.',
      body: 'The association’s page relays an awareness day for women of the Komo-Kango department, organized by the Gabonese Society of Perinatology.\n\nSee the post for the context of this action. This presentation does not describe a permanent medical service provided by the association.',
      source: { label: 'See the post', url: FB_SANTE },
    },
    {
      slug: 'sport-cohesion',
      order: 3,
      icon: 'trophy',
      image: 'sport',
      theme: 'Sport & cohesion',
      title: 'Coming together around football.',
      summary: 'Getting together around football and strengthening ties.',
      body: 'The Facebook page announces the launch of the second edition of the Komo-Kango Terre d’Avenir tournament at the Kango municipal stadium on 8 August 2026.\n\nSee the association’s posts for reports and information about upcoming editions.',
      source: { label: 'See the post', url: FACEBOOK_URL },
    },
    {
      slug: 'solidarite-vie-locale',
      order: 4,
      icon: 'handshake',
      image: 'solidarity',
      theme: 'Solidarity & local life',
      title: 'Making room for dialogue.',
      summary: 'Creating opportunities for dialogue and gathering.',
      body: 'The General Assembly of 21 December 2025, held in the Kango multi-purpose hall, brought participants together to review activities and discuss priorities for 2026.\n\nSource: article published on 23 December 2025 by Gabon Officiel.',
      source: { label: 'Read the source article', url: GABON_OFFICIEL },
    },
  ],
}
```
