import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Actualite, Media, Page, Projet, Reglage } from '@/payload-types'
import type { PageSlug } from '@/collections/Pages'
import type { Locale } from './i18n/config'

const client = cache(() => getPayload({ config }))

export const getPage = cache(async (slug: PageSlug, locale: Locale): Promise<Page | null> => {
  const payload = await client()
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, locale, limit: 1, depth: 1 })
  return res.docs[0] ?? null
})

export const getActualites = cache(async (locale: Locale): Promise<Actualite[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'actualites', where: { publie: { equals: true } }, sort: 'order', locale, depth: 1, limit: 100 })
  return res.docs
})

export const getActualite = cache(async (slug: string, locale: Locale): Promise<Actualite | null> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'actualites',
    where: { and: [{ slug: { equals: slug } }, { publie: { equals: true } }] },
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
  const res = await payload.find({ collection: 'medias', where: { galerie: { equals: true } }, sort: 'createdAt', locale, depth: 0, limit: 200 })
  return res.docs
})

export const getReglages = cache(async (locale: Locale): Promise<Reglage> => {
  const payload = await client()
  return payload.findGlobal({ slug: 'reglages', locale, depth: 1 })
})
