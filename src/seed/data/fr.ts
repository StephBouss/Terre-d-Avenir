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
