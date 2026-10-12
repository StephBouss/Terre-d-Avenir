import { describe, expect, it } from 'vitest'
import { Actualites } from '@/collections/Actualites'
import { Medias } from '@/collections/Medias'
import { Messages } from '@/collections/Messages'
import { Pages } from '@/collections/Pages'
import { Postes } from '@/collections/Postes'
import { Projets } from '@/collections/Projets'
import { Users, regleRoles } from '@/collections/Users'
import { Reglages } from '@/globals/Reglages'
import { PREREGLAGES } from '@/lib/permissions'

const anonymous = { req: { user: null } } as never
const admin = { req: { user: { id: 1, role: 'administrateur' } } } as never
const redaction = { req: { user: { id: 2, role: 'redaction', acces: PREREGLAGES.redaction } } } as never
const secretariat = { req: { user: { id: 3, role: 'secretariat', acces: PREREGLAGES.secretariat } } } as never

describe("droits de lecture de l'API", () => {
  it('actualités : un visiteur ne lit que les actualités publiées, un compte autorisé lit tout', () => {
    const read = Actualites.access!.read!
    const publiees = { and: [{ _status: { equals: 'published' } }, { archivee: { not_equals: true } }] }
    expect(read(anonymous)).toEqual(publiees)
    expect(read(admin)).toBe(true)
    expect(read(redaction)).toBe(true)
  })

  it.each([
    ['pages', Pages.access!.read!],
    ['projets', Projets.access!.read!],
    ['reglages', Reglages.access!.read!],
  ])('%s : réservé aux comptes autorisés', (_name, read) => {
    expect(read(anonymous)).toBe(false)
    expect(read(admin)).toBe(true)
    expect(read(secretariat)).toBe(false)
  })
})

describe('modification selon le module', () => {
  it('rédaction : modifie les actualités, lit l’organigramme sans le modifier', () => {
    expect(Actualites.access!.update!(redaction)).toBe(true)
    expect(Postes.access!.read!(redaction)).toBe(true)
    expect(Postes.access!.update!(redaction)).toBe(false)
    expect(Postes.access!.delete!(redaction)).toBe(false)
  })

  it('médias : envoi pour tout module en modification, retouche réservée à la médiathèque', () => {
    expect(Medias.access!.create!(secretariat)).toBe(true)
    expect(Medias.access!.update!(secretariat)).toBe(false)
    expect(Medias.access!.update!(redaction)).toBe(true)
    expect(Medias.access!.create!(anonymous)).toBe(false)
  })

  it('menu : un module sans accès est masqué', () => {
    const masque = Pages.admin!.hidden as (a: { user: unknown }) => boolean
    expect(masque({ user: { role: 'secretariat', acces: PREREGLAGES.secretariat } })).toBe(true)
    expect(masque({ user: { role: 'administrateur' } })).toBe(false)
  })
})

describe('comptes', () => {
  const req = (user: unknown, totalDocs: number, id?: number) => ({ id, req: { user, payload: { count: async () => ({ totalDocs }) } } }) as never
  const adminUser = { id: 1, role: 'administrateur' }

  it('création : le premier compte, puis par l’administrateur seul, 3 comptes au plus', async () => {
    const create = Users.access!.create!
    expect(await create(req(null, 0))).toBe(true)
    expect(await create(req(null, 1))).toBe(false)
    expect(await create(req(adminUser, 1))).toBe(true)
    expect(await create(req(adminUser, 2))).toBe(true)
    expect(await create(req(adminUser, 3))).toBe(false)
    expect(await create(req({ id: 2, role: 'redaction' }, 2))).toBe(false)
  })

  it('suppression : par l’administrateur, jamais son propre compte', async () => {
    const del = Users.access!.delete!
    expect(await del(req(adminUser, 2, 2))).toBe(true)
    expect(await del(req(adminUser, 2, 1))).toBe(false)
    expect(await del(req({ id: 2, role: 'redaction' }, 2, 3))).toBe(false)
    expect(await del(req(null, 2, 2))).toBe(false)
  })

  it('lecture : l’administrateur voit tout, un compte limité seulement le sien', () => {
    const read = Users.access!.read!
    expect(read(req(adminUser, 2))).toBe(true)
    expect(read(req({ id: 2, role: 'redaction' }, 2))).toEqual({ id: { equals: 2 } })
    expect(read(req(null, 2))).toBe(false)
  })

  describe('garde-fous des rôles', () => {
    const appel = (data: Record<string, unknown>, operation: 'create' | 'update', total: number, originalDoc?: Record<string, unknown>) =>
      regleRoles({ data, operation, originalDoc, req: { payload: { count: async () => ({ totalDocs: total }) } } } as never)

    it('le premier compte devient l’administrateur', async () => {
      expect(await appel({ email: 'a@b.c', role: 'redaction' }, 'create', 0)).toMatchObject({ role: 'administrateur' })
    })
    it('un seul administrateur, et 3 comptes au plus', async () => {
      await expect(appel({ role: 'administrateur' }, 'create', 1)).rejects.toThrow('un administrateur principal')
      await expect(appel({ role: 'redaction' }, 'create', 3)).rejects.toThrow('Limite atteinte')
      await expect(appel({ role: 'administrateur' }, 'update', 2, { role: 'redaction' })).rejects.toThrow('un administrateur principal')
    })
    it('sans accès précisés, le rôle type s’applique', async () => {
      expect(await appel({ role: 'secretariat' }, 'create', 1)).toMatchObject({ acces: PREREGLAGES.secretariat })
    })
    it('l’administrateur ne peut pas être rétrogradé', async () => {
      expect(await appel({ role: 'redaction' }, 'update', 2, { role: 'administrateur' })).toMatchObject({ role: 'administrateur' })
    })
  })
})

describe('messages reçus', () => {
  it('lecture et modification selon le module ; création toujours refusée par l’API', () => {
    const { read, create, update, delete: del } = Messages.access!
    expect(read!(anonymous)).toBe(false)
    expect(read!(admin)).toBe(true)
    expect(read!(redaction)).toBe(false)
    expect(create!(admin)).toBe(false)
    expect(update!(secretariat)).toBe(true)
    expect(update!(redaction)).toBe(false)
    expect(del!(anonymous)).toBe(false)
    expect(del!(admin)).toBe(true)
  })
})

describe('organigramme', () => {
  it('un visiteur ne lit que les postes publiés, un compte autorisé lit tout', () => {
    const read = Postes.access!.read!
    expect(read(anonymous)).toEqual({ _status: { equals: 'published' } })
    expect(read(admin)).toBe(true)
  })
})
