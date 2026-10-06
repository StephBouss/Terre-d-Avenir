import type { MetadataRoute } from 'next'
import { getActualites, getProjets } from '@/lib/content'
import { STATIC_PATHS } from '@/lib/routes'
import { buildSitemapEntries, siteUrl } from '@/lib/seo'

// Les slugs viennent de la base : pas de requête Payload au build.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [actualites, projets] = await Promise.all([getActualites('fr'), getProjets('fr')])
  return buildSitemapEntries(siteUrl(), [
    ...STATIC_PATHS,
    ...actualites.map((a) => `/actualites/${a.slug}`),
    ...projets.map((p) => `/projets/${p.slug}`),
  ])
}
