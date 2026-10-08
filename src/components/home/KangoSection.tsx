import { Reveal } from '@/components/motion/Reveal'
import { Cta } from '@/components/ui/Cta'
import { MediaImage } from '@/components/ui/MediaImage'
import { Paragraphs } from '@/components/ui/Paragraphs'
import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'
import type { Media } from '@/payload-types'

type Props = { locale: Locale; section?: Section; photos: Media[]; newTabLabel: string }

/** Bande « Découvrir Kango » de l’accueil : texte et lien vers la page, mosaïque des 3 premières photos de l’album. */
export default function KangoSection({ locale, section, photos, newTabLabel }: Props) {
  if (!section || isPlaceholder(section.heading)) return null
  const cta = section.ctas?.find((c) => !isPlaceholder(c.label) && !isPlaceholder(c.href))
  const [grande, ...petites] = photos.slice(0, 3)
  return (
    <section className="py-24 overflow-hidden" id="kango" style={{ background: '#003E2A' }}>
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 gap-20 items-center">
        <div className="flex flex-col gap-6">
          <Reveal className="flex flex-col gap-3">
            {!isPlaceholder(section.eyebrow) && (
              <span
                className="text-xs font-bold font-body uppercase self-start"
                style={{ letterSpacing: '0.14em', color: '#E6BF58', background: 'rgba(230,191,88,0.14)', border: '1px solid rgba(230,191,88,0.4)', borderRadius: 4, padding: '3px 10px' }}
              >
                {section.eyebrow}
              </span>
            )}
            <h2 className="text-4xl font-bold text-primary-foreground font-headings" style={{ lineHeight: 1.15 }}>
              {section.heading}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <Paragraphs text={section.body} className="text-lg text-primary-foreground leading-relaxed opacity-90" />
          </Reveal>
          {cta && (
            <Reveal delay={160}>
              <Cta locale={locale} variant="gold" href={cta.href} label={cta.label} newTabLabel={newTabLabel} />
            </Reveal>
          )}
        </div>

        {grande && (
          <Reveal className="kango-mosaique">
            <div className="kango-mosaique-grande">
              <MediaImage media={grande} fill decorative sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
            </div>
            {petites.map((photo) => (
              <div key={photo.id} className="kango-mosaique-petite">
                <MediaImage media={photo} fill decorative sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" />
              </div>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  )
}
