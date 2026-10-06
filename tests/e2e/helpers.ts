import { STATIC_PATHS } from '../../src/lib/routes'

const ACTUALITES = ['tournoi-komo-kango-terre-davenir', 'un-jeune-un-permis', 'assemblee-generale-decembre-2025']
const PROJETS = ['jeunesse-opportunites', 'sante-sensibilisation', 'sport-cohesion', 'solidarite-vie-locale']

export function ALL_PATHS(locale: 'fr' | 'en'): string[] {
  const paths = [...STATIC_PATHS, ...ACTUALITES.map((s) => `/actualites/${s}`), ...PROJETS.map((s) => `/projets/${s}`)]
  return paths.map((p) => (p === '/' ? `/${locale}` : `/${locale}${p}`))
}
