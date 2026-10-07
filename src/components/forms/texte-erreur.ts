import { LIMITES, type CodeErreur } from '@/lib/formulaires/schema'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export function texteErreur(code: CodeErreur | undefined, champ: string, textes: Dictionary['formulaires']['erreurs'], locale: Locale): string | null {
  if (!code) return null
  if (code !== 'tropLong') return textes[code]
  const max = (LIMITES as Record<string, number>)[champ] ?? 0
  return textes.tropLong.replace('{max}', new Intl.NumberFormat(locale).format(max))
}
