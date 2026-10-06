import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleBody from '@/components/article/ArticleBody'
import ArticleHero from '@/components/article/ArticleHero'
import { RevealGroup } from '@/components/motion/RevealGroup'
import CtaBand from '@/components/ui/CtaBand'
import NewsCard from '@/components/ui/NewsCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { getActualite, getActualites, getPage } from '@/lib/content'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import { getSection } from '@/lib/sections'
import { SITE_NAME, pageMetadata } from '@/lib/seo'
import { isPlaceholder } from '@/lib/text'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const actualite = await getActualite(slug, locale)
  if (!actualite) return {}
  const image = typeof actualite.image === 'object' ? actualite.image?.url : undefined
  return pageMetadata({ locale, path: `/actualites/${slug}`, title: `${actualite.title} — ${SITE_NAME}`, description: actualite.excerpt, image })
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const [actualite, all, listPage] = await Promise.all([getActualite(slug, locale), getActualites(locale), getPage('actualites', locale)])
  if (!actualite) notFound()
  const others = all.filter((a) => a.slug !== slug).slice(0, 3)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const meta = [
    !isPlaceholder(actualite.category) ? { label: dict.common.category, value: actualite.category! } : null,
    !isPlaceholder(actualite.dateLabel) ? { label: dict.common.date, value: actualite.dateLabel! } : null,
  ].filter((m): m is { label: string; value: string } => m !== null)

  return (
    <>
      <ArticleHero
        locale={locale}
        image={actualite.image}
        category={actualite.category}
        title={actualite.title}
        dateLabel={actualite.dateLabel}
        source={actualite.source}
        newTabLabel={dict.common.newTab}
      />
      <ArticleBody
        lead={actualite.excerpt}
        body={actualite.body}
        meta={meta}
        source={actualite.source}
        newTabLabel={dict.common.newTab}
        share={{ url: siteUrl + localizedHref(locale, `/actualites/${slug}`), labels: { share: dict.common.share, copyLink: dict.common.copyLink, linkCopied: dict.common.linkCopied } }}
      />
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
