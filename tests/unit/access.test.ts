import { describe, expect, it } from 'vitest'
import { Actualites } from '@/collections/Actualites'
import { Pages } from '@/collections/Pages'
import { Projets } from '@/collections/Projets'
import { Reglages } from '@/globals/Reglages'

const anonymous = { req: { user: null } } as never
const admin = { req: { user: { id: 1 } } } as never

describe("droits de lecture de l'API", () => {
  it('actualités : un visiteur ne lit que les actualités publiées, un admin lit tout', () => {
    const read = Actualites.access!.read!
    expect(read(anonymous)).toEqual({ and: [{ _status: { equals: 'published' } }, { archivee: { not_equals: true } }] })
    expect(read(admin)).toBe(true)
  })

  it.each([
    ['pages', Pages.access!.read!],
    ['projets', Projets.access!.read!],
    ['reglages', Reglages.access!.read!],
  ])('%s : réservé aux admins connectés', (_name, read) => {
    expect(read(anonymous)).toBe(false)
    expect(read(admin)).toBe(true)
  })
})
