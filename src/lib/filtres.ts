import type { Where } from 'payload'

/** Un contenu sans titre dans la langue demandée est masqué (pas de repli sur le français). */
export const TITLED: Where = { title: { exists: true } }
