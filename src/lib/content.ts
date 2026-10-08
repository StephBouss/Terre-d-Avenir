import { cache } from 'react'
import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Actualite, Album, Diaporama, Media, Page, Poste, Projet, Reglage } from '@/payload-types'
import type { PageSlug } from '@/collections/Pages'
import type { Locale } from './i18n/config'
import { VISIBLE_ACTUALITE } from './actualites'
import type { Diapositive } from './diaporama'
import { PUBLISHED_ALBUM } from './albums'
import { TITLED } from './filtres'
import { INTITULE_RENSEIGNE, PUBLISHED_POSTE, avecIntituleAffichable } from './organigramme'

const client = cache(() => getPayload({ config }))

/**
 * Aperçu actif : le cookie d’aperçu ne suffit pas, la session admin doit être valide.
 * Après une déconnexion, le cookie peut subsister : on retombe alors sur la lecture publique.
 */
export const isPreviewing = cache(async (): Promise<boolean> => {
  if (!(await draftMode()).isEnabled) return false
  const payload = await client()
  const { user } = await payload.auth({ headers: await headers() })
  return Boolean(user)
})

export const getPage = cache(async (slug: PageSlug, locale: Locale): Promise<Page | null> => {
  const payload = await client()
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, locale, limit: 1, depth: 1 })
  return res.docs[0] ?? null
})

export const getActualites = cache(async (locale: Locale): Promise<Actualite[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'actualites', where: { and: [VISIBLE_ACTUALITE, TITLED] }, sort: 'order', locale, depth: 1, limit: 100 })
  return res.docs
})

/** `draft` est un booléen (et non un objet) : `cache` de React compare les arguments par valeur. */
export const getActualite = cache(async (slug: string, locale: Locale, draft = false): Promise<Actualite | null> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'actualites',
    where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, VISIBLE_ACTUALITE, TITLED] },
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

export const getAlbums = cache(async (locale: Locale): Promise<Album[]> => {
  const payload = await client()
  const res = await payload.find({ collection: 'albums', where: { and: [PUBLISHED_ALBUM, TITLED] }, sort: ['order', '-date'], locale, depth: 1, limit: 100 })
  return res.docs
})

export const getAlbum = cache(async (slug: string, locale: Locale): Promise<Album | null> => {
  const payload = await client()
  const res = await payload.find({ collection: 'albums', where: { and: [{ slug: { equals: slug } }, PUBLISHED_ALBUM, TITLED] }, locale, depth: 1, limit: 1 })
  return res.docs[0] ?? null
})

export const getReglages = cache(async (locale: Locale): Promise<Reglage> => {
  const payload = await client()
  return payload.findGlobal({ slug: 'reglages', locale, depth: 1 })
})

export const getDiaporama = cache(async (locale: Locale): Promise<{ images: Media[]; textes: Diapositive[] }> => {
  const payload = await client()
  const global: Diaporama = await payload.findGlobal({ slug: 'diaporama', locale, depth: 1 })
  return {
    images: (global.images ?? []).filter((m): m is Media => typeof m === 'object' && m !== null),
    textes: (global.textes ?? []).map((t) => ({ titre: t.titre, texte: t.texte })),
  }
})

/** Postes de l’organigramme : publiés seulement, sauf en aperçu (`draft` : dernières versions, brouillons compris). */
export const getPostes = cache(async (locale: Locale, draft = false): Promise<Poste[]> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'postes',
    where: draft ? INTITULE_RENSEIGNE : { and: [PUBLISHED_POSTE, INTITULE_RENSEIGNE] },
    draft,
    locale,
    depth: 1,
    sort: 'ordre',
    limit: 200,
  })
  return avecIntituleAffichable(res.docs)
})
