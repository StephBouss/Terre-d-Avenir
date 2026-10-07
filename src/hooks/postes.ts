import { APIError, ValidationError, type CollectionAfterErrorHook, type CollectionBeforeDeleteHook, type CollectionBeforeValidateHook, type PayloadRequest } from 'payload'
import { MESSAGE_SUPPRESSION, idDe, verifierRattachement, type IdPoste } from '../lib/organigramme'

/** Parent d’un poste dans sa dernière version (brouillon compris) ; undefined si le poste n’existe pas. */
function lecteurParent(req: PayloadRequest) {
  return async (id: IdPoste): Promise<IdPoste | null | undefined> => {
    const doc = await req.payload.findByID({ collection: 'postes', id, depth: 0, draft: true, disableErrors: true, overrideAccess: true, req })
    return doc ? idDe(doc.parent) : undefined
  }
}

/**
 * Hook (et non `validate` du champ) : Payload ne valide pas les champs d’un brouillon, alors que les hooks tournent toujours.
 * Refuse l’auto-rattachement, les boucles et un parent inexistant, avec un message sur le champ « Rattaché à ».
 */
export const validerRattachement: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  if (!data || !('parent' in data)) return data
  const erreur = await verifierRattachement(idDe(originalDoc?.id), idDe(data.parent), lecteurParent(req))
  if (erreur) {
    const echec = new ValidationError({ collection: 'postes', errors: [{ path: 'parent', message: erreur }], req })
    // Le serveur Next charge deux copies de Payload : sa mise en forme ne reconnaît alors pas cette erreur et n’en garde que le message.
    echec.message = erreur
    throw echec
  }
  return data
}

/** Refuse de supprimer un poste auquel un autre est rattaché, dans sa version publiée ou dans son dernier brouillon. */
export const bloquerSuppressionParent: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const where = { parent: { equals: id } }
  // Lectures successives : en parallèle, elles se disputeraient la transaction de `req`.
  const publies = await req.payload.find({ collection: 'postes', where, depth: 0, limit: 1, overrideAccess: true, req })
  const brouillons = await req.payload.find({ collection: 'postes', where, depth: 0, limit: 1, draft: true, overrideAccess: true, req })
  if (publies.totalDocs + brouillons.totalDocs > 0) throw new APIError(MESSAGE_SUPPRESSION, 400, null, true)
}

/**
 * En production, Payload ne reconnaît pas l’erreur de validation (deux copies chargées) et la réduit à son message :
 * le champ « Rattaché à » n’est plus signalé. On rétablit la réponse standard, avec `data.errors` et le chemin du champ.
 */
export const restaurerErreurValidation: CollectionAfterErrorHook = ({ error }) => {
  const e = error as Error & { data?: { errors?: unknown[] } }
  if (e?.name === 'ValidationError' && e.data?.errors) {
    return { status: 400, response: { errors: [{ name: 'ValidationError', message: e.message, data: e.data }] } }
  }
}
