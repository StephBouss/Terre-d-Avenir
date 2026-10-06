import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import NotFoundContent from '@/components/layout/NotFoundContent'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteHeader from '@/components/layout/SiteHeader'
import { getReglages } from '@/lib/content'
import { DEFAULT_LOCALE, isLocale, localeDir, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import './(site)/globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm-sans', display: 'swap' })

async function activeLocale(): Promise<Locale> {
  const value = (await headers()).get('x-locale') ?? ''
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await activeLocale()
  return { title: getDictionary(locale).notFound.title, robots: { index: false }, icons: { icon: '/brand/favicon.png' } }
}

export default async function GlobalNotFound() {
  const locale = await activeLocale()
  const dict = getDictionary(locale)
  const reglages = await getReglages(locale).catch(() => null)

  return (
    <html lang={locale} dir={localeDir(locale)} className={dmSans.variable}>
      <body className="bg-background text-foreground font-body">
        <a href="#contenu" className="skip-link">
          {dict.skipToContent}
        </a>
        <SiteHeader locale={locale} labels={{ nav: dict.nav, header: dict.header }} />
        <main id="contenu">
          <NotFoundContent locale={locale} />
        </main>
        <SiteFooter locale={locale} dict={dict} reglages={reglages} />
      </body>
    </html>
  )
}
