import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import { en } from './data/en'
import { FACEBOOK_URL, fr } from './data/fr'
import type { SeedImageKey } from './data/types'
import { isSeedMediaFilename } from './media-match'
import { SEED_CONTEXT, upsertLocalized } from './upsert'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const IMAGES: Record<SeedImageKey, { altFr: string; altEn: string; provisoire: boolean; galerie: boolean; credit: string }> = {
  banner: {
    altFr: 'Bannière de Terre d’Avenir KOMO-KANGO',
    altEn: 'Terre d’Avenir KOMO-KANGO banner',
    provisoire: false,
    galerie: true,
    credit: 'Terre d’Avenir KOMO-KANGO',
  },
  forest: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  youth: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  education: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  sport: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  health: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  community: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
  solidarity: { altFr: '', altEn: '', provisoire: true, galerie: false, credit: 'Unsplash (image provisoire)' },
}

const HERO_ORDER: SeedImageKey[] = ['forest', 'youth', 'community', 'education', 'sport', 'health', 'solidarity', 'banner']

async function seedMedia(payload: Payload): Promise<Record<SeedImageKey, number | string>> {
  const ids = {} as Record<SeedImageKey, number | string>
  for (const [key, meta] of Object.entries(IMAGES) as [SeedImageKey, (typeof IMAGES)[SeedImageKey]][]) {
    const filename = `${key}.jpg`
    // Payload renomme en « banner-1.jpg » si le fichier existe déjà dans media/ : on retrouve ces variantes, et elles seules.
    const candidates = await payload.find({
      collection: 'medias',
      where: { filename: { like: key } },
      sort: 'id',
      limit: 50,
      depth: 0,
    })
    const found = candidates.docs.filter((d) => isSeedMediaFilename(d.filename, key, path.extname(filename)))
    const base = { credit: meta.credit, provisoire: meta.provisoire, galerie: meta.galerie }
    const doc =
      found[0] ??
      (await payload.create({
        collection: 'medias',
        data: { ...base, alt: meta.altFr },
        filePath: path.join(dirname, 'images', filename),
        locale: 'fr',
        context: SEED_CONTEXT,
      }))
    await payload.update({ collection: 'medias', id: doc.id, data: { ...base, alt: meta.altFr }, locale: 'fr', context: SEED_CONTEXT })
    await payload.update({ collection: 'medias', id: doc.id, data: { alt: meta.altEn }, locale: 'en', context: SEED_CONTEXT })
    ids[key] = doc.id
  }
  return ids
}

async function seedAdmin(payload: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) {
    console.warn('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD absents : aucun compte admin créé.')
    return
  }
  const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (!found.docs[0]) await payload.create({ collection: 'users', data: { email, password } })
}

async function seed() {
  const payload = await getPayload({ config })
  const media = await seedMedia(payload)

  for (const page of fr.pages) {
    const enPage = en.pages.find((p) => p.slug === page.slug)!
    const { slug, ...frData } = page
    const enData: Record<string, unknown> = { ...enPage }
    delete enData.slug
    await upsertLocalized(payload, 'pages', { slug: { equals: slug } }, { slug, ...frData }, enData)
  }

  for (const item of fr.actualites) {
    const enItem = en.actualites.find((a) => a.slug === item.slug)!
    const shared = { slug: item.slug, order: item.order, _status: 'published', archivee: false, date: item.date ?? null, image: item.image ? media[item.image] : null, source: { url: item.source.url } }
    const local = (a: typeof item) => ({ title: a.title, category: a.category, dateLabel: a.dateLabel, excerpt: a.excerpt, body: a.body ?? '', source: { label: a.source.label, url: a.source.url } })
    await upsertLocalized(payload, 'actualites', { slug: { equals: item.slug } }, { ...shared, ...local(item) }, local(enItem))
  }

  for (const item of fr.projets) {
    const enItem = en.projets.find((p) => p.slug === item.slug)!
    const shared = { slug: item.slug, order: item.order, icon: item.icon, image: item.image ? media[item.image] : null }
    const local = (p: typeof item) => ({ theme: p.theme, title: p.title, summary: p.summary, body: p.body, source: { label: p.source.label, url: p.source.url } })
    await upsertLocalized(payload, 'projets', { slug: { equals: item.slug } }, { ...shared, ...local(item) }, local(enItem))
  }

  const heroImages = HERO_ORDER.map((k) => media[k] as number)
  await payload.updateGlobal({ slug: 'diaporama', data: { images: heroImages }, context: SEED_CONTEXT })
  await payload.updateGlobal({ slug: 'reglages', data: { facebookUrl: FACEBOOK_URL, heroImages, ...fr.reglages }, locale: 'fr', context: SEED_CONTEXT })
  await payload.updateGlobal({ slug: 'reglages', data: { ...en.reglages }, locale: 'en', context: SEED_CONTEXT })

  await seedAdmin(payload)

  const count = async (collection: 'pages' | 'actualites' | 'projets' | 'medias') => (await payload.count({ collection })).totalDocs
  console.log(`Seed terminé : pages=${await count('pages')} actualites=${await count('actualites')} projets=${await count('projets')} medias=${await count('medias')}`)
}

await seed()
process.exit(0)
