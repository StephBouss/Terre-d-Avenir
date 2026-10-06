import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { PageSlug } from '@/collections/Pages'
import { getPage } from './content'
import { isLocale, type Locale } from './i18n/config'
import { pageMetadata } from './seo'

export type LocaleParams = { params: Promise<{ locale: string }> }

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return locale
}

export function metadataFor(slug: PageSlug, path: string) {
  return async ({ params }: LocaleParams): Promise<Metadata> => {
    const locale = await resolveLocale(params)
    const page = await getPage(slug, locale)
    return pageMetadata({ locale, path, title: page?.seoTitle, description: page?.metaDescription })
  }
}
