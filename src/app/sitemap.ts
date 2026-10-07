import type { MetadataRoute } from 'next'
import { getActualites, getAlbums, getProjets } from '@/lib/content'
import { STATIC_PATHS } from '@/lib/routes'
import { buildSitemapEntries, siteUrl } from '@/lib/seo'

// Les slugs viennent de la base : pas de requête Payload au build.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [actualites, projets, albums] = await Promise.all([getActualites('fr'), getProjets('fr'), getAlbums('fr')])
  const albumsEn = new Set((await getAlbums('en')).map((a) => a.slug))
  const albumPath = (slug: string) => `/mediatheque/albums/${slug}`
  return buildSitemapEntries(siteUrl(), [
    ...STATIC_PATHS,
    ...actualites.map((a) => `/actualites/${a.slug}`),
    ...projets.map((p) => `/projets/${p.slug}`),
    ...albums.filter((a) => albumsEn.has(a.slug)).map((a) => albumPath(a.slug)),
  ]).concat(
    // Album sans titre anglais : listé en français seulement.
    buildSitemapEntries(siteUrl(), albums.filter((a) => !albumsEn.has(a.slug)).map((a) => albumPath(a.slug)), ['fr']),
  )
}
