import { Reveal } from '@/components/motion/Reveal'
import { EmphasisText } from '@/components/ui/EmphasisText'
import HeroBack, { type HeroBackLink } from '@/components/ui/HeroBack'
import { MediaImage } from '@/components/ui/MediaImage'
import type { Locale } from '@/lib/i18n/config'
import { isPlaceholder } from '@/lib/text'
import type { Media } from '@/payload-types'

type Props = { eyebrow: string; title: string; intro?: string | null; image?: Media | number | null; locale?: Locale; back?: HeroBackLink }

export default function MediathequeHero({ eyebrow, title, intro, image, locale, back }: Props) {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: '#003E2A', minHeight: 400 }}>
      <div className="absolute inset-0 z-0" style={{ opacity: 0.45 }}>
        <MediaImage media={image} fill decorative eager sizes="100vw" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(105deg, #003E2Ae8 30%, #003E2Acc 55%, #003E2A99 100%)' }} />
      <Reveal className="relative z-10 max-w-[1280px] mx-auto px-6 text-center">
        {back && locale && (
          <div>
            <HeroBack locale={locale} {...back} />
          </div>
        )}
        {!isPlaceholder(eyebrow) && (
          <span
            className="text-xs font-bold font-body uppercase"
            style={{ letterSpacing: '0.14em', color: '#E6BF58', background: 'rgba(230,191,88,0.14)', border: '1px solid rgba(230,191,88,0.4)', borderRadius: 4, padding: '4px 12px', display: 'inline-block', marginBottom: 16 }}
          >
            {eyebrow}
          </span>
        )}
        <h1 className="text-5xl font-bold text-primary-foreground font-headings mb-4" style={{ lineHeight: 1.1 }}>
          <EmphasisText text={title} />
        </h1>
        {!isPlaceholder(intro) && (
          <p className="text-lg text-primary-foreground mx-auto" style={{ opacity: 0.88, maxWidth: 560 }}>
            {intro}
          </p>
        )}
      </Reveal>
    </section>
  )
}
