import { APIError, ValidationError } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { bloquerSuppressionParent, validerRattachement } from '@/hooks/postes'
import { MESSAGES_RATTACHEMENT, MESSAGE_SUPPRESSION, idDe, verifierRattachement } from '@/lib/organigramme'

/** Postes en base : id → parent (null = racine). Un id absent = poste inexistant. */
const lecteur = (parents: Record<string, number | null>) => async (id: number | string) => (String(id) in parents ? parents[String(id)] : undefined)

describe('identifiant d’un rattachement', () => {
  it('id brut, document peuplé ou vide', () => {
    expect(idDe(3)).toBe(3)
    expect(idDe({ id: 4, intitule: 'x' })).toBe(4)
    expect(idDe(null)).toBeNull()
    expect(idDe(undefined)).toBeNull()
    expect(idDe('')).toBeNull()
  })
})

describe('vérification d’un rattachement', () => {
  const base = { '1': null, '2': 1, '3': 2, '4': 3 } // 1 ← 2 ← 3 ← 4

  it('sans parent, ou vers un poste existant hors de sa descendance : accepté', async () => {
    expect(await verifierRattachement(4, null, lecteur(base))).toBeNull()
    expect(await verifierRattachement(4, 1, lecteur(base))).toBeNull()
    expect(await verifierRattachement(null, 3, lecteur(base))).toBeNull() // création
  })
  it('auto-rattachement refusé', async () => {
    expect(await verifierRattachement(2, 2, lecteur(base))).toBe(MESSAGES_RATTACHEMENT.lui)
  })
  it('boucle refusée, même lointaine', async () => {
    expect(await verifierRattachement(1, 2, lecteur(base))).toBe(MESSAGES_RATTACHEMENT.boucle)
    expect(await verifierRattachement(1, 4, lecteur(base))).toBe(MESSAGES_RATTACHEMENT.boucle)
  })
  it('parent absent refusé', async () => {
    expect(await verifierRattachement(4, 99, lecteur(base))).toBe(MESSAGES_RATTACHEMENT.absent)
  })
  it('une anomalie plus haut dans la chaîne (ancêtre absent, boucle sans lien) ne bloque pas ce poste', async () => {
    expect(await verifierRattachement(9, 2, lecteur({ '2': 7 }))).toBeNull()
    expect(await verifierRattachement(9, 5, lecteur({ '5': 6, '6': 5 }))).toBeNull()
  })
})

const reqParents = (parents: Record<string, number | null>) =>
  ({ payload: { findByID: vi.fn(async ({ id }: { id: number }) => (String(id) in parents ? { id, parent: parents[String(id)] } : null)) } }) as never

describe('hook de validation des postes', () => {
  it('lève une erreur de validation sur le champ parent, avec le message explicite', async () => {
    const appel = validerRattachement({ data: { parent: 2 }, originalDoc: { id: 1 }, req: reqParents({ '1': null, '2': 1 }) } as never)
    await expect(appel).rejects.toBeInstanceOf(ValidationError)
    await expect(appel).rejects.toMatchObject({ data: { errors: [{ path: 'parent', message: MESSAGES_RATTACHEMENT.boucle }] } })
  })
  it('laisse passer une modification qui ne touche pas au parent', async () => {
    const data = { ordre: 3 }
    expect(await validerRattachement({ data, originalDoc: { id: 1 }, req: reqParents({}) } as never)).toBe(data)
  })
})

describe('hook de suppression des postes', () => {
  const reqEnfants = (publies: number, brouillons: number) =>
    ({ payload: { find: vi.fn(async ({ draft }: { draft?: boolean }) => ({ totalDocs: draft ? brouillons : publies })) } }) as never

  it('refusée si un poste, même en brouillon, y est rattaché', async () => {
    const appel = bloquerSuppressionParent({ id: 1, req: reqEnfants(0, 1) } as never)
    await expect(appel).rejects.toBeInstanceOf(APIError)
    await expect(appel).rejects.toThrow(MESSAGE_SUPPRESSION)
  })
  it('acceptée sans poste rattaché', async () => {
    await expect(bloquerSuppressionParent({ id: 1, req: reqEnfants(0, 0) } as never)).resolves.toBeUndefined()
  })
})
