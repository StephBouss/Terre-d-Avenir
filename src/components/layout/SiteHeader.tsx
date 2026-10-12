'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Icon from '@/components/ui/Icon'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { isActivePath, localizedHref, stripLocale } from '@/lib/i18n/paths'
import { NAV_ITEMS } from '@/lib/routes'
import LanguageSwitcher from './LanguageSwitcher'

type Props = { locale: Locale; labels: Pick<Dictionary, 'nav' | 'header'> }

export default function SiteHeader({ locale, labels }: Props) {
  const pathname = usePathname()
  const current = stripLocale(pathname)
  const [openFor, setOpenFor] = useState<string | null>(null)
  const isOpen = openFor === pathname
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const joinHref = localizedHref(locale, '/adhesion')

  return (
    <header className={`site-header bg-background border-b border-border w-full ${compact ? 'is-compact' : ''}`}>
      <div className="site-header-inner max-w-[1280px] mx-auto px-6 flex items-center justify-between h-20">
        <Link href={localizedHref(locale, '/')} className="flex items-center gap-3 flex-shrink-0" aria-label={labels.header.home}>
          <Image src="/brand/logo-couleur.png" alt="" width={1779} height={884} priority sizes="120px" className="site-logo h-14 w-auto object-contain" />
        </Link>

        <nav className="desktop-navigation items-center" aria-label={labels.header.mainNav}>
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(current, item.href)
            return (
              <Link
                key={item.key}
                href={localizedHref(locale, item.href)}
                aria-current={active ? 'page' : undefined}
                className={`px-3 py-2 text-sm font-body font-medium whitespace-nowrap transition-colors ${
                  active ? 'text-primary font-bold border-b-2 border-primary' : 'text-foreground hover:text-primary'
                }`}
              >
                {labels.nav[item.key]}
              </Link>
            )
          })}
        </nav>

        <div className="desktop-actions items-center gap-3">
          <LanguageSwitcher locale={locale} label={labels.header.language} />
          <Link
            href={joinHref}
            className="btn-arrow text-sm font-bold px-5 py-2.5 rounded-md font-body transition-transform hover:-translate-y-0.5"
            style={{ background: '#E6BF58', color: '#003E2A' }}
          >
            {labels.header.join}
          </Link>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label={isOpen ? labels.header.closeMenu : labels.header.openMenu}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setOpenFor(isOpen ? null : pathname)}
        >
          <Icon i={isOpen ? 'x' : 'menu'} size={25} />
        </button>
      </div>

      <div id="mobile-navigation" className={`mobile-navigation ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen} inert={!isOpen}>
        <nav aria-label={labels.header.mobileNav}>
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(current, item.href)
            return (
              <Link key={item.key} href={localizedHref(locale, item.href)} aria-current={active ? 'page' : undefined} className={active ? 'is-active' : ''}>
                {labels.nav[item.key]}
                <Icon i="arrow-up-right" size={17} />
              </Link>
            )
          })}
        </nav>
        <div className="mobile-navigation-footer">
          <LanguageSwitcher locale={locale} label={labels.header.language} />
          <Link href={joinHref} className="mobile-join-button">
            <Icon i="user-plus" size={18} />
            {labels.header.joinLong}
          </Link>
          <p>Komo-Kango, Gabon</p>
        </div>
      </div>
    </header>
  )
}
