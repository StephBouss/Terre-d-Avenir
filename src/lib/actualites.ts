import type { Where } from 'payload'

/** Une actualité est publique si elle est publiée et non archivée. Source unique de la règle. */
export const VISIBLE_ACTUALITE: Where = { and: [{ _status: { equals: 'published' } }, { archivee: { not_equals: true } }] }
