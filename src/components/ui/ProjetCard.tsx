import Link from 'next/link'
import type { Projet } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { localizedHref } from '@/lib/i18n/paths'
import { isPlaceholder } from '@/lib/text'
import Icon from './Icon'
import { MediaImage } from './MediaImage'

export default function ProjetCard({ locale, projet, linkLabel }: { locale: Locale; projet: Projet; linkLabel: string }) {
  const href = localizedHref(locale, `/projets/${projet.slug}`)
  return (
    <article className="card-lift bg-background rounded-lg border border-border overflow-hidden flex flex-col" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="card-media relative" style={{ height: 196 }}>
        <MediaImage media={projet.image} sizes="(min-width: 1024px) 400px, 100vw" className="w-full h-full object-cover" />
        <span className="absolute left-4 top-4 w-11 h-11 rounded-md flex items-center justify-center" style={{ background: '#F0F5EF' }}>
          <Icon i={projet.icon ?? 'target'} size={22} className="text-primary" />
        </span>
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h2 className="text-lg font-bold text-foreground leading-snug font-headings">
          <Link href={href} className="title-underline">
            {projet.theme}
          </Link>
        </h2>
        {!isPlaceholder(projet.summary) && <p className="text-sm text-muted-foreground font-body leading-relaxed">{projet.summary}</p>}
        <Link href={href} className="btn-arrow text-sm font-bold text-primary flex items-center gap-1 mt-auto pt-3" aria-hidden="true" tabIndex={-1}>
          {linkLabel} <Icon i="arrow-right" size={13} />
        </Link>
      </div>
    </article>
  )
}
