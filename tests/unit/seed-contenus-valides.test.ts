import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { en } from '@/seed/data/en'
import { fr } from '@/seed/data/fr'
import { ALBUM_PHOTO_SETS } from '@/seed/data/photos'

// Parité entre les textes validés (plans) et le seed. Le plan garde l’apostrophe droite, le seed utilise « ’ » : on normalise.
const norm = (s: string) => s.replace(/'/g, '’')
const PLANS = [
  { file: '2026-10-06-contenu-kafele-nianame.md', actualite: 'kafele-nianame-rehabilitation', album: 'kafele-nianame-2026-09', photos: 6 },
  { file: '2026-10-07-contenu-tournoi-football-finale.md', actualite: 'tournoi-football-finale-2026', album: 'tournoi-football-2026-08', photos: 6 },
  { file: '2026-10-07-contenu-rencontre-populations.md', actualite: 'rencontre-populations-komo-kango', album: 'rencontre-populations-2026-08', photos: 5 },
]

const rows = (section: string) =>
  section
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))

function parsePlan(file: string) {
  const md = fs.readFileSync(path.join(process.cwd(), 'docs/superpowers/plans', file), 'utf8').replace(/\r\n/g, '\n')
  const iA = md.indexOf('## Actualité')
  const iB = md.indexOf('## Album')
  const iP = md.indexOf('## Photos')
  const actualite = md.slice(iA, iB)
  const album = md.slice(iB, iP)
  const photos = md.slice(iP)
  const cell = (section: string, key: string) => rows(section).find((r) => r[0] === key)!
  const bodies = [...actualite.matchAll(/```\n([\s\S]*?)\n```/g)].map((m) => m[1])
  return { actualite, album, photos, cell, bodies }
}

describe.each(PLANS)('contenu validé $file', (plan) => {
  const p = parsePlan(plan.file)
  const fa = fr.actualites.find((a) => a.slug === plan.actualite)!
  const ea = en.actualites.find((a) => a.slug === plan.actualite)!
  const fb = fr.albums.find((a) => a.slug === plan.album)!
  const eb = en.albums.find((a) => a.slug === plan.album)!
  const set = ALBUM_PHOTO_SETS.find((s) => s.albumSlug === plan.album)!

  it('actualité : titre, date, extrait, corps FR et EN mot pour mot', () => {
    expect(fa && ea).toBeTruthy()
    for (const [item, i] of [[fa, 1], [ea, 2]] as const) {
      expect(item.title).toBe(norm(p.cell(p.actualite, 'title')[i]))
      expect(item.dateLabel).toBe(norm(p.cell(p.actualite, 'dateLabel')[i]))
      expect(item.excerpt).toBe(norm(p.cell(p.actualite, 'excerpt')[i]))
    }
    expect(fa.category).toBe(norm(p.cell(p.actualite, 'category')[1]))
    expect(fa.date).toBe(p.cell(p.actualite, 'date')[1].replace(/`/g, ''))
    expect(p.bodies).toHaveLength(2)
    expect(fa.body).toBe(norm(p.bodies[0]))
    expect(ea.body).toBe(norm(p.bodies[1]))
    expect(fa.album).toBe(plan.album)
  })

  it('album : titre, description, date, nombre de photos et couverture', () => {
    for (const [item, i] of [[fb, 1], [eb, 2]] as const) {
      expect(item.title).toBe(norm(p.cell(p.album, 'title')[i]))
      expect(item.dateLabel).toBe(norm(p.cell(p.album, 'dateLabel')[i]))
      expect(item.description).toBe(norm(p.cell(p.album, 'description')[i]))
    }
    expect(fb.date).toBe(p.cell(p.album, 'date')[1].replace(/`/g, ''))
    expect(fb.photos).toHaveLength(plan.photos)
    expect(fb.photos.map((k) => k.replace(/^\D+-/, ''))).toEqual(Array.from({ length: plan.photos }, (_, i) => String(i + 1)))
    const coverN = /photo-(\d+)/.exec(p.cell(p.album, 'cover')[1])![1]
    expect(fb.cover.endsWith(`-${coverN}`)).toBe(true)
    const imageN = /photo-(\d+)/.exec(p.cell(p.actualite, 'image')[1])![1]
    expect(fa.image!.endsWith(`-${imageN}`)).toBe(true)
  })

  it('photos : texte alternatif FR/EN, droits, lieu, source', () => {
    const alts = rows(p.photos).filter((r) => /^photo-\d+\.jpg$/.test(r[0]))
    expect(set.photos).toHaveLength(plan.photos)
    expect(alts).toHaveLength(plan.photos)
    alts.forEach((r, i) => {
      expect(set.photos[i].file).toBe(r[0])
      expect(set.photos[i].altFr).toBe(norm(r[1]))
      expect(set.photos[i].altEn).toBe(norm(r[2]))
    })
    const common = (k: string) => rows(p.photos).find((r) => r.length === 2 && r[0].startsWith('`' + k + '`'))![1]
    expect(set.common.credit).toBe(norm(common('credit')))
    expect(set.common.source).toBe(norm(common('source')))
    expect(set.common.droitsNote).toBe(norm(common('droitsNote')))
    expect(set.common.datePrise).toBe(common('datePrise').replace(/`/g, ''))
    expect(set.common.droitsConfirmes).toBe(true)
    expect(`${set.lieu.fr} / ${set.lieu.en}`).toBe(common('lieu'))
  })

  it('les fichiers de photos existent', () => {
    for (const ph of set.photos) expect(fs.existsSync(path.join(process.cwd(), 'src/seed/images/albums', set.dir, ph.file)), ph.file).toBe(true)
  })

  it('aucune apostrophe droite dans les textes affichés', () => {
    const texts = [
      fa.title, fa.excerpt, fa.body, fa.category, fa.source.label, ea.title, ea.excerpt, ea.body, ea.category, ea.source.label,
      fb.title, fb.description, fb.dateLabel, eb.title, eb.description, eb.dateLabel,
      set.common.credit, set.common.source, set.common.droitsNote, set.lieu.fr, set.lieu.en,
      ...set.photos.flatMap((x) => [x.altFr, x.altEn]),
    ]
    for (const t of texts) expect(t, t).not.toContain("'")
  })
})

describe('ordre du seed', () => {
  it('actualités, du plus récent au plus ancien, puis les autres dans leur ordre', () => {
    const sorted = [...fr.actualites].sort((a, b) => a.order - b.order).map((a) => a.slug)
    expect(sorted).toEqual([
      'kafele-nianame-rehabilitation',
      'tournoi-football-finale-2026',
      'rencontre-populations-komo-kango',
      'tournoi-komo-kango-terre-davenir',
      'un-jeune-un-permis',
      'assemblee-generale-decembre-2025',
    ])
    expect(Object.fromEntries(fr.actualites.map((a) => [a.slug, a.order]))).toEqual({
      'kafele-nianame-rehabilitation': 0,
      'tournoi-football-finale-2026': 1,
      'rencontre-populations-komo-kango': 2,
      'tournoi-komo-kango-terre-davenir': 3,
      'un-jeune-un-permis': 4,
      'assemblee-generale-decembre-2025': 5,
    })
  })
  it('albums : Kafélé 0, tournoi 1, rencontre 2', () => {
    expect(fr.albums.map((a) => [a.slug, a.order])).toEqual([
      ['kafele-nianame-2026-09', 0],
      ['tournoi-football-2026-08', 1],
      ['rencontre-populations-2026-08', 2],
    ])
  })
})
