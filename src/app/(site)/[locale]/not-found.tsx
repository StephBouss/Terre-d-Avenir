'use client'
import { useParams } from 'next/navigation'
import NotFoundContent from '@/components/layout/NotFoundContent'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n/config'

export default function NotFound() {
  const params = useParams<{ locale: string }>()
  const raw = params?.locale ?? ''
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE
  return <NotFoundContent locale={locale} />
}
