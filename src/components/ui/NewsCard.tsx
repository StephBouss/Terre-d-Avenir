import Link from 'next/link'
import type { Actualite } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { localizedHref } from '@/lib/i18n/paths'
import FacebookIcon from './FacebookIcon'
import Icon from './Icon'
import { MediaImage } from './MediaImage'

type Props = { locale: Locale; actualite: Actualite; labels: { readArticle: string; newTab: string } }

export default function NewsCard({ locale, actualite, labels }: Props) {
  const source = actualite.source
  return (
    <article className="card-lift bg-background rounded-lg border border-border overflow-hidden flex flex-col" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="card-media" style={{ height: 196 }}>
        <MediaImage media={actualite.image} sizes="(min-width: 1024px) 400px, 100vw" className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        {actualite.category && <span className="text-xs font-bold text-primary uppercase tracking-widest font-body">{actualite.category}</span>}
        <h3 className="text-base font-bold text-foreground leading-snug font-headings">
          <span className="title-underline">{actualite.title}</span>
        </h3>
        {actualite.dateLabel && <p className="text-sm text-muted-foreground font-body">{actualite.dateLabel}</p>}
        <div className="flex items-center justify-between gap-3 mt-auto pt-3">
          <Link href={localizedHref(locale, `/actualites/${actualite.slug}`)} className="btn-arrow text-sm font-bold text-primary flex items-center gap-1">
            {labels.readArticle} <Icon i="arrow-right" size={13} />
          </Link>
          {source?.url && source.label && (
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-body font-medium" style={{ color: '#1877F2' }}>
              {/facebook\.com/.test(source.url) && <FacebookIcon size={18} />}
              {source.label}
              <span className="sr-only">{labels.newTab}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
