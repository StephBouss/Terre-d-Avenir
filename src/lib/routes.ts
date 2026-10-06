export const STATIC_PATHS = [
  '/',
  '/ong',
  '/mot-de-la-presidente',
  '/organisation',
  '/projets',
  '/actualites',
  '/adhesion',
  '/mediatheque',
  '/partenariats',
  '/transparence',
  '/contact',
  '/confidentialite',
  '/mentions-legales',
] as const

export type NavKey =
  | 'ong'
  | 'mot'
  | 'organisation'
  | 'projets'
  | 'actualites'
  | 'mediatheque'
  | 'contact'
  | 'adhesion'
  | 'partenariats'
  | 'transparence'
  | 'confidentialite'
  | 'mentions'

export const NAV_ITEMS: { key: NavKey; href: string }[] = [
  { key: 'ong', href: '/ong' },
  { key: 'mot', href: '/mot-de-la-presidente' },
  { key: 'organisation', href: '/organisation' },
  { key: 'projets', href: '/projets' },
  { key: 'actualites', href: '/actualites' },
  { key: 'mediatheque', href: '/mediatheque' },
  { key: 'contact', href: '/contact' },
]

export const FOOTER_PRIMARY: { key: NavKey; href: string }[] = NAV_ITEMS.filter((i) => i.key !== 'contact')

export const FOOTER_UTILITY: { key: NavKey; href: string }[] = [
  { key: 'adhesion', href: '/adhesion' },
  { key: 'partenariats', href: '/partenariats' },
  { key: 'transparence', href: '/transparence' },
  { key: 'contact', href: '/contact' },
  { key: 'confidentialite', href: '/confidentialite' },
  { key: 'mentions', href: '/mentions-legales' },
]
