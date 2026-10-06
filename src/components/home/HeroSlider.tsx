import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'
import type { Media } from '@/payload-types'
import { Cta } from '@/components/ui/Cta'
import { EmphasisText } from '@/components/ui/EmphasisText'
import { MediaImage } from '@/components/ui/MediaImage'
import HeroPauseButton from './HeroPauseButton'

type Props = { locale: Locale; title: string; intro?: string | null; section?: Section; images: Media[]; newTabLabel: string; pauseLabel: string; playLabel: string }

const BLOBS = ['hero-photo-1', 'hero-photo-2', 'hero-photo-3']

/** Diaporama en CSS (voir globals.css) ; seul le bouton de pause (WCAG 2.2.2) est un composant client. */
export default function HeroSlider({ locale, title, intro, section, images, newTabLabel, pauseLabel, playLabel }: Props) {
  const ctas = (section?.ctas ?? []).filter((c) => !isPlaceholder(c.label) && !isPlaceholder(c.href))
  const photo = (index: number) => (images.length > 0 ? images[index % images.length] : undefined)
  return (
    <section className="hero-slider">
      {[0, 1, 2].map((i) => (
        <div key={i} className="hero-slide">
          <MediaImage media={photo(i)} fill decorative eager={i === 0} sizes="100vw" className="object-cover" />
        </div>
      ))}

      <div className="hero-overlay" />
      <div className="hero-progress" />
      <HeroPauseButton pauseLabel={pauseLabel} playLabel={playLabel} />

      <div className="hero-nav" aria-hidden="true">
        <div className="hero-nav-dot active" />
        <div className="hero-nav-dot" />
        <div className="hero-nav-dot" />
      </div>

      <div className="hero-content max-w-[1280px] mx-auto px-6 w-full">
        <div className="flex items-center justify-between w-full gap-12">
          <div style={{ maxWidth: 620, flex: '1 1 auto' }}>
            {!isPlaceholder(section?.eyebrow) && (
              <div className="hero-line-1 mb-6">
                <span
                  className="text-xs font-bold font-body uppercase"
                  style={{ letterSpacing: '0.14em', color: '#E6BF58', background: 'rgba(230,191,88,0.14)', border: '1px solid rgba(230,191,88,0.4)', borderRadius: 4, padding: '4px 12px', display: 'inline-block' }}
                >
                  {section?.eyebrow}
                </span>
              </div>
            )}

            <h1 className="hero-line-2 font-headings font-bold text-primary-foreground mb-5" style={{ fontSize: 52, lineHeight: 1.1 }}>
              <EmphasisText text={title} />
            </h1>

            {!isPlaceholder(intro) && (
              <p className="hero-line-3 font-body text-lg text-primary-foreground mb-8" style={{ opacity: 0.82, lineHeight: 1.65, maxWidth: 500, textAlign: 'justify' }}>
                {intro}
              </p>
            )}

            {ctas.length > 0 && (
              <div className="hero-line-4 flex gap-4 flex-wrap">
                <Cta locale={locale} href={ctas[0].href} label={ctas[0].label} variant="gold" icon="user-plus" newTabLabel={newTabLabel} />
                {ctas[1] && <Cta locale={locale} href={ctas[1].href} label={ctas[1].label} variant="outline-light" newTabLabel={newTabLabel} />}
              </div>
            )}
          </div>

          <div className="hero-collage flex-shrink-0" aria-hidden="true">
            <div className="hero-dot-decor" style={{ width: 10, height: 10, top: -10, right: 60 }} />
            <div className="hero-dot-decor" style={{ width: 14, height: 14, bottom: 60, left: -14, opacity: 0.4 }} />
            <div className="hero-dot-decor" style={{ width: 8, height: 8, top: 160, right: -12 }} />

            {BLOBS.map((blobClass, b) => (
              <div key={blobClass} className={`hero-photo ${blobClass}`}>
                {[0, 1, 2].map((p) => (
                  <div key={p} className="photo-inner">
                    <MediaImage media={photo(3 + b * 3 + p)} fill decorative sizes="280px" className="object-cover" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
