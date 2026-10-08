import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import type { PageSlug } from '../collections/Pages'
import { en } from './data/en'
import { FACEBOOK_URL, fr } from './data/fr'
import { ALBUM_PHOTO_SETS } from './data/photos'
import type { SeedAlbumPhotoKey, SeedImageKey } from './data/types'
import { seedTextesDiaporama } from './diaporama'
import { upsertMedia } from './media'
import { seedOrganigramme } from './organigramme'
import { seedPortraitPresidente } from './presidente'
import { SEED_CONTEXT, upsertLocalized } from './upsert'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Image d'en-tête de chaque page (correspondance du lot 1 conservée ; l'accueil utilise le diaporama).
const PAGE_HERO: Partial<Record<PageSlug, SeedImageKey | SeedAlbumPhotoKey>> = {
  ong: 'community',
  'mot-de-la-presidente': 'forest',
  organisation: 'solidarity',
  projets: 'education',
  actualites: 'forest',
  adhesion: 'youth',
  mediatheque: 'sport',
  'decouvrir-kango': 'kango-1',
  partenariats: 'solidarity',
  transparence: 'community',
  contact: 'forest',
  confidentialite: 'forest',
  'mentions-legales': 'forest',
}

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

async function seedMedia(payload: Payload): Promise<Record<SeedImageKey | SeedAlbumPhotoKey, number | string>> {
  const ids = {} as Record<SeedImageKey | SeedAlbumPhotoKey, number | string>
  for (const [key, meta] of Object.entries(IMAGES) as [SeedImageKey, (typeof IMAGES)[SeedImageKey]][]) {
    ids[key] = await upsertMedia(payload, {
      key,
      filePath: path.join(dirname, 'images', `${key}.jpg`),
      data: { credit: meta.credit, provisoire: meta.provisoire, galerie: meta.galerie },
      altFr: meta.altFr,
      altEn: meta.altEn,
    })
  }
  for (const set of ALBUM_PHOTO_SETS) {
    for (const photo of set.photos) {
      ids[photo.key] = await upsertMedia(payload, {
        // Nom téléversé « <dossier>-N-photo.jpg » : une clé « photo-N » serait renumérotée par Payload (photo-1 → photo-7).
        key: `${set.dir}-${photo.key.slice(photo.key.lastIndexOf('-') + 1)}-photo`,
        filePath: path.join(dirname, 'images', 'albums', set.dir, photo.file),
        data: set.common,
        altFr: photo.altFr,
        altEn: photo.altEn,
        lieu: set.lieu,
      })
    }
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
  // Le compte SEED_ADMIN_EMAIL est l’administrateur principal : tout autre administrateur (ex. compte repris
  // d’une ancienne base) redevient un compte limité sans accès, à régler ensuite depuis l’admin.
  const context = { ...SEED_CONTEXT, designerAdministrateur: true }
  const autres = await payload.find({ collection: 'users', where: { and: [{ role: { equals: 'administrateur' } }, { email: { not_equals: email } }] }, depth: 0, limit: 10 })
  for (const u of autres.docs) await payload.update({ collection: 'users', id: u.id, data: { role: 'personnalise' }, context })
  const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0 })
  if (!found.docs[0]) await payload.create({ collection: 'users', data: { email, password, nom: 'Administrateur', role: 'administrateur' }, context })
  else if (found.docs[0].role !== 'administrateur') await payload.update({ collection: 'users', id: found.docs[0].id, data: { role: 'administrateur' }, context })
}

async function seed() {
  const payload = await getPayload({ config })
  const media = await seedMedia(payload)

  for (const page of fr.pages) {
    const enPage = en.pages.find((p) => p.slug === page.slug)!
    const { slug, ...frData } = page
    const enData: Record<string, unknown> = { ...enPage }
    delete enData.slug
    await upsertLocalized(payload, 'pages', { slug: { equals: slug } }, { slug, ...frData, heroImage: PAGE_HERO[slug as PageSlug] ? media[PAGE_HERO[slug as PageSlug]!] : null }, enData)
  }

  // Les albums sont seedés avant les actualités, qui y renvoient.
  const albumIds: Record<string, number | string> = {}
  for (const album of fr.albums) {
    const enAlbum = en.albums.find((a) => a.slug === album.slug)!
    const shared = { slug: album.slug, order: album.order, _status: 'published', date: album.date ?? null, cover: media[album.cover], photos: album.photos.map((k) => media[k]) }
    const local = (a: typeof album) => ({ title: a.title, dateLabel: a.dateLabel, description: a.description })
    albumIds[album.slug] = await upsertLocalized(payload, 'albums', { slug: { equals: album.slug } }, { ...shared, ...local(album) }, local(enAlbum))
  }

  for (const item of fr.actualites) {
    const enItem = en.actualites.find((a) => a.slug === item.slug)!
    const shared = { slug: item.slug, order: item.order, _status: 'published', archivee: false, date: item.date ?? null, image: item.image ? media[item.image] : null, album: item.album ? albumIds[item.album] : null, source: { url: item.source.url } }
    const local = (a: typeof item) => ({ title: a.title, category: a.category, dateLabel: a.dateLabel, excerpt: a.excerpt, body: a.body ?? '', source: { label: a.source.label, url: a.source.url } })
    await upsertLocalized(payload, 'actualites', { slug: { equals: item.slug } }, { ...shared, ...local(item) }, local(enItem))
  }

  for (const item of fr.projets) {
    const enItem = en.projets.find((p) => p.slug === item.slug)!
    const shared = { slug: item.slug, order: item.order, icon: item.icon, image: item.image ? media[item.image] : null }
    const local = (p: typeof item) => ({ theme: p.theme, title: p.title, summary: p.summary, body: p.body, source: { label: p.source.label, url: p.source.url } })
    await upsertLocalized(payload, 'projets', { slug: { equals: item.slug } }, { ...shared, ...local(item) }, local(enItem))
  }

  await seedOrganigramme(payload, dirname)

  const heroImages = HERO_ORDER.map((k) => media[k] as number)
  await payload.updateGlobal({ slug: 'diaporama', data: { images: heroImages }, context: SEED_CONTEXT })
  await seedTextesDiaporama(payload)
  const portraitPresidente = await seedPortraitPresidente(payload, dirname)
  await payload.updateGlobal({
    slug: 'reglages',
    data: { facebookUrl: FACEBOOK_URL, ...fr.reglages, portraitPresidente: portraitPresidente as number },
    locale: 'fr',
    context: SEED_CONTEXT,
  })
  await payload.updateGlobal({ slug: 'reglages', data: { ...en.reglages }, locale: 'en', context: SEED_CONTEXT })

  await seedAdmin(payload)

  const count = async (collection: 'pages' | 'albums' | 'actualites' | 'projets' | 'medias' | 'postes') => (await payload.count({ collection })).totalDocs
  console.log(`Seed terminé : pages=${await count('pages')} albums=${await count('albums')} actualites=${await count('actualites')} projets=${await count('projets')} postes=${await count('postes')} medias=${await count('medias')}`)
}

await seed()
process.exit(0)
