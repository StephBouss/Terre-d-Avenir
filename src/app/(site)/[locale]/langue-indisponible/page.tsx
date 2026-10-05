import Link from 'next/link'
import { LOCALES, NATIVE_NAMES } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false } }

export default async function LanguageUnavailable({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams
  return (
    <section className="py-24" style={{ background: '#F7F8F4' }}>
      <div className="max-w-[720px] mx-auto px-6 flex flex-col gap-10">
        {LOCALES.map((locale) => {
          const dict = getDictionary(locale)
          return (
            <div key={locale} lang={locale} className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold text-foreground font-headings">{dict.languageUnavailable.title}</h1>
              <p className="text-lg text-muted-foreground">{dict.languageUnavailable.text}</p>
            </div>
          )
        })}
        <ul className="flex gap-4 flex-wrap" aria-label={lang ? NATIVE_NAMES[lang] : undefined}>
          {LOCALES.map((locale) => (
            <li key={locale}>
              <Link href={`/${locale}`} hrefLang={locale} lang={locale} className="btn-arrow font-bold px-6 py-3 rounded-md bg-primary text-primary-foreground inline-flex">
                {NATIVE_NAMES[locale]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
