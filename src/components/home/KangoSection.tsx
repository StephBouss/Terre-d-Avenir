import type { CSSProperties } from 'react'
import HeroPauseButton from '@/components/home/HeroPauseButton'
import { Reveal } from '@/components/motion/Reveal'
import { Cta } from '@/components/ui/Cta'
import { MediaImage } from '@/components/ui/MediaImage'
import { Paragraphs } from '@/components/ui/Paragraphs'
import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'
import type { Media } from '@/payload-types'

type Props = { locale: Locale; section?: Section; photos: Media[]; newTabLabel: string; pauseLabel: string; playLabel: string; galerieLabel: string }

/**
 * Bande « Découvrir Kango » de l’accueil : texte et lien vers la page, puis galerie des photos de l’album qui défile
 * en continu, avec légendes ; le survol met une photo en avant et suspend le défilement, un bouton l’arrête (WCAG 2.2.2).
 */
export default function KangoSection({ locale, section, photos, newTabLabel, pauseLabel, playLabel, galerieLabel }: Props) {
  if (!section || isPlaceholder(section.heading)) return null
  const cta = section.ctas?.find((c) => !isPlaceholder(c.label) && !isPlaceholder(c.href))
  // La piste est doublée pour boucler sans à-coup ; la copie est masquée aux lecteurs d’écran.
  // La galerie déborde : elle est focalisable (le focus clavier suspend aussi le défilement).
  const piste = [...photos, ...photos]
  return (
    <section className="py-24 overflow-hidden" id="kango" style={{ background: '#003E2A' }}>
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-end">
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
        <div className="flex flex-col gap-6">
          <Reveal delay={80}>
            <Paragraphs text={section.body} className="text-lg text-primary-foreground leading-relaxed opacity-90" />
          </Reveal>
          {cta && (
            <Reveal delay={160}>
              <Cta locale={locale} variant="gold" href={cta.href} label={cta.label} newTabLabel={newTabLabel} />
            </Reveal>
          )}
        </div>
      </div>

      {photos.length > 0 && (
        <Reveal delay={120} className="mt-10 kango-galerie-bloc">
          <div className="max-w-[1280px] mx-auto px-6 flex justify-end mb-2">
            <HeroPauseButton pauseLabel={pauseLabel} playLabel={playLabel} conteneur=".kango-galerie-bloc" classePause="kango-pause" className="kango-galerie-pause" />
          </div>
          <div data-kango-galerie className="kango-galerie" role="region" aria-label={galerieLabel} tabIndex={0} style={{ '--kango-duree': `${photos.length * 8}s` } as CSSProperties}>
            <ul className="kango-galerie-piste">
              {piste.map((photo, i) => {
                const copie = i >= photos.length
                const legende = photo.caption || photo.alt
                return (
                  <li key={`${photo.id}-${i}`} className="kango-galerie-carte" aria-hidden={copie || undefined} data-copie={copie || undefined}>
                    <figure className="kango-galerie-figure">
                      <div className="kango-galerie-image">
                        <MediaImage media={photo} fill sizes="(min-width: 1024px) 400px, 75vw" className="object-cover" />
                      </div>
                      {(legende || photo.lieu) && (
                        <figcaption className="kango-galerie-legende">
                          {photo.lieu && <span className="kango-galerie-lieu">{photo.lieu}</span>}
                          {legende && <span className="kango-galerie-texte">{legende}</span>}
                        </figcaption>
                      )}
                    </figure>
                  </li>
                )
              })}
            </ul>
          </div>
        </Reveal>
      )}
    </section>
  )
}
