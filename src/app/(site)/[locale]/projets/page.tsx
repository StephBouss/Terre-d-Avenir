import { notFound } from 'next/navigation'
import { RevealGroup } from '@/components/motion/RevealGroup'
import CtaBand from '@/components/ui/CtaBand'
import PageHero from '@/components/ui/PageHero'
import { Paragraphs } from '@/components/ui/Paragraphs'
import ProjetCard from '@/components/ui/ProjetCard'
import { getPage, getProjets, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('projets', '/projets')

export default async function ProjetsPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, projets, reglages] = await Promise.all([getPage('projets', locale), getProjets(locale), getReglages(locale)])
  if (!page) notFound()
  return (
    <>
      <PageHero eyebrow={dict.nav.projets} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[3]} />
      <section className="bg-background py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          {projets.length > 0 ? (
            <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projets.map((p) => (
                <ProjetCard key={p.id} locale={locale} projet={p} linkLabel={dict.common.learnMore} />
              ))}
            </RevealGroup>
          ) : (
            <Paragraphs text={getSection(page, 'vide')?.body} />
          )}
        </div>
      </section>
      <CtaBand locale={locale} ctas={getSection(page, 'fin')?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
