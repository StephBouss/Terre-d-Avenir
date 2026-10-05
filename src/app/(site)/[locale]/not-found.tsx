'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'

export default function NotFound() {
  const params = useParams<{ locale: string }>()
  const locale = isLocale(params?.locale ?? '') ? (params.locale as 'fr' | 'en') : 'fr'
  const dict = getDictionary(locale)
  return (
    <section className="py-24" style={{ background: '#F7F8F4' }}>
      <div className="max-w-[720px] mx-auto px-6 text-center flex flex-col items-center gap-6">
        <p className="text-6xl font-bold text-primary font-headings">404</p>
        <h1 className="text-4xl font-bold text-foreground font-headings">{dict.notFound.title}</h1>
        <p className="text-lg text-muted-foreground">{dict.notFound.text}</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href={localizedHref(locale, '/')} className="btn-arrow font-bold px-7 py-3 rounded-md bg-primary text-primary-foreground flex items-center gap-2">
            {dict.notFound.home}
          </Link>
          <Link href={localizedHref(locale, '/projets')} className="btn-arrow font-bold px-7 py-3 rounded-md border-2 border-primary text-primary flex items-center gap-2">
            {dict.notFound.actions} <Icon i="arrow-right" size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}
