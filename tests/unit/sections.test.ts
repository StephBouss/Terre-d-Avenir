import { describe, expect, it } from 'vitest'
import { getSection } from '@/lib/sections'
import { PAGE_SLUGS } from '@/collections/Pages'
import { STATIC_PATHS } from '@/lib/routes'

describe('sections', () => {
  const page = { sections: [{ key: 'hero', heading: 'A' }, { key: 'mot', heading: 'B' }] }
  it('trouve une section par clé', () => {
    expect(getSection(page as never, 'mot')?.heading).toBe('B')
    expect(getSection(page as never, 'absent')).toBeUndefined()
    expect(getSection(null, 'mot')).toBeUndefined()
  })
  it('chaque route statique a une page Payload', () => {
    for (const path of STATIC_PATHS) expect(PAGE_SLUGS).toContain(path === '/' ? 'accueil' : path.slice(1))
  })
})
