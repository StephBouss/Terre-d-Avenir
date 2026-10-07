import type { Payload } from 'payload'
import { actualiteCounts, mediaCounts, missingTranslations, type KpiState } from './compute'

const ALL = { limit: 0, pagination: false, depth: 0 } as const

/** Exécute une lecture ; toute erreur donne « Indisponible » pour cette carte seulement. */
async function safe<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read()
  } catch {
    return null
  }
}

export async function loadKpis(payload: Payload) {
  const [actualites, pages, projets, medias, actuEn, pagesEn, projetsEn] = await Promise.all([
    safe(() => payload.find({ collection: 'actualites', ...ALL, select: { _status: true, archivee: true } })),
    safe(() => payload.count({ collection: 'pages' })),
    safe(() => payload.count({ collection: 'projets' })),
    safe(() => payload.find({ collection: 'medias', ...ALL, locale: 'fr', select: { galerie: true, provisoire: true, alt: true, droitsConfirmes: true } })),
    safe(() => payload.find({ collection: 'actualites', ...ALL, locale: 'en', fallbackLocale: false, select: { title: true } })),
    safe(() => payload.find({ collection: 'pages', ...ALL, locale: 'en', fallbackLocale: false, select: { h1: true } })),
    safe(() => payload.find({ collection: 'projets', ...ALL, locale: 'en', fallbackLocale: false, select: { title: true } })),
  ])

  const value = (n: number): KpiState => ({ kind: 'value', value: n })
  const unavailable: KpiState = { kind: 'unavailable' }

  const actu = actualites ? actualiteCounts(actualites.docs) : null
  const med = medias ? mediaCounts(medias.docs) : null
  const translations =
    actuEn && pagesEn && projetsEn
      ? missingTranslations([
          ...actuEn.docs.map((d) => ({ titleEn: d.title })),
          ...pagesEn.docs.map((d) => ({ titleEn: d.h1 })),
          ...projetsEn.docs.map((d) => ({ titleEn: d.title })),
        ])
      : null

  return {
    actualites: {
      publiees: actu ? value(actu.publiees) : unavailable,
      brouillons: actu ? value(actu.brouillons) : unavailable,
      archivees: actu ? value(actu.archivees) : unavailable,
    },
    pages: pages ? value(pages.totalDocs) : unavailable,
    projets: projets ? value(projets.totalDocs) : unavailable,
    traductions: translations === null ? unavailable : value(translations),
    medias: med
      ? { total: value(med.total), galerie: value(med.galerie), provisoires: value(med.provisoires), sansAlt: value(med.sansAlt), droitsNonConfirmes: value(med.droitsNonConfirmes) }
      : { total: unavailable, galerie: unavailable, provisoires: unavailable, sansAlt: unavailable, droitsNonConfirmes: unavailable },
  }
}

export type Kpis = Awaited<ReturnType<typeof loadKpis>>
