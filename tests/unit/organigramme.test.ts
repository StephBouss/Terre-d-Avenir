import { APIError, ValidationError } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { bloquerSuppressionParent, restaurerErreurValidation, validerRattachement } from '@/hooks/postes'
import { MESSAGES_RATTACHEMENT, avecIntituleAffichable, MESSAGE_SUPPRESSION, construireArbre, idDe, verifierRattachement, type PosteNoeud } from '@/lib/organigramme'
import type { Poste } from '@/payload-types'

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
  it('lit le parent dans la dernière version (brouillon compris)', async () => {
    const req = reqParents({ '1': null, '2': 1 })
    await validerRattachement({ data: { parent: 2 }, originalDoc: { id: 1 }, req } as never).catch(() => undefined)
    expect((req as unknown as { payload: { findByID: ReturnType<typeof vi.fn> } }).payload.findByID).toHaveBeenCalledWith(expect.objectContaining({ draft: true }))
  })
  it('laisse passer une modification qui ne touche pas au parent', async () => {
    const data = { ordre: 3 }
    expect(await validerRattachement({ data, originalDoc: { id: 1 }, req: reqParents({}) } as never)).toBe(data)
  })
})

describe('réponse d’erreur de validation (production)', () => {
  it('rétablit data.errors avec le chemin du champ', () => {
    const erreur = Object.assign(new Error(MESSAGES_RATTACHEMENT.lui), { name: 'e', data: { collection: 'postes', errors: [{ path: 'parent', message: MESSAGES_RATTACHEMENT.lui }] } })
    const sortie = restaurerErreurValidation({ error: erreur } as never)
    expect(sortie).toEqual({ status: 400, response: { errors: [{ name: 'ValidationError', message: MESSAGES_RATTACHEMENT.lui, data: erreur.data }] } })
  })
  it('ignore les autres erreurs', () => {
    expect(restaurerErreurValidation({ error: new Error('autre') } as never)).toBeUndefined()
    expect(restaurerErreurValidation({ error: Object.assign(new Error('x'), { name: 'ValidationError' }) } as never)).toBeUndefined()
    expect(restaurerErreurValidation({ error: Object.assign(new Error('x'), { data: { errors: 'non' } }) } as never)).toBeUndefined()
  })
})

describe('intitulés de poste affichables', () => {
  it('écarte les intitulés vides ou en brouillon', () => {
    const postes = [{ intitule: 'Président' }, { intitule: '' }, { intitule: null }, { intitule: '[à renseigner]' }, {}]
    expect(avecIntituleAffichable(postes)).toEqual([{ intitule: 'Président' }])
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

const poste = (id: number, parent: number | null, ordre: number, intitule = `P${id}`) => ({ id, parent, ordre, intitule }) as unknown as Poste
const forme = (noeuds: PosteNoeud[]): unknown[] => noeuds.map((n) => [n.poste.id, n.parentId, forme(n.enfants)])

describe('construction de l’arbre', () => {
  it('rattache chaque poste à son parent ; frères triés par ordre, puis intitulé', () => {
    const arbre = construireArbre([poste(1, null, 0), poste(3, 1, 2), poste(2, 1, 1), poste(4, 2, 0, 'B'), poste(5, 2, 0, 'A')])
    expect(forme(arbre)).toEqual([[1, null, [[2, 1, [[5, 2, []], [4, 2, []]]], [3, 1, []]]]])
  })
  it('un poste dont le parent n’est pas dans la liste (non publié) remonte à la racine', () => {
    expect(forme(construireArbre([poste(2, 9, 0)]))).toEqual([[2, null, []]])
  })
  it('auto-référence : le poste devient une racine', () => {
    expect(forme(construireArbre([poste(7, 7, 0)]))).toEqual([[7, null, []]])
  })
  it('boucle présente en base : cassée à l’affichage, aucun poste perdu', () => {
    expect(forme(construireArbre([poste(1, null, 0), poste(5, 6, 0), poste(6, 5, 1)]))).toEqual([
      [1, null, []],
      [5, null, [[6, 5, []]]],
    ])
  })
})
