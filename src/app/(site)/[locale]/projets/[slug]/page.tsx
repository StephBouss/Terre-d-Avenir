import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleBody from '@/components/article/ArticleBody'
import ArticleHero from '@/components/article/ArticleHero'
import { RevealGroup } from '@/components/motion/RevealGroup'
import CtaBand from '@/components/ui/CtaBand'
import ProjetCard from '@/components/ui/ProjetCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { getPage, getProjet, getProjets } from '@/lib/content'
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
  const projet = await getProjet(slug, locale)
  if (!projet) return {}
  const image = typeof projet.image === 'object' ? projet.image?.url : undefined
  return pageMetadata({ locale, path: `/projets/${slug}`, title: `${projet.theme} — ${SITE_NAME}`, description: isPlaceholder(projet.summary) ? undefined : projet.summary, image })
}

export default async function ProjetPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const [projet, all, listPage] = await Promise.all([getProjet(slug, locale), getProjets(locale), getPage('projets', locale)])
  if (!projet) notFound()
  const others = all.filter((p) => p.slug !== slug)
  const title = isPlaceholder(projet.title) ? projet.theme : projet.title!

  return (
    <>
      <ArticleHero locale={locale} image={projet.image} category={projet.theme} title={title} source={projet.source} newTabLabel={dict.common.newTab} />
      <ArticleBody
        body={projet.body}
        meta={[{ label: dict.common.category, value: projet.theme }]}
        source={projet.source}
        newTabLabel={dict.common.newTab}
        share={{ url: siteUrl() + localizedHref(locale, `/projets/${slug}`), labels: { newTab: dict.common.newTab, share: dict.common.share, copyLink: dict.common.copyLink, linkCopied: dict.common.linkCopied } }}
      />
      {others.length > 0 && (
        <section className="py-20" style={{ background: '#F7F8F4' }}>
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
            <SectionHeader overline={dict.nav.projets} title={dict.common.otherProjects} />
            <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {others.map((p) => (
                <ProjetCard key={p.id} locale={locale} projet={p} linkLabel={dict.common.learnMore} />
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
      <CtaBand locale={locale} ctas={getSection(listPage, 'fin')?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
