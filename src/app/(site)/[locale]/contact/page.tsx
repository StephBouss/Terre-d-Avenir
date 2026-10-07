import { notFound } from 'next/navigation'
import ClosedNotice from '@/components/forms/ClosedNotice'
import ContactForm from '@/components/forms/ContactForm'
import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'
import { CtaList } from '@/components/ui/Cta'
import Icon from '@/components/ui/Icon'
import { MediaImage } from '@/components/ui/MediaImage'
import PageHero from '@/components/ui/PageHero'
import { Paragraphs } from '@/components/ui/Paragraphs'
import { getPage } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'

export const generateMetadata = metadataFor('contact', '/contact')

const ORIENTATIONS = [
  { key: 'adhesion', icon: 'user-plus', anchor: undefined },
  { key: 'partenariat', icon: 'handshake', anchor: 'partenariat' },
  { key: 'question', icon: 'mail', anchor: undefined },
] as const

export default async function ContactPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const page = await getPage('contact', locale)
  if (!page) notFound()
  const section = (key: string) => getSection(page, key)
  const formulaire = section('formulaire')
  const localisation = section('localisation')

  return (
    <>
      <PageHero eyebrow={dict.nav.contact} title={page.h1 ?? ''} intro={page.intro} image={page.heroImage} />
      <section className="bg-background py-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <RevealGroup className="flex flex-col gap-6">
            {ORIENTATIONS.map(({ key, icon, anchor }) => {
              const s = section(key)
              if (!s || isPlaceholder(s.heading)) return null
              return (
                <div key={key} id={anchor} className="card-lift bg-background rounded-lg border border-border p-6 flex flex-col gap-3 scroll-mt-28" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div className="w-11 h-11 rounded-md flex items-center justify-center" style={{ background: '#F0F5EF' }}>
                    <Icon i={icon} size={22} className="text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground font-headings">{s.heading}</h2>
                  <Paragraphs text={s.body} className="text-base text-muted-foreground leading-relaxed" />
                  <CtaList locale={locale} ctas={s.ctas} newTabLabel={dict.common.newTab} />
                </div>
              )
            })}
          </RevealGroup>
          <Reveal className="lg:col-span-2 bg-background rounded-lg border border-border p-8 flex flex-col gap-6">
            {!isPlaceholder(formulaire?.heading) && <h2 className="text-2xl font-bold text-foreground font-headings">{formulaire?.heading}</h2>}
            <ClosedNotice locale={locale} text={formulaire?.body} ctas={formulaire?.ctas} newTabLabel={dict.common.newTab} />
            <ContactForm labels={dict.contactForm} />
          </Reveal>
        </div>
      </section>
      {localisation && !isPlaceholder(localisation.body) && (
        <section className="bg-background pb-24">
          <Reveal className="max-w-[1280px] mx-auto px-6">
            {!isPlaceholder(localisation.heading) && <h2 className="text-2xl font-bold text-foreground font-headings mb-6">{localisation.heading}</h2>}
            <div className="relative w-full rounded-lg overflow-hidden flex items-center justify-center" style={{ height: 320, background: '#F7F8F4', border: '1px solid #e8e8e8' }}>
              <div className="absolute inset-0" style={{ opacity: 0.7 }}>
                <MediaImage media={page.heroImage} fill decorative sizes="100vw" className="w-full h-full object-cover" />
              </div>
              <div className="absolute flex flex-col items-center gap-2">
                <div className="rounded-full w-12 h-12 flex items-center justify-center" style={{ background: '#005C38' }}>
                  <Icon i="map-pin" size={24} style={{ color: '#E6BF58' }} />
                </div>
                <div className="rounded-md px-4 py-2" style={{ background: '#003E2A', color: '#fff' }}>
                  <p className="text-sm font-bold font-body">{localisation.body}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}
    </>
  )
}
