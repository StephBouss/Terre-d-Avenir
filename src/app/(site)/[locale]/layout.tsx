import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteHeader from '@/components/layout/SiteHeader'
import { NO_JS_GUARD } from '@/components/motion/no-js-guard'
import { getReglages } from '@/lib/content'
import { isLocale, localeDir } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import '../globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm-sans', display: 'swap' })

export const revalidate = 3600

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  icons: { icon: '/brand/logo-couleur.png' },
}

export function generateStaticParams() {
  return []
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const reglages = await getReglages(locale).catch(() => null)

  return (
    <html lang={locale} dir={localeDir(locale)} className={dmSans.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_JS_GUARD }} />
      </head>
      <body className="bg-background text-foreground font-body">
        <a href="#contenu" className="skip-link">
          {dict.skipToContent}
        </a>
        <SiteHeader locale={locale} labels={{ nav: dict.nav, header: dict.header }} />
        <main id="contenu">{children}</main>
        <SiteFooter locale={locale} dict={dict} reglages={reglages} />
      </body>
    </html>
  )
}
