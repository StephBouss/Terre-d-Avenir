import { describe, expect, it } from 'vitest'
import { PAGE_SLUGS } from '@/collections/Pages'
import { isPlaceholder } from '@/lib/text'
import { en } from '@/seed/data/en'
import { fr } from '@/seed/data/fr'

const allStrings = (value: unknown): string[] =>
  typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(allStrings) : value && typeof value === 'object' ? Object.values(value).flatMap(allStrings) : []

describe('contenus du seed', () => {
  it('une page par slug, dans les deux langues', () => {
    expect(fr.pages.map((p) => p.slug).sort()).toEqual([...PAGE_SLUGS].sort())
    expect(en.pages.map((p) => p.slug)).toEqual(fr.pages.map((p) => p.slug))
  })
  it('même structure de sections, mêmes liens', () => {
    for (const page of fr.pages) {
      const other = en.pages.find((p) => p.slug === page.slug)!
      expect(other.sections.map((s) => s.key), page.slug).toEqual(page.sections.map((s) => s.key))
      page.sections.forEach((section, i) => {
        const o = other.sections[i]
        expect(o.items?.length ?? 0, `${page.slug}.${section.key}.items`).toBe(section.items?.length ?? 0)
        expect(o.ctas?.map((c) => c.href), `${page.slug}.${section.key}.ctas`).toEqual(section.ctas?.map((c) => c.href))
      })
    }
  })
  it('mêmes actualités et projets, champs non traduits identiques', () => {
    const pick = <T extends object>(list: T[], keys: (keyof T)[]) => list.map((x) => keys.map((k) => JSON.stringify(x[k])))
    expect(pick(en.actualites, ['slug', 'order', 'date', 'image', 'album'])).toEqual(pick(fr.actualites, ['slug', 'order', 'date', 'image', 'album']))
    expect(en.actualites.map((a) => a.source.url)).toEqual(fr.actualites.map((a) => a.source.url))
    expect(pick(en.projets, ['slug', 'order', 'icon', 'image'])).toEqual(pick(fr.projets, ['slug', 'order', 'icon', 'image']))
    expect(en.projets.map((p) => p.source.url)).toEqual(fr.projets.map((p) => p.source.url))
  })
  it('mêmes albums, champs non traduits identiques, photos et couverture connues', () => {
    const pick = (list: typeof fr.albums) => list.map((a) => JSON.stringify([a.slug, a.order, a.date, a.cover, a.photos]))
    expect(pick(en.albums)).toEqual(pick(fr.albums))
    expect(fr.albums.map((a) => a.slug)).toEqual(['kafele-nianame-2026-09', 'tournoi-football-2026-08', 'rencontre-populations-2026-08'])
    for (const a of fr.albums) expect(a.photos).toContain(a.cover)
    for (const a of fr.actualites) if (a.album) expect(fr.albums.map((x) => x.slug)).toContain(a.album)
  })
  it('aucun marqueur de brouillon [...] ni chaîne vide', () => {
    for (const s of [...allStrings(fr), ...allStrings(en)]) expect(isPlaceholder(s), s).toBe(false)
  })
  it('6 actualités et 4 projets', () => {
    expect(fr.actualites).toHaveLength(6)
    expect(fr.projets).toHaveLength(4)
  })
})
