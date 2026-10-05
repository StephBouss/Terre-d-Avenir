import Link from 'next/link'
import type { Projet } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { localizedHref } from '@/lib/i18n/paths'
import Icon from './Icon'

export default function ActionThemeCard({ locale, projet, linkLabel }: { locale: Locale; projet: Projet; linkLabel: string }) {
  return (
    <div className="card-lift bg-background rounded-lg border border-border p-6 flex flex-col gap-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="w-11 h-11 rounded-md flex items-center justify-center" style={{ background: '#F0F5EF' }}>
        <Icon i={projet.icon ?? 'target'} size={22} className="text-primary" />
      </div>
      <div>
        <h3 className="text-base font-bold text-foreground font-headings mb-2">
          <span className="title-underline">{projet.theme}</span>
        </h3>
        {projet.summary && <p className="text-sm text-muted-foreground leading-relaxed font-body">{projet.summary}</p>}
      </div>
      <Link href={localizedHref(locale, `/projets/${projet.slug}`)} className="btn-arrow text-sm font-bold text-primary flex items-center gap-1 mt-auto">
        {linkLabel} <Icon i="arrow-right" size={13} />
      </Link>
    </div>
  )
}
