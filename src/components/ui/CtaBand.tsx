import { Reveal } from '@/components/motion/Reveal'
import type { Locale } from '@/lib/i18n/config'
import { isPlaceholder } from '@/lib/text'
import { CtaList } from './Cta'

type Props = { locale: Locale; title?: string | null; text?: string | null; ctas?: { label: string; href: string; id?: string | null }[] | null; newTabLabel?: string }

export default function CtaBand({ locale, title, text, ctas, newTabLabel }: Props) {
  if (!ctas?.length) return null
  return (
    <section className="py-16" style={{ background: '#003E2A' }}>
      <Reveal className="max-w-[1280px] mx-auto px-6 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div>
          {title && <h2 className="text-3xl font-bold text-primary-foreground font-headings mb-2">{title}</h2>}
          {!isPlaceholder(text) && (
            <p className="text-base text-primary-foreground font-body" style={{ opacity: 0.82 }}>
              {text}
            </p>
          )}
        </div>
        <div className="w-full lg:w-auto lg:flex-shrink-0">
          <CtaList locale={locale} ctas={ctas} newTabLabel={newTabLabel} dark />
        </div>
      </Reveal>
    </section>
  )
}
