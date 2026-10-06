import { notFound } from 'next/navigation'
import AdhesionForm from '@/components/forms/AdhesionForm'
import ClosedNotice from '@/components/forms/ClosedNotice'
import StepsSection from '@/components/forms/StepsSection'
import { Reveal } from '@/components/motion/Reveal'
import FaqList from '@/components/ui/FaqList'
import PageHero from '@/components/ui/PageHero'
import { Paragraphs } from '@/components/ui/Paragraphs'
import SectionHeader from '@/components/ui/SectionHeader'
import { getPage, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('adhesion', '/adhesion')

export default async function AdhesionPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, reglages] = await Promise.all([getPage('adhesion', locale), getReglages(locale)])
  if (!page) notFound()
  const section = (key: string) => getSection(page, key)
  const indisponible = section('indisponible')
  const formulaire = section('formulaire')
  return (
    <>
      <PageHero eyebrow={dict.nav.adhesion} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[1]} />
      <section className="bg-background pt-12">
        <div className="max-w-[1280px] mx-auto px-6">
          <ClosedNotice locale={locale} text={indisponible?.body} ctas={indisponible?.ctas} newTabLabel={dict.common.newTab} />
        </div>
      </section>
      <StepsSection section={section('etapes')} />
      <section id="formulaire" className="bg-background py-20">
        <div className="max-w-[960px] mx-auto px-6 flex flex-col gap-8">
          <Reveal className="flex flex-col gap-4">
            {formulaire?.heading && <SectionHeader title={formulaire.heading} />}
            <Paragraphs text={formulaire?.body} className="text-base text-muted-foreground" />
          </Reveal>
          <Reveal>
            <AdhesionForm locale={locale} labels={dict.adhesionForm} />
          </Reveal>
        </div>
      </section>
      <section className="py-20" style={{ background: '#F7F8F4' }}>
        <div className="max-w-[880px] mx-auto px-6">
          <FaqList section={section('faq')} />
        </div>
      </section>
    </>
  )
}
