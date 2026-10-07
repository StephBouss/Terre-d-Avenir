import { notFound } from 'next/navigation'
import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'
import ActualitesHero from '@/components/news/ActualitesHero'
import { CtaList } from '@/components/ui/Cta'
import CtaBand from '@/components/ui/CtaBand'
import NewsCard from '@/components/ui/NewsCard'
import { Paragraphs } from '@/components/ui/Paragraphs'
import SectionHeader from '@/components/ui/SectionHeader'
import { getActualites, getPage } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('actualites', '/actualites')

export default async function ActualitesPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, actualites] = await Promise.all([getPage('actualites', locale), getActualites(locale)])
  if (!page) notFound()
  const liste = getSection(page, 'liste')
  const fin = getSection(page, 'fin')

  return (
    <>
      <ActualitesHero eyebrow={dict.nav.actualites} title={page.h1 ?? ''} intro={page.intro} image={page.heroImage} />
      <section className="bg-background py-24">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {liste?.heading && <SectionHeader overline={liste.eyebrow} title={liste.heading} />}
            <CtaList locale={locale} ctas={liste?.ctas} newTabLabel={dict.common.newTab} />
          </Reveal>
          {actualites.length > 0 ? (
            <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actualites.map((a) => (
                <NewsCard key={a.id} locale={locale} actualite={a} labels={{ readArticle: dict.common.readArticle, newTab: dict.common.newTab }} />
              ))}
            </RevealGroup>
          ) : (
            <Paragraphs text={getSection(page, 'vide')?.body} />
          )}
        </div>
      </section>
      <CtaBand locale={locale} ctas={fin?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
