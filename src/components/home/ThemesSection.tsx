import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'
import ActionThemeCard from '@/components/ui/ActionThemeCard'
import { Cta } from '@/components/ui/Cta'
import SectionHeader from '@/components/ui/SectionHeader'
import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'
import type { Projet } from '@/payload-types'

type Props = { locale: Locale; section?: Section; projets: Projet[]; overline: string; linkLabel: string; newTabLabel: string }

export default function ThemesSection({ locale, section, projets, overline, linkLabel, newTabLabel }: Props) {
  if (!section || isPlaceholder(section.heading) || projets.length === 0) return null
  const cta = section.ctas?.[0]
  return (
    <section className="bg-background py-24" id="actions">
      <div className="max-w-[1280px] mx-auto px-6">
        <Reveal className="section-heading-row flex items-end justify-between mb-12">
          <SectionHeader overline={overline} title={section.heading!} />
          {cta && <Cta locale={locale} variant="link" href={cta.href} label={cta.label} newTabLabel={newTabLabel} className="flex-shrink-0" />}
        </Reveal>
        <RevealGroup className="grid grid-cols-4 gap-5">
          {projets.map((projet) => (
            <ActionThemeCard key={projet.id} locale={locale} projet={projet} linkLabel={linkLabel} />
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
