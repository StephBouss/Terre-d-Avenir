'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LOCALES, NATIVE_NAMES, type Locale } from '@/lib/i18n/config'
import { switchLocale } from '@/lib/i18n/paths'

export default function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname()
  return (
    <nav aria-label={label} className="flex items-center border border-border rounded-md overflow-hidden text-xs font-body">
      {LOCALES.map((code) => {
        const active = code === locale
        return (
          <Link
            key={code}
            href={switchLocale(pathname, code)}
            hrefLang={code}
            lang={code}
            title={NATIVE_NAMES[code]}
            aria-current={active ? 'true' : undefined}
            className={`px-3 py-1.5 uppercase transition-colors ${active ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-primary'}`}
          >
            <span aria-hidden="true">{code}</span>
            <span className="sr-only">{NATIVE_NAMES[code]}</span>
          </Link>
        )
      })}
    </nav>
  )
}
