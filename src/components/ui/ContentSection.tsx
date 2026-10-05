import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'
import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'
import { CtaList } from './Cta'
import { Paragraphs } from './Paragraphs'
import SectionHeader from './SectionHeader'

type Props = { locale: Locale; section?: Section; tone?: 'white' | 'light'; id?: string; newTabLabel?: string; children?: ReactNode }

/** Section générique des pages composées : titre, texte, éléments, boutons. */
export default function ContentSection({ locale, section, tone = 'white', id, newTabLabel, children }: Props) {
  if (!section) return null
  const items = (section.items ?? []).filter((item) => !isPlaceholder(item.title) || !isPlaceholder(item.text))
  return (
    <section id={id} className={`py-20 ${tone === 'white' ? 'bg-background' : ''}`} style={tone === 'light' ? { background: '#F7F8F4' } : undefined}>
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-8">
        {section.heading && (
          <Reveal>
            <SectionHeader overline={section.eyebrow} title={section.heading} />
          </Reveal>
        )}
        {section.body && (
          <Reveal className="max-w-[760px]">
            <Paragraphs text={section.body} />
          </Reveal>
        )}
        {items.length > 0 && (
          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item, i) => (
              <div key={item.id ?? i} className="card-lift bg-background rounded-lg border border-border p-6 flex flex-col gap-2" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {!isPlaceholder(item.title) && <h3 className="text-lg font-bold text-foreground font-headings">{item.title}</h3>}
                {!isPlaceholder(item.text) && <Paragraphs text={item.text} className="text-base text-muted-foreground leading-relaxed" />}
              </div>
            ))}
          </RevealGroup>
        )}
        {children}
        <Reveal>
          <CtaList locale={locale} ctas={section.ctas} newTabLabel={newTabLabel} />
        </Reveal>
      </div>
    </section>
  )
}
