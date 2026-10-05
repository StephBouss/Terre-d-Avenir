import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, LOCALES, isLocale, isPlannedLocale, localeDir } from '@/lib/i18n/config'

describe('configuration des langues', () => {
  it('active fr et en, fr par défaut', () => {
    expect(LOCALES).toEqual(['fr', 'en'])
    expect(DEFAULT_LOCALE).toBe('fr')
  })
  it('reconnaît uniquement les langues actives', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('es')).toBe(false)
    expect(isLocale('contact')).toBe(false)
  })
  it('reconnaît les langues prévues mais inactives', () => {
    expect(isPlannedLocale('es')).toBe(true)
    expect(isPlannedLocale('zh-Hans')).toBe(true)
    expect(isPlannedLocale('fr')).toBe(false)
  })
  it('donne le sens d’écriture', () => {
    expect(localeDir('ar')).toBe('rtl')
    expect(localeDir('fr')).toBe('ltr')
  })
})
