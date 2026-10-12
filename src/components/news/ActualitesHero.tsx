import { EmphasisText } from '@/components/ui/EmphasisText'
import { MediaImage } from '@/components/ui/MediaImage'
import { isPlaceholder } from '@/lib/text'
import type { Media } from '@/payload-types'

type Props = { eyebrow: string; title: string; intro?: string | null; image?: Media | number | null }

export default function ActualitesHero({ eyebrow, title, intro, image }: Props) {
  return (
    <section className="relative flex items-center overflow-hidden py-16 md:py-20" style={{ background: '#003E2A', minHeight: 520 }}>
      <div className="absolute inset-0 z-0 hero-entree-fond" style={{ opacity: 0.55 }}>
        <MediaImage media={image} fill decorative eager sizes="100vw" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(105deg, #003E2Aea 28%, #003E2Acc 52%, #003E2A99 100%)' }} />
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 h-full w-full">
        <div className="flex min-h-[360px] items-center justify-center md:min-h-[420px]">
          <div className="max-w-[720px] text-center hero-entree-texte">
            {!isPlaceholder(eyebrow) && (
              <span
                className="text-xs font-bold font-body uppercase badge-anime"
                style={{ letterSpacing: '0.14em', color: '#E6BF58', background: 'rgba(230,191,88,0.14)', border: '1px solid rgba(230,191,88,0.4)', borderRadius: 4, padding: '4px 12px', display: 'inline-block', marginBottom: 16 }}
              >
                {eyebrow}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground font-headings" style={{ lineHeight: 1.1, marginBottom: 20 }}>
              <EmphasisText text={title} />
            </h1>
            {!isPlaceholder(intro) && (
              <p className="text-lg text-primary-foreground font-body mx-auto" style={{ opacity: 0.9, lineHeight: 1.65, maxWidth: 560 }}>
                {intro}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
