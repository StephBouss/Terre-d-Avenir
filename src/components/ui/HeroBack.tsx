import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { localizedHref } from '@/lib/i18n/paths'
import Icon from './Icon'

export type HeroBackLink = { href: string; label: string }

/** Lien de retour vers la page parente, posé en haut d’un bandeau sombre (album, article). */
export default function HeroBack({ locale, href, label }: HeroBackLink & { locale: Locale }) {
  return (
    <Link
      href={localizedHref(locale, href)}
      data-retour
      className="inline-flex items-center gap-1.5 text-sm font-bold font-body text-primary-foreground mb-6 rounded-md px-3 py-2 transition-colors hover:bg-white/10"
      style={{ border: '1px solid rgba(255,255,255,0.35)' }}
    >
      <Icon i="chevron-left" size={16} />
      <span>{label}</span>
    </Link>
  )
}
