import type { CollectionSlug, Payload, Where } from 'payload'

/**
 * Contexte des écritures du seed : un objet NEUF à chaque appel. Payload utilise l'objet passé comme `req.context`, et
 * le stockage S3 y laisse ses propres marqueurs (fichier en cours, « skipCloudStorage ») : un objet partagé faisait
 * sauter l'envoi de toutes les photos après la première (constaté le 2026-10-12 sur Neon Object Storage).
 */
export const seedContext = (): Record<string, unknown> => ({ disableRevalidate: true })

/** Crée ou met à jour un document : données FR, puis données EN sur le même id. */
export async function upsertLocalized(
  payload: Payload,
  collection: CollectionSlug,
  where: Where,
  fr: Record<string, unknown>,
  en: Record<string, unknown>,
): Promise<number | string> {
  const found = await payload.find({ collection, where, limit: 1, depth: 0, locale: 'fr' })
  const existingId = found.docs[0]?.id
  const doc = existingId
    ? await payload.update({ collection, id: existingId, data: fr as never, locale: 'fr', draft: false, context: seedContext() })
    : await payload.create({ collection, data: fr as never, locale: 'fr', draft: false, context: seedContext() })
  await payload.update({ collection, id: doc.id, data: en as never, locale: 'en', draft: false, context: seedContext() })
  return doc.id
}
