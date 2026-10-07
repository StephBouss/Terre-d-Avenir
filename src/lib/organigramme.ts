import type { Where } from 'payload'
import type { Poste } from '@/payload-types'

export type IdPoste = number | string

/** Un poste est public s’il est publié. Source unique de la règle (accès API et lectures du site). */
export const PUBLISHED_POSTE: Where = { _status: { equals: 'published' } }
/** Poste sans intitulé dans la langue demandée : masqué (pas de repli sur le français). */
export const INTITULE_RENSEIGNE: Where = { intitule: { exists: true } }

export const MESSAGES_RATTACHEMENT = {
  lui: 'Un poste ne peut pas être rattaché à lui-même.',
  boucle: 'Ce rattachement créerait une boucle : un poste ne peut pas être rattaché à l’un de ses subordonnés.',
  absent: 'Le poste de rattachement choisi n’existe pas ou a été supprimé.',
} as const

export const MESSAGE_SUPPRESSION =
  'Ce poste a des postes rattachés (publiés ou en brouillon). Rattachez-les d’abord à un autre poste, puis supprimez-le.'

/** Identifiant d’une relation : id brut ou document peuplé ; null si vide. */
export function idDe(valeur: unknown): IdPoste | null {
  if (valeur === null || valeur === undefined || valeur === '') return null
  if (typeof valeur === 'object') return idDe((valeur as { id?: unknown }).id)
  return typeof valeur === 'number' || typeof valeur === 'string' ? valeur : null
}

/**
 * Message d’erreur si `id` (null à la création) ne peut pas être rattaché à `parent`, sinon null.
 * `lireParent(x)` renvoie le parent de x, null pour une racine, undefined si x n’existe pas.
 * On remonte la chaîne des parents : rencontrer `id` signifie une boucle.
 */
export async function verifierRattachement(
  id: IdPoste | null,
  parent: IdPoste | null,
  lireParent: (id: IdPoste) => Promise<IdPoste | null | undefined>,
): Promise<string | null> {
  if (parent === null) return null
  if (id !== null && String(parent) === String(id)) return MESSAGES_RATTACHEMENT.lui
  const vus = new Set<string>()
  let courant: IdPoste = parent
  for (let profondeur = 0; profondeur < 1000; profondeur++) {
    vus.add(String(courant))
    const suivant = await lireParent(courant)
    if (suivant === undefined) return profondeur === 0 ? MESSAGES_RATTACHEMENT.absent : null
    if (suivant === null) return null
    if (id !== null && String(suivant) === String(id)) return MESSAGES_RATTACHEMENT.boucle
    if (vus.has(String(suivant))) return null // boucle déjà présente plus haut, sans lien avec ce poste
    courant = suivant
  }
  return null
}

export type PosteNoeud = { poste: Poste; parentId: number | null; enfants: PosteNoeud[] }

const comparer = (a: Poste, b: Poste): number =>
  (a.ordre ?? 0) - (b.ordre ?? 0) || (a.intitule ?? '').localeCompare(b.intitule ?? '') || a.id - b.id

/**
 * Arbre des postes, frères triés par ordre puis intitulé.
 * Un poste dont le parent est absent de la liste (non publié, sans intitulé dans la langue) remonte à la racine.
 * Une boucle éventuellement présente en base (refusée à l’écriture) est cassée : aucun poste n’est perdu.
 */
export function construireArbre(postes: Poste[]): PosteNoeud[] {
  const presents = new Set(postes.map((p) => String(p.id)))
  const enfants = new Map<string, Poste[]>()
  const racines: Poste[] = []
  for (const p of postes) {
    const parent = idDe(p.parent)
    if (parent !== null && presents.has(String(parent)) && String(parent) !== String(p.id)) {
      enfants.set(String(parent), [...(enfants.get(String(parent)) ?? []), p])
    } else racines.push(p)
  }
  const places = new Set<string>()
  const construire = (p: Poste, parentId: number | null): PosteNoeud => {
    places.add(String(p.id))
    const fils = (enfants.get(String(p.id)) ?? []).filter((f) => !places.has(String(f.id))).sort(comparer)
    return { poste: p, parentId, enfants: fils.map((f) => construire(f, p.id)) }
  }
  const arbre = [...racines].sort(comparer).map((p) => construire(p, null))
  for (const p of [...postes].sort(comparer)) if (!places.has(String(p.id))) arbre.push(construire(p, null))
  return arbre
}
