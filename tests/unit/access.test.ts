import { describe, expect, it } from 'vitest'
import { Actualites } from '@/collections/Actualites'
import { Pages } from '@/collections/Pages'
import { Projets } from '@/collections/Projets'
import { Users } from '@/collections/Users'
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

describe('compte admin unique', () => {
  const req = (user: unknown, totalDocs: number) => ({ req: { user, payload: { count: async () => ({ totalDocs }) } } }) as never

  it('création : seulement tant qu’aucun compte n’existe, même pour un admin connecté', async () => {
    const create = Users.access!.create!
    expect(await create(req(null, 0))).toBe(true)
    expect(await create(req(null, 1))).toBe(false)
    expect(await create(req({ id: 1 }, 1))).toBe(false)
  })

  it('suppression : jamais le dernier compte, jamais sans connexion', async () => {
    const del = Users.access!.delete!
    expect(await del(req({ id: 1 }, 1))).toBe(false)
    expect(await del(req({ id: 1 }, 2))).toBe(true)
    expect(await del(req(null, 2))).toBe(false)
  })
})
