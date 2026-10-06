import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'
import { Cta } from '@/components/ui/Cta'
import { Paragraphs } from '@/components/ui/Paragraphs'
import SectionHeader from '@/components/ui/SectionHeader'
import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'

type Props = { locale: Locale; section?: Section; newTabLabel: string }

const CARDS = [
  { variant: 'gold', icon: 'user-plus', style: { background: 'rgba(0,0,0,0.12)' } },
  { variant: 'outline-light', icon: 'handshake', style: { borderLeft: '1px solid rgba(255,255,255,0.12)' } },
] as const

export default function ParticiperSection({ locale, section, newTabLabel }: Props) {
  if (!section || isPlaceholder(section.heading)) return null
  const ctas = (section.ctas ?? []).filter((c) => !isPlaceholder(c.label) && !isPlaceholder(c.href)).slice(0, 2)
  return (
    <section className="bg-background py-24">
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-12">
        <Reveal className="flex flex-col gap-4 max-w-[760px]">
          <SectionHeader title={section.heading!} />
          <Paragraphs text={section.body} />
        </Reveal>
        {ctas.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ background: '#005C38' }}>
            <RevealGroup className="home-cta-grid grid grid-cols-2 gap-0">
              {ctas.map((cta, i) => (
                <div key={cta.id ?? cta.href} className="flex flex-col gap-5 p-12" style={CARDS[i].style}>
                  <h3 className="text-3xl font-bold text-primary-foreground font-headings" style={{ lineHeight: 1.2 }}>
                    {cta.label}
                  </h3>
                  <Cta locale={locale} href={cta.href} label={cta.label} variant={CARDS[i].variant} icon={CARDS[i].icon} newTabLabel={newTabLabel} className="w-fit" />
                </div>
              ))}
            </RevealGroup>
          </div>
        )}
      </div>
    </section>
  )
}
