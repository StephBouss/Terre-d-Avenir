import type { Metadata, MetadataRoute } from 'next'
import { DEFAULT_LOCALE, LOCALES, type Locale } from './i18n/config'
import { alternates, localizedHref } from './i18n/paths'
import { stripEmphasis } from './text'

const OG_LOCALES: Record<Locale, string> = { fr: 'fr_FR', en: 'en_GB' }
export const SITE_NAME = 'Terre d’Avenir KOMO-KANGO'

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

type Args = { locale: Locale; path: string; title?: string | null; description?: string | null; image?: string | null }

export function pageMetadata({ locale, path, title, description, image }: Args): Metadata {
  const cleanTitle = title ? stripEmphasis(title) : SITE_NAME
  const url = localizedHref(locale, path)
  return {
    title: cleanTitle,
    description: description ?? undefined,
    alternates: { canonical: url, languages: alternates(path) },
    openGraph: {
      title: cleanTitle,
      description: description ?? undefined,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      type: 'website',
      images: [image ?? '/brand/og.jpg'],
    },
  }
}

/** `locales` limite les langues listées (contenu absent dans une langue : ni URL, ni alternative). */
export function buildSitemapEntries(baseUrl: string, paths: string[], locales: readonly Locale[] = LOCALES): MetadataRoute.Sitemap {
  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      Object.entries(alternates(path))
        .filter(([lang]) => (lang === 'x-default' ? locales.includes(DEFAULT_LOCALE) : (locales as readonly string[]).includes(lang)))
        .map(([lang, href]) => [lang, baseUrl + href]),
    )
    return locales.map((locale) => ({ url: baseUrl + localizedHref(locale, path), alternates: { languages } }))
  })
}
