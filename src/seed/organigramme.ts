import path from 'node:path'
import type { Payload } from 'payload'
import { PORTRAITS, POSTES } from './data/organigramme'
import { upsertMedia } from './media'
import { SEED_CONTEXT } from './upsert'

/**
 * Crée les postes de départ en brouillon, parents d’abord. Un poste déjà présent (même `cle`) n’est jamais réécrit :
 * le seed n’écrase pas une saisie réelle de l’admin. Les portraits (médias) sont mis à jour comme les autres médias du seed.
 */
export async function seedOrganigramme(payload: Payload, dossierSeed: string): Promise<void> {
  const ids = new Map<string, number | string>()
  for (const poste of POSTES) {
    const portrait = PORTRAITS[poste.portrait]
    const photo = await upsertMedia(payload, {
      // « organigramme-N-photo.jpg » : une clé finissant par « -N » serait renumérotée par Payload.
      key: `organigramme-${Number(poste.cle.slice(-2))}-photo`,
      filePath: path.join(dossierSeed, 'images', 'organigramme', poste.fichier),
      data: {
        credit: portrait.credit,
        provisoire: portrait.provisoire,
        galerie: false,
        droitsConfirmes: portrait.droitsConfirmes,
        ...(portrait.source ? { source: portrait.source } : {}),
      },
      altFr: portrait.alt.fr,
      altEn: portrait.alt.en,
    })

    const existant = await payload.find({ collection: 'postes', where: { cle: { equals: poste.cle } }, draft: true, limit: 1, depth: 0 })
    if (existant.docs[0]) {
      ids.set(poste.cle, existant.docs[0].id)
      continue
    }
    const doc = await payload.create({
      collection: 'postes',
      locale: 'fr',
      draft: true,
      context: SEED_CONTEXT,
      data: {
        cle: poste.cle,
        intitule: poste.intitule.fr,
        mission: poste.mission.fr,
        parent: poste.parent ? (ids.get(poste.parent) as number) : null,
        ordre: poste.ordre,
        personneNom: poste.nom,
        personnePhoto: photo as number,
        _status: 'draft',
      },
    })
    await payload.update({
      collection: 'postes',
      id: doc.id,
      locale: 'en',
      draft: true,
      context: SEED_CONTEXT,
      data: { intitule: poste.intitule.en, mission: poste.mission.en },
    })
    ids.set(poste.cle, doc.id)
  }
}
