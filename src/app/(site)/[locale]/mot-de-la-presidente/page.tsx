import { notFound } from 'next/navigation'
import { Reveal } from '@/components/motion/Reveal'
import { CtaList } from '@/components/ui/Cta'
import GoldDivider from '@/components/ui/GoldDivider'
import PageHero from '@/components/ui/PageHero'
import { Paragraphs } from '@/components/ui/Paragraphs'
import PortraitPresidente from '@/components/ui/PortraitPresidente'
import { getPage, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'

export const generateMetadata = metadataFor('mot-de-la-presidente', '/mot-de-la-presidente')

export default async function MotPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, reglages] = await Promise.all([getPage('mot-de-la-presidente', locale), getReglages(locale).catch(() => null)])
  if (!page) notFound()
  const message = getSection(page, 'message')
  const signature = getSection(page, 'signature')
  return (
    <>
      <PageHero eyebrow={dict.nav.mot} title={page.h1 ?? ''} intro={page.intro} image={page.heroImage} />
      <section className="bg-background py-24">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-16 items-start">
          <Reveal className="lg:sticky lg:top-28">
            <PortraitPresidente portrait={reglages?.portraitPresidente} />
          </Reveal>
          <Reveal className="flex flex-col gap-10 max-w-[720px]">
            <Paragraphs text={message?.body} className="text-lg text-foreground leading-relaxed" />
            {!isPlaceholder(signature?.heading) && (
              <div data-signature className="flex flex-col gap-2">
                <GoldDivider />
                <p className="text-2xl text-primary" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                  {signature!.heading}
                </p>
                {!isPlaceholder(signature!.body) && <p className="text-sm font-semibold text-muted-foreground font-body">{signature!.body}</p>}
              </div>
            )}
            <CtaList locale={locale} ctas={message?.ctas} newTabLabel={dict.common.newTab} uneLigne />
          </Reveal>
        </div>
      </section>
    </>
  )
}
