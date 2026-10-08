import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleBody from '@/components/article/ArticleBody'
import ArticleHero from '@/components/article/ArticleHero'
import { RevealGroup } from '@/components/motion/RevealGroup'
import PreviewBanner from '@/components/layout/PreviewBanner'
import { Cta } from '@/components/ui/Cta'
import CtaBand from '@/components/ui/CtaBand'
import NewsCard from '@/components/ui/NewsCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { isPublishedAlbum } from '@/lib/albums'
import { getActualite, getActualites, getPage, isPreviewing } from '@/lib/content'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import { getSection } from '@/lib/sections'
import { SITE_NAME, pageMetadata, siteUrl } from '@/lib/seo'
import { isPlaceholder } from '@/lib/text'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const preview = await isPreviewing()
  const actualite = await getActualite(slug, locale, preview)
  if (!actualite) return {}
  const image = typeof actualite.image === 'object' ? actualite.image?.url : undefined
  const metadata = pageMetadata({ locale, path: `/actualites/${slug}`, title: `${actualite.title} — ${SITE_NAME}`, description: actualite.excerpt, image })
  return preview ? { ...metadata, robots: { index: false, follow: false } } : metadata
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const preview = await isPreviewing()
  const [actualite, all, listPage] = await Promise.all([getActualite(slug, locale, preview), getActualites(locale), getPage('actualites', locale)])
  if (!actualite) notFound()
  const others = all.filter((a) => a.slug !== slug).slice(0, 3)
  const meta = [
    !isPlaceholder(actualite.category) ? { label: dict.common.category, value: actualite.category! } : null,
    !isPlaceholder(actualite.dateLabel) ? { label: dict.common.date, value: actualite.dateLabel! } : null,
  ].filter((m): m is { label: string; value: string } => m !== null)

  return (
    <>
      {preview && <PreviewBanner label={dict.preview.banner} exitLabel={dict.preview.exit} exitHref={`/api/apercu/fin?path=${encodeURIComponent(`/${locale}/actualites/${slug}`)}`} />}
      <ArticleHero
        locale={locale}
        image={actualite.image}
        category={actualite.category}
        title={actualite.title}
        dateLabel={actualite.dateLabel}
        source={actualite.source}
        newTabLabel={dict.common.newTab}
        back={{ href: '/actualites', label: dict.common.backToNews }}
      />
      <ArticleBody
        lead={actualite.excerpt}
        body={actualite.body}
        meta={meta}
        source={actualite.source}
        newTabLabel={dict.common.newTab}
        share={{ url: siteUrl() + localizedHref(locale, `/actualites/${slug}`), labels: { newTab: dict.common.newTab, share: dict.common.share, copyLink: dict.common.copyLink, linkCopied: dict.common.linkCopied } }}
      />
      <div className="bg-background pb-12">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap gap-4">
          <Cta locale={locale} href="/actualites" label={dict.common.backToNews} variant="outline" back newTabLabel={dict.common.newTab} />
          {isPublishedAlbum(actualite.album) && !isPlaceholder(actualite.album.title) && (
            <Cta locale={locale} href={`/mediatheque/albums/${actualite.album.slug}`} label={dict.albums.viewAlbum} newTabLabel={dict.common.newTab} />
          )}
        </div>
      </div>
      {others.length > 0 && (
        <section className="bg-background py-20">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
            <SectionHeader overline={dict.nav.actualites} title={dict.common.otherNews} />
            <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.map((a) => (
                <NewsCard key={a.id} locale={locale} actualite={a} labels={{ readArticle: dict.common.readArticle, newTab: dict.common.newTab }} />
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
      <CtaBand locale={locale} ctas={getSection(listPage, 'fin')?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
