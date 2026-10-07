import { describe, expect, it } from 'vitest'
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
})
