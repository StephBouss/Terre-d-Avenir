import { Reveal } from '@/components/motion/Reveal'
import { Cta } from '@/components/ui/Cta'
import { MediaImage } from '@/components/ui/MediaImage'
import { Paragraphs } from '@/components/ui/Paragraphs'
import SectionHeader from '@/components/ui/SectionHeader'
import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'
import type { Media } from '@/payload-types'

type Props = { locale: Locale; section?: Section; image?: Media; linkLabel: string; newTabLabel: string }

export default function AncrageSection({ locale, section, image, linkLabel, newTabLabel }: Props) {
  if (!section || isPlaceholder(section.heading)) return null
  return (
    <section className="bg-background py-24" id="ong">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 gap-20 items-center">
        <Reveal className="relative">
          <div className="rounded-lg overflow-hidden relative" style={{ aspectRatio: '4 / 3' }}>
            <MediaImage media={image} fill decorative sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
          </div>
        </Reveal>

        <div className="flex flex-col gap-6">
          <Reveal>
            <SectionHeader overline={isPlaceholder(section.eyebrow) ? undefined : section.eyebrow} title={section.heading!} />
          </Reveal>
          <Reveal delay={80}>
            <Paragraphs text={section.body} className="text-base text-foreground leading-relaxed" />
          </Reveal>
          <Reveal delay={160}>
            <Cta locale={locale} variant="link" href="/ong" label={linkLabel} newTabLabel={newTabLabel} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
