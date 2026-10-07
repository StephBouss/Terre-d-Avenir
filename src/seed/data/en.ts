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

  albums: [
    {
      slug: "kafele-nianame-2026-09",
      order: 0,
      date: "2026-09-04",
      cover: "kafele-6",
      photos: ["kafele-1", "kafele-2", "kafele-3", "kafele-4", "kafele-5", "kafele-6"],
      title: "Kafélé and Nianame: a health centre and a school rehabilitated",
      dateLabel: "4 September 2026",
      description: "Handover of the rehabilitation works at the Kafélé health centre and the Nianame public community school, on 4 September 2026.",
    },
    {
      slug: "tournoi-football-2026-08",
      order: 1,
      date: "2026-08-26",
      cover: "tournoi-3",
      photos: ["tournoi-1", "tournoi-2", "tournoi-3", "tournoi-4", "tournoi-5", "tournoi-6"],
      title: "2nd Komo-Kango Terre d’Avenir football tournament: the final",
      dateLabel: "26 August 2026",
      description: "Final of the 2nd edition of the Komo-Kango Terre d’Avenir football tournament, on 26 August 2026.",
    },
    {
      slug: "rencontre-populations-2026-08",
      order: 2,
      date: "2026-08-19",
      cover: "rencontre-1",
      photos: ["rencontre-1", "rencontre-2", "rencontre-3", "rencontre-4", "rencontre-5"],
      title: "Close to the people of Kango",
      dateLabel: "19 August 2026",
      description: "Mrs Laurence Ndong meeting the people of Komo-Kango, published on 19 August 2026.",
    },
  ],

  actualites: [
    {
      slug: "kafele-nianame-rehabilitation",
      order: 0,
      date: "2026-09-04",
      image: "kafele-6",
      album: "kafele-nianame-2026-09",
      title: "Kafélé and Nianame: a health centre and a school rehabilitated",
      category: "Association life",
      dateLabel: "4 September 2026",
      excerpt: "Handover of the rehabilitation works at the Kafélé health centre and the Nianame public community school, attended by the association’s President.",
      body: "Mrs Laurence Ndong, Minister of the Civil Service and Capacity Building and President of the Komo-Kango Terre d’Avenir association, joined officials from the Ministry of Mines and Geological Resources for the handover of the rehabilitation works at the Kafélé health centre and the Nianame public community school.\n\nCarried out by Xiang Wei Gabon as part of its corporate social responsibility (CSR) programme, the works bring tangible improvements to access to healthcare and to learning conditions for local people. They were executed by Construction du Komo SARL, a local small business: the President welcomed this choice, which supports entrepreneurship and youth employment.\n\nIn Nianame, school supplies were handed out to the pupils. In Kafélé, a commitment was made to help equip the health centre so that it becomes fully operational.\n\nThe President also raised awareness among local people of the importance of Fund 4 of the CNAMGS and called for greater mobilisation of public and private actors for local development, in line with the vision of the President of the Republic, Head of State and Head of Government, His Excellency Brice Clotaire Oligui Nguema.",
      source: { label: "On Facebook", url: FACEBOOK_URL },
    },
    {
      slug: "tournoi-football-finale-2026",
      order: 1,
      date: "2026-08-26",
      image: "tournoi-3",
      album: "tournoi-football-2026-08",
      title: "2nd Komo-Kango Terre d’Avenir football tournament: the final",
      category: "Sport",
      dateLabel: "26 August 2026",
      excerpt: "The kick-off of the final of the 2nd edition was given by the tournament’s patron, Mrs Laurence Ndong, and by the Minister in charge of Sports, Mr Paul Ulrich Kessany.",
      body: "On 26 August 2026, the final of the 2nd edition of the Komo-Kango Terre d’Avenir football tournament brought to a close a competition that opened on 8 August.\n\nThe kick-off was given by the tournament’s patron, Mrs Laurence Ndong, Minister of the Civil Service and Capacity Building and President of the association, alongside her fellow Minister in charge of Sports, Mr Paul Ulrich Kessany.\n\nBefore the match, the two finalist teams, the referees and the guests lined up on the pitch, in front of a large crowd in the stands.",
      source: { label: "On Facebook", url: FACEBOOK_URL },
    },
    {
      slug: "rencontre-populations-komo-kango",
      order: 2,
      date: "2026-08-19",
      image: "rencontre-1",
      album: "rencontre-populations-2026-08",
      title: "Close to the people of Kango",
      category: "Association life",
      dateLabel: "19 August 2026",
      excerpt: "Setting protocol aside, Mrs Laurence Ndong went to meet the people of Komo-Kango: attentive listening, frank discussions and advice.",
      body: "Always happy to be among her own, Mrs Laurence Ndong, President of the association, affectionately known as “Maman Lolo”, went to meet the people of Komo-Kango.\n\nAttentive listening, frank discussions, prompt handling of requests, conversations and advice: setting protocol aside, she remains true to her principles of closeness, availability and listening to the people of Kango.\n\nSimple, warm moments that reflect a bond she is keen to preserve with the people of Komo-Kango.",
      source: { label: "On Facebook", url: FACEBOOK_URL },
    },
    {
      slug: 'tournoi-komo-kango-terre-davenir',
      order: 3,
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
      order: 4,
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
      order: 5,
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
