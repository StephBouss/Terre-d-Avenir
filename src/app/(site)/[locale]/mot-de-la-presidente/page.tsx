import { notFound } from 'next/navigation'
import { Reveal } from '@/components/motion/Reveal'
import { CtaList } from '@/components/ui/Cta'
import PageHero from '@/components/ui/PageHero'
import { Paragraphs } from '@/components/ui/Paragraphs'
import QuoteMark from '@/components/ui/QuoteMark'
import { getPage, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('mot-de-la-presidente', '/mot-de-la-presidente')

export default async function MotPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, reglages] = await Promise.all([getPage('mot-de-la-presidente', locale), getReglages(locale)])
  if (!page) notFound()
  const message = getSection(page, 'message')
  return (
    <>
      <PageHero eyebrow={dict.nav.mot} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[0]} />
      <section className="bg-background py-24">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-16 items-start">
          <Reveal className="lg:sticky lg:top-28">
            <QuoteMark />
          </Reveal>
          <Reveal className="flex flex-col gap-10 max-w-[720px]">
            <Paragraphs text={message?.body} className="text-lg text-foreground leading-relaxed" />
            <CtaList locale={locale} ctas={message?.ctas} newTabLabel={dict.common.newTab} />
          </Reveal>
        </div>
      </section>
    </>
  )
}
