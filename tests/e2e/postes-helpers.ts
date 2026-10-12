import { expect, type APIRequestContext } from '@playwright/test'

export type Entetes = { Authorization: string }

export async function creerPoste(request: APIRequestContext, headers: Entetes, data: Record<string, unknown>, statut: 'draft' | 'published'): Promise<number> {
  const res = await request.post(`/api/postes?locale=fr${statut === 'draft' ? '&draft=true' : ''}`, { headers, data: { ...data, _status: statut } })
  expect(res.ok(), await res.text()).toBe(true)
  return (await res.json()).doc.id as number
}

/** Supprime les postes de test d’un préfixe de `cle`. Plusieurs passes : un parent n’est supprimable qu’une fois ses enfants partis. */
export async function purgerPostes(request: APIRequestContext, headers: Entetes, prefixe: string): Promise<void> {
  for (let passe = 0; passe < 6; passe++) {
    const res = await request.get(`/api/postes?draft=true&limit=100&depth=0&where[cle][like]=${encodeURIComponent(prefixe)}`, { headers })
    expect(res.ok(), await res.text()).toBe(true)
    const docs = (await res.json()).docs as { id: number }[]
    if (docs.length === 0) return
    for (const doc of docs) await request.delete(`/api/postes/${doc.id}`, { headers })
  }
  throw new Error(`Postes de test non supprimés (préfixe ${prefixe})`)
}
