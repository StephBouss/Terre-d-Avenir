'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Flag from '@/components/ui/Flag'
import { LOCALES, NATIVE_NAMES, type Locale } from '@/lib/i18n/config'
import { switchLocale } from '@/lib/i18n/paths'

/** Drapeau affiché pour chaque langue publiée (l’anglais par le drapeau du Royaume-Uni). */
const FLAG_OF: Record<Locale, string> = { fr: 'fr', en: 'gb' }

/** Propose les autres langues publiées par leur drapeau ; la langue active n’est pas affichée. */
export default function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname()
  const others = LOCALES.filter((code) => code !== locale)
  return (
    <nav aria-label={label} className="flex items-center gap-2 font-body">
      {others.map((code) => (
        <Link
          key={code}
          href={switchLocale(pathname, code)}
          hrefLang={code}
          lang={code}
          title={NATIVE_NAMES[code]}
          className="inline-flex rounded-sm ring-1 ring-border transition-transform hover:-translate-y-0.5 hover:ring-primary focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Flag code={FLAG_OF[code]} className="block w-7 h-[19px] rounded-sm" />
          <span className="sr-only">{NATIVE_NAMES[code]}</span>
        </Link>
      ))}
    </nav>
  )
}
