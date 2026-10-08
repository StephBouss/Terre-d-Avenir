import { Cta } from '@/components/ui/Cta'
import HeroBack, { type HeroBackLink } from '@/components/ui/HeroBack'
import { MediaImage } from '@/components/ui/MediaImage'
import type { Locale } from '@/lib/i18n/config'
import { isPlaceholder } from '@/lib/text'
import type { Media } from '@/payload-types'

type Props = {
  locale: Locale
  image?: Media | number | null
  category?: string | null
  title: string
  dateLabel?: string | null
  source?: { label?: string | null; url?: string | null } | null
  newTabLabel: string
  back?: HeroBackLink
}

export default function ArticleHero({ locale, image, category, title, dateLabel, source, newTabLabel, back }: Props) {
  const showSource = !!source && !isPlaceholder(source.url) && !isPlaceholder(source.label)
  return (
    <section className="article-hero relative overflow-hidden min-h-[460px] w-full md:min-h-[560px]" style={{ background: '#003E2A' }}>
      <div className="absolute inset-0 hero-entree-fond">
        <MediaImage media={image} fill decorative eager sizes="100vw" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,62,42,0.3) 0%, rgba(0,62,42,0.8) 100%)' }} />
      <div className="relative z-10 flex min-h-[460px] flex-col items-center justify-end p-6 md:min-h-[560px] md:p-12">
        <div className="max-w-4xl text-center hero-entree-texte">
          {back && (
            <div>
              <HeroBack locale={locale} {...back} />
            </div>
          )}
          {!isPlaceholder(category) && (
            <span
              className="text-xs font-bold font-body uppercase"
              style={{ letterSpacing: '0.14em', color: '#E6BF58', background: 'rgba(230,191,88,0.14)', border: '1px solid rgba(230,191,88,0.4)', borderRadius: 4, padding: '4px 12px', display: 'inline-block', marginBottom: 16 }}
            >
              {category}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground font-headings mb-4" style={{ lineHeight: 1.15 }}>
            {title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-primary-foreground">
            {!isPlaceholder(dateLabel) && (
              <span className="text-base font-body" style={{ opacity: 0.8 }}>
                {dateLabel}
              </span>
            )}
            {showSource && <Cta locale={locale} variant="gold" href={source!.url!} label={source!.label!} newTabLabel={newTabLabel} />}
          </div>
        </div>
      </div>
    </section>
  )
}
