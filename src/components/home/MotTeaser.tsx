import { Reveal } from '@/components/motion/Reveal'
import { Cta } from '@/components/ui/Cta'
import GoldDivider from '@/components/ui/GoldDivider'
import QuoteMark from '@/components/ui/QuoteMark'
import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'

type Props = { locale: Locale; section?: Section; newTabLabel: string }

export default function MotTeaser({ locale, section, newTabLabel }: Props) {
  if (!section || isPlaceholder(section.body)) return null
  const cta = section.ctas?.[0]
  return (
    <section className="py-24" id="mot-presidente" style={{ background: '#F7F8F4' }}>
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 gap-20 items-center">
        <Reveal className="flex justify-center order-last">
          <QuoteMark />
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
            <blockquote style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, lineHeight: 1.65, color: '#17372C', textAlign: 'justify' }}>{section.body}</blockquote>
          </Reveal>
          <GoldDivider />
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
