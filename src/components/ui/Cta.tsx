import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { isExternal, isFacebookUrl, localizedHref, opensInNewTab } from '@/lib/i18n/paths'
import { isPlaceholder } from '@/lib/text'
import FacebookIcon from './FacebookIcon'
import Icon from './Icon'

export type CtaVariant = 'gold' | 'primary' | 'outline' | 'outline-light' | 'link'

const BUTTON = 'font-bold text-base px-7 py-3 rounded-md font-body inline-flex items-center gap-2'
const VARIANTS: Record<CtaVariant, { className: string; style?: CSSProperties; light: boolean }> = {
  gold: { className: BUTTON, style: { background: '#E6BF58', color: '#17372C' }, light: false },
  primary: { className: `${BUTTON} bg-primary text-primary-foreground`, light: true },
  outline: { className: `${BUTTON} text-primary`, style: { border: '1.5px solid #005C38' }, light: false },
  'outline-light': { className: `${BUTTON} text-primary-foreground`, style: { border: '1.5px solid rgba(255,255,255,0.5)' }, light: true },
  link: { className: 'text-sm font-bold text-primary inline-flex items-center gap-1', light: false },
}

type Props = {
  locale: Locale
  href: string
  label: string
  variant?: CtaVariant
  icon?: string
  newTabLabel: string
  className?: string
  /** Bouton de retour : chevron à gauche, pas de flèche finale. */
  back?: boolean
}

export function Cta({ locale, href, label, variant = 'primary', icon, newTabLabel, className = '', back = false }: Props) {
  if (isPlaceholder(label) || isPlaceholder(href)) return null
  const v = VARIANTS[variant]
  const external = isExternal(href)
  const newTab = opensInNewTab(href)
  const size = variant === 'link' ? 13 : 17
  const content = (
    <>
      {/* Le bleu officiel #1877F2 de l'icône Facebook est volontaire (validé le 2026-10-06) ; seuls les textes sont assombris pour le contraste. */}
      {back ? <Icon i="chevron-left" size={size} /> : icon ? <Icon i={icon} size={size} /> : isFacebookUrl(href) ? <FacebookIcon size={16} color={v.light ? '#fff' : '#1877F2'} /> : null}
      <span>{label}</span>
      {newTab && <span className="sr-only">{` ${newTabLabel}`}</span>}
      {!back && <Icon i={external ? 'arrow-up-right' : 'arrow-right'} size={size} />}
    </>
  )
  const cls = `btn-arrow ${v.className} ${className}`
  if (external) {
    return (
      <a href={href} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={cls} style={v.style}>
        {content}
      </a>
    )
  }
  return (
    <Link href={localizedHref(locale, href)} className={cls} style={v.style}>
      {content}
    </Link>
  )
}

type ListProps = { locale: Locale; ctas?: { label: string; href: string; id?: string | null }[] | null; newTabLabel: string; dark?: boolean }

/** Le premier bouton est principal, les suivants secondaires. */
export function CtaList({ locale, ctas, newTabLabel, dark = false }: ListProps) {
  const visible = (ctas ?? []).filter((c) => !isPlaceholder(c.label) && !isPlaceholder(c.href))
  if (visible.length === 0) return null
  return (
    <div className="flex gap-4 flex-wrap">
      {visible.map((cta, i) => (
        <Cta
          key={cta.id ?? `${cta.href}-${i}`}
          locale={locale}
          href={cta.href}
          label={cta.label}
          newTabLabel={newTabLabel}
          variant={i === 0 ? (dark ? 'gold' : 'primary') : dark ? 'outline-light' : 'outline'}
        />
      ))}
    </div>
  )
}
