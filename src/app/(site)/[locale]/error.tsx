'use client'
import { useParams } from 'next/navigation'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale } from '@/lib/i18n/config'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const params = useParams<{ locale: string }>()
  const dict = getDictionary(isLocale(params.locale) ? params.locale : 'fr')
  return (
    <section className="py-24">
      <div className="max-w-[1280px] mx-auto px-6">
        <p className="text-lg text-foreground mb-6">{dict.common.error}</p>
        <button type="button" onClick={reset} className="btn-arrow font-bold px-6 py-3 rounded-md bg-primary text-primary-foreground">
          {dict.common.retry}
        </button>
      </div>
    </section>
  )
}
