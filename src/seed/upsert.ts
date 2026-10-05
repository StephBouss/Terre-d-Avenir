import type { CollectionSlug, Payload, Where } from 'payload'

export const SEED_CONTEXT = { disableRevalidate: true }

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
    ? await payload.update({ collection, id: existingId, data: fr as never, locale: 'fr', context: SEED_CONTEXT })
    : await payload.create({ collection, data: fr as never, locale: 'fr', context: SEED_CONTEXT })
  await payload.update({ collection, id: doc.id, data: en as never, locale: 'en', context: SEED_CONTEXT })
  return doc.id
}
