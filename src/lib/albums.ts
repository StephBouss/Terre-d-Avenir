import type { Where } from 'payload'
import type { Album } from '@/payload-types'

/** Un album est public s’il est publié. Source unique de la règle. */
export const PUBLISHED_ALBUM: Where = { _status: { equals: 'published' } }

/** Vrai pour un album peuplé (profondeur ≥ 1) et publié ; faux pour un identifiant seul, un brouillon ou une absence. */
export function isPublishedAlbum(album: number | Album | null | undefined): album is Album {
  return typeof album === 'object' && album !== null && album._status === 'published'
}
