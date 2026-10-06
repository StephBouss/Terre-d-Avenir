import { describe, expect, it } from 'vitest'
import { NAV_ITEMS, STATIC_PATHS } from '@/lib/routes'

describe('routes', () => {
  it('liste les 13 routes statiques', () => {
    expect(STATIC_PATHS).toHaveLength(13)
  })
  it('le menu suit la maquette Banani', () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual(['/ong', '/mot-de-la-presidente', '/organisation', '/projets', '/actualites', '/mediatheque', '/contact'])
  })
})
