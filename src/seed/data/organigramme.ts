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
