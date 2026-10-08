import { Reveal } from '@/components/motion/Reveal'
import { Cta } from '@/components/ui/Cta'
import GoldDivider from '@/components/ui/GoldDivider'
import PortraitPresidente from '@/components/ui/PortraitPresidente'
import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'
import type { Media } from '@/payload-types'

type Props = { locale: Locale; section?: Section; signature?: Section; portrait?: Media | number | null; newTabLabel: string }

/** Mot de la présidente sur l’accueil ; la signature est celle de la page « Mot de la présidente » (section « signature »). */
export default function MotTeaser({ locale, section, signature, portrait, newTabLabel }: Props) {
  if (!section || isPlaceholder(section.body)) return null
  const cta = section.ctas?.[0]
  return (
    <section className="py-24" id="mot-presidente" style={{ background: '#F7F8F4' }}>
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 gap-20 items-center">
        <Reveal className="flex justify-center order-last">
          <PortraitPresidente portrait={portrait} />
        </Reveal>

        <div className="flex flex-col gap-5">
          <Reveal>
            {!isPlaceholder(section.heading) && (
              <h2
                className="text-xs font-bold font-body uppercase"
                style={{ letterSpacing: '0.14em', color: '#005C38', background: '#E6BF5820', border: '1px solid #E6BF5850', borderRadius: 4, padding: '3px 10px', display: 'inline-block' }}
              >
                {section.heading}
              </h2>
            )}
          </Reveal>
          <Reveal delay={80}>
            {/* Justifié seulement sur grand écran : sur une colonne étroite, il creuse de grands blancs entre les mots. */}
            <blockquote className="text-left lg:text-justify" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, lineHeight: 1.65, color: '#17372C' }}>
              {section.body}
            </blockquote>
          </Reveal>
          <GoldDivider />
          {signature && !isPlaceholder(signature.heading) && (
            <Reveal delay={120}>
              <div data-signature className="flex flex-col gap-1">
                <p className="text-2xl text-primary" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                  {signature.heading}
                </p>
                {!isPlaceholder(signature.body) && <p className="text-sm font-semibold text-muted-foreground font-body">{signature.body}</p>}
              </div>
            </Reveal>
          )}
          {cta && (
            <Reveal delay={160}>
              <Cta locale={locale} href={cta.href} label={cta.label} variant="primary" newTabLabel={newTabLabel} />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
