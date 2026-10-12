import { isPlaceholder } from '../text'

export type KpiState = { kind: 'value'; value: number } | { kind: 'unavailable' } | { kind: 'no-source'; note: string }
export type ActualiteRow = { _status?: string | null; archivee?: boolean | null }
export type MediaRow = { galerie?: boolean | null; provisoire?: boolean | null; alt?: string | null; droitsConfirmes?: boolean | null }
export type TitleRow = { titleEn?: string | null }

export function actualiteCounts(rows: ActualiteRow[]) {
  let publiees = 0
  let brouillons = 0
  let archivees = 0
  for (const r of rows) {
    if (r.archivee === true) archivees++
    else if (r._status === 'published') publiees++
    else brouillons++
  }
  return { publiees, brouillons, archivees }
}

export function missingTranslations(rows: TitleRow[]): number {
  return rows.filter((r) => isPlaceholder(r.titleEn)).length
}

export function mediaCounts(rows: MediaRow[]) {
  return {
    total: rows.length,
    galerie: rows.filter((r) => r.galerie === true).length,
    provisoires: rows.filter((r) => r.provisoire === true).length,
    sansAlt: rows.filter((r) => r.provisoire !== true && isPlaceholder(r.alt)).length,
    droitsNonConfirmes: rows.filter((r) => r.droitsConfirmes !== true).length,
  }
}

const SITUATION = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Libreville' })

export function formatSituation(date: Date): string {
  return SITUATION.format(date)
}
