import type { Locale } from '../config'
import { fr } from './fr'
import { en } from './en'

export type Dictionary = typeof fr

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}
