import { describe, expect, it } from 'vitest'
import { NAV_ITEMS, STATIC_PATHS, pageSlugForPath } from '@/lib/routes'

describe('routes', () => {
  it('associe chaque chemin à un slug de page', () => {
    expect(pageSlugForPath('/')).toBe('accueil')
    expect(pageSlugForPath('/mot-de-la-presidente')).toBe('mot-de-la-presidente')
    expect(STATIC_PATHS).toHaveLength(13)
  })
  it('le menu suit la maquette Banani', () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual(['/ong', '/mot-de-la-presidente', '/organisation', '/projets', '/actualites', '/mediatheque', '/contact'])
  })
})
