import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'
import { Cta } from '@/components/ui/Cta'
import NewsCard from '@/components/ui/NewsCard'
import SectionHeader from '@/components/ui/SectionHeader'
import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'
import type { Actualite } from '@/payload-types'

type Props = { locale: Locale; section?: Section; actualites: Actualite[]; overline: string; labels: { readArticle: string; newTab: string } }

export default function NewsSection({ locale, section, actualites, overline, labels }: Props) {
  if (!section || isPlaceholder(section.heading) || actualites.length === 0) return null
  const cta = section.ctas?.[0]
  return (
    <section className="py-24" style={{ background: '#F7F8F4' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <Reveal className="section-heading-row flex items-end justify-between mb-12">
          <SectionHeader overline={overline} title={section.heading!} />
          {cta && <Cta locale={locale} variant="link" href={cta.href} label={cta.label} newTabLabel={labels.newTab} className="flex-shrink-0" />}
        </Reveal>
        <RevealGroup className="grid grid-cols-3 gap-6">
          {actualites.map((actualite) => (
            <NewsCard key={actualite.id} locale={locale} actualite={actualite} labels={labels} />
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
