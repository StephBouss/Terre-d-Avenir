import { CtaList } from '@/components/ui/Cta'
import Icon from '@/components/ui/Icon'
import type { Locale } from '@/lib/i18n/config'
import { isPlaceholder } from '@/lib/text'

type Props = { locale: Locale; text?: string | null; ctas?: { label: string; href: string; id?: string | null }[] | null; newTabLabel: string }

export default function ClosedNotice({ locale, text, ctas, newTabLabel }: Props) {
  if (!text || isPlaceholder(text)) return null
  return (
    <div role="note" className="rounded-lg p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between" style={{ background: '#E6BF5826', border: '1px solid #E6BF58' }}>
      <p className="flex items-start gap-3 text-base text-foreground font-medium">
        <Icon i="lock" size={20} className="text-primary flex-shrink-0 mt-0.5" />
        {text}
      </p>
      <CtaList locale={locale} ctas={ctas} newTabLabel={newTabLabel} />
    </div>
  )
}
