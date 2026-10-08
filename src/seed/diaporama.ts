import type { Payload } from 'payload'
import { en } from './data/en'
import { fr } from './data/fr'
import { SEED_CONTEXT } from './upsert'

/**
 * Textes des diapositives de l’accueil (FR puis EN sur les mêmes lignes). Ne touche à rien si des textes
 * existent déjà : ceux saisis dans l’admin ne sont jamais écrasés.
 */
export async function seedTextesDiaporama(payload: Payload): Promise<void> {
  const actuel = await payload.findGlobal({ slug: 'diaporama', locale: 'fr', depth: 0 })
  if ((actuel.textes ?? []).length > 0) return
  const apresFr = await payload.updateGlobal({ slug: 'diaporama', data: { textes: fr.diaporama }, locale: 'fr', context: SEED_CONTEXT })
  const textesEn = (apresFr.textes ?? []).map((ligne, i) => ({ id: ligne.id, ...en.diaporama[i] }))
  await payload.updateGlobal({ slug: 'diaporama', data: { textes: textesEn }, locale: 'en', context: SEED_CONTEXT })
}
