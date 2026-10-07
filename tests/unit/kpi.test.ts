import type { Payload } from 'payload'
import { describe, expect, it } from 'vitest'
import { loadKpis } from '@/lib/kpi/load'
import { NO_SOURCE, actualiteCounts, formatSituation, mediaCounts, missingTranslations } from '@/lib/kpi/compute'

describe('KPI', () => {
  it('compte les actualités par état (archivée prioritaire)', () => {
    expect(
      actualiteCounts([
        { _status: 'published', archivee: false },
        { _status: 'published', archivee: true },
        { _status: 'draft', archivee: false },
        { _status: 'draft', archivee: true },
        { _status: 'published', archivee: null },
      ]),
    ).toEqual({ publiees: 2, brouillons: 1, archivees: 2 })
  })

  it('zéro réel quand la liste est vide', () => {
    expect(actualiteCounts([])).toEqual({ publiees: 0, brouillons: 0, archivees: 0 })
    expect(mediaCounts([])).toEqual({ total: 0, galerie: 0, provisoires: 0, sansAlt: 0, droitsNonConfirmes: 0 })
  })

  it('traductions manquantes : vide, null ou brouillon', () => {
    expect(missingTranslations([{ titleEn: 'News' }, { titleEn: '' }, { titleEn: null }, { titleEn: '[à traduire]' }, {}])).toBe(4)
  })

  it('alertes photos : provisoires non comptées comme sans texte alternatif', () => {
    expect(
      mediaCounts([
        { galerie: true, provisoire: false, alt: 'Bannière', droitsConfirmes: true },
        { galerie: false, provisoire: true, alt: '', droitsConfirmes: false },
        { galerie: true, provisoire: false, alt: '', droitsConfirmes: false },
      ]),
    ).toEqual({ total: 3, galerie: 2, provisoires: 1, sansAlt: 1, droitsNonConfirmes: 2 })
  })

  it('cartes sans source : adhésions, transactions, chargements, sauvegardes', () => {
    expect(NO_SOURCE.map((c) => c.id)).toEqual(['adhesions', 'transactions', 'chargements', 'sauvegardes'])
    expect(NO_SOURCE.every((c) => c.note.length > 0)).toBe(true)
  })

  it('situation datée en heure de Libreville', () => {
    expect(formatSituation(new Date('2026-10-06T23:30:00Z'))).toBe('7 octobre 2026 à 00:30')
  })

  describe('loadKpis', () => {
    type Args = { collection: string; locale?: string }
    const docsFor = ({ collection, locale }: Args) => {
      if (collection === 'actualites' && locale === 'en') return [{ title: 'News' }, { title: '' }]
      if (collection === 'actualites') return [{ _status: 'published', archivee: false }, { _status: 'draft', archivee: false }]
      if (collection === 'pages') return [{ h1: '' }]
      if (collection === 'projets') return [{ title: '[à traduire]' }]
      return [{ galerie: true, provisoire: false, alt: 'Bannière', droitsConfirmes: true }]
    }
    const fake = (failing: (a: Args) => boolean) =>
      ({
        find: async (a: Args) => {
          if (failing(a)) throw new Error('lecture impossible')
          return { docs: docsFor(a) }
        },
        count: async (a: Args) => {
          if (failing(a)) throw new Error('lecture impossible')
          return { totalDocs: 5 }
        },
      }) as unknown as Payload

    it('toutes les lectures réussissent : valeurs réelles et répartition des traductions', async () => {
      const k = await loadKpis(fake(() => false))
      expect(k.actualites.publiees).toEqual({ kind: 'value', value: 1 })
      expect(k.pages).toEqual({ kind: 'value', value: 5 })
      expect(k.traductions).toEqual({
        total: { kind: 'value', value: 3 },
        actualites: { kind: 'value', value: 1 },
        pages: { kind: 'value', value: 1 },
        projets: { kind: 'value', value: 1 },
      })
    })

    it('une seule lecture en erreur : seule la carte concernée est indisponible', async () => {
      const k = await loadKpis(fake((a) => a.collection === 'medias'))
      const unavailable = { kind: 'unavailable' }
      expect(k.medias).toEqual({ total: unavailable, galerie: unavailable, provisoires: unavailable, sansAlt: unavailable, droitsNonConfirmes: unavailable })
      expect(k.actualites.publiees).toEqual({ kind: 'value', value: 1 })
      expect(k.pages).toEqual({ kind: 'value', value: 5 })
      expect(k.projets).toEqual({ kind: 'value', value: 5 })
      expect(k.traductions.total).toEqual({ kind: 'value', value: 3 })
    })

    it('traductions : une collection en erreur rend le total indisponible, les autres gardent leur valeur', async () => {
      const k = await loadKpis(fake((a) => a.collection === 'pages' && a.locale === 'en'))
      expect(k.traductions.pages).toEqual({ kind: 'unavailable' })
      expect(k.traductions.total).toEqual({ kind: 'unavailable' })
      expect(k.traductions.actualites).toEqual({ kind: 'value', value: 1 })
      expect(k.traductions.projets).toEqual({ kind: 'value', value: 1 })
      expect(k.pages).toEqual({ kind: 'value', value: 5 })
    })
  })
})
