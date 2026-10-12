import { DEFAULT_LOCALE, type Locale } from '../i18n/config'
import { localeFromPath } from '../i18n/routing'

/** IP du visiteur pour la limite de débit : premier X-Forwarded-For (posé par le proxy, ou par Next s’il est absent), puis X-Real-IP. */
export function ipDepuisEntetes(h: Headers): string {
  const transmise = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  return transmise || h.get('x-real-ip')?.trim() || 'inconnue'
}

/** Langue de la page d’où vient l’envoi (Referer) ; jamais une valeur du corps de la requête. */
export function localeDepuisReferer(referer: string | null): Locale {
  if (!referer) return DEFAULT_LOCALE
  try {
    return localeFromPath(new URL(referer).pathname)
  } catch {
    return DEFAULT_LOCALE
  }
}
