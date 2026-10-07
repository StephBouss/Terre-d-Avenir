import fs from 'node:fs'
import path from 'node:path'
import type { Payload } from 'payload'
import { isSeedMediaFilename } from './media-match'
import { SEED_CONTEXT } from './upsert'

export type MediaSeed = {
  /** Clé du nom de fichier téléversé (« banner », « kafele-nianame-1-photo ») : sert à retrouver les variantes renommées par Payload. */
  key: string
  filePath: string
  data: Record<string, unknown>
  altFr: string
  altEn: string
  lieu?: { fr: string; en: string }
}

export async function upsertMedia(payload: Payload, m: MediaSeed): Promise<number | string> {
  const ext = path.extname(m.filePath)
  // Le fichier est téléversé sous « <clé><ext> » : une clé terminée par « -N » serait renumérotée par Payload (photo-1 → photo-7).
  const upload = { data: fs.readFileSync(m.filePath), name: `${m.key}${ext}`, mimetype: 'image/jpeg', size: fs.statSync(m.filePath).size }
  // Payload renomme en « banner-1.jpg » si le fichier existe déjà dans media/ : on retrouve ces variantes, et elles seules.
  const candidates = await payload.find({
    collection: 'medias',
    where: { filename: { like: m.key } },
    sort: 'id',
    limit: 50,
    depth: 0,
  })
  const found = candidates.docs.filter((d) => isSeedMediaFilename(d.filename, m.key, ext))
  const base = { ...m.data, ...(m.lieu ? { lieu: m.lieu.fr } : {}) }
  const doc =
    found[0] ??
    (await payload.create({
      collection: 'medias',
      data: { ...base, alt: m.altFr } as never,
      file: upload,
      locale: 'fr',
      context: SEED_CONTEXT,
    }))
  await payload.update({ collection: 'medias', id: doc.id, data: { ...base, alt: m.altFr } as never, locale: 'fr', context: SEED_CONTEXT })
  await payload.update({
    collection: 'medias',
    id: doc.id,
    data: { alt: m.altEn, ...(m.lieu ? { lieu: m.lieu.en } : {}) } as never,
    locale: 'en',
    context: SEED_CONTEXT,
  })
  return doc.id
}
