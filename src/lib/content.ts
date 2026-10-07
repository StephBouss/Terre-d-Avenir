import { cache } from 'react'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type { Actualite, Album, Diaporama, Media, Page, Projet, Reglage } from '@/payload-types'
import type { PageSlug } from '@/collections/Pages'
import type { Locale } from './i18n/config'
import { VISIBLE_ACTUALITE } from './actualites'

const client = cache(() => getPayload({ config }))

export const getPage = cache(async (slug: PageSlug, locale: Locale): Promise<Page | null> => {
  const payload = await client()
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, locale, limit: 1, depth: 1 })
  return res.docs[0] ?? null
})

export const getActualites = cache(async (locale: Locale): Promise<Actualite[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'actualites', where: VISIBLE_ACTUALITE, sort: 'order', locale, depth: 1, limit: 100 })
  return res.docs
})

/** `draft` est un booléen (et non un objet) : `cache` de React compare les arguments par valeur. */
export const getActualite = cache(async (slug: string, locale: Locale, draft = false): Promise<Actualite | null> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'actualites',
    where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, VISIBLE_ACTUALITE] },
    draft,
    locale,
    depth: 1,
    limit: 1,
  })
  return res.docs[0] ?? null
})

export const getProjets = cache(async (locale: Locale): Promise<Projet[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'projets', sort: 'order', locale, depth: 1, limit: 100 })
  return res.docs
})

export const getProjet = cache(async (slug: string, locale: Locale): Promise<Projet | null> => {
  const payload = await client()
  const res = await payload.find({ collection: 'projets', where: { slug: { equals: slug } }, locale, depth: 1, limit: 1 })
  return res.docs[0] ?? null
})

export const getGalleryMedia = cache(async (locale: Locale): Promise<Media[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'medias', where: { galerie: { equals: true } }, sort: ['ordre', 'createdAt'], locale, depth: 0, limit: 200 })
  return res.docs
})

export const PUBLISHED_ALBUM: Where = { _status: { equals: 'published' } }

export const getAlbums = cache(async (locale: Locale): Promise<Album[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'albums', where: PUBLISHED_ALBUM, sort: ['order', '-date'], locale, depth: 1, limit: 100 })
  return res.docs
})

export const getAlbum = cache(async (slug: string, locale: Locale): Promise<Album | null> => {
  const payload = await client()
  const res = await payload.find({ collection: 'albums', where: { and: [{ slug: { equals: slug } }, PUBLISHED_ALBUM] }, locale, depth: 1, limit: 1 })
  return res.docs[0] ?? null
})

export const getReglages = cache(async (locale: Locale): Promise<Reglage> => {
  const payload = await client()
  return payload.findGlobal({ slug: 'reglages', locale, depth: 1 })
})

export const getDiaporama = cache(async (locale: Locale): Promise<Media[]> => {
  const payload = await client()
  const global: Diaporama = await payload.findGlobal({ slug: 'diaporama', locale, depth: 1 })
  return (global.images ?? []).filter((m): m is Media => typeof m === 'object' && m !== null)
})
