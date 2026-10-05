export const LOCALES = ['fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

/** Langues prévues par le PRD mais pas encore publiées. */
export const PLANNED_LOCALES = ['es', 'pt', 'ar', 'zh-Hans'] as const

export const NATIVE_NAMES: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  pt: 'Português',
  ar: 'العربية',
  'zh-Hans': '简体中文',
}

const RTL_LOCALES = new Set(['ar'])

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

export function isPlannedLocale(value: string): boolean {
  return (PLANNED_LOCALES as readonly string[]).includes(value)
}

export function localeDir(locale: string): 'ltr' | 'rtl' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
}
