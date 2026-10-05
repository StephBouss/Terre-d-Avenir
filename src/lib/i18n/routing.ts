import { DEFAULT_LOCALE, isLocale, isPlannedLocale, type Locale } from './config'

export type RouteDecision =
  | { action: 'next' }
  | { action: 'redirect'; location: string }
  | { action: 'rewrite'; location: string }

const PASSTHROUGH = /^\/(admin|api|_next)(\/|$)/

export function decideRoute(pathname: string): RouteDecision {
  if (PASSTHROUGH.test(pathname) || /\.[a-z0-9]+$/i.test(pathname)) return { action: 'next' }
  if (pathname === '/') return { action: 'redirect', location: `/${DEFAULT_LOCALE}` }
  const first = pathname.split('/')[1] ?? ''
  if (isLocale(first)) return { action: 'next' }
  if (isPlannedLocale(first)) {
    return { action: 'rewrite', location: `/${DEFAULT_LOCALE}/langue-indisponible?lang=${first}` }
  }
  return { action: 'redirect', location: `/${DEFAULT_LOCALE}${pathname}` }
}

/** Langue active déduite du premier segment du chemin (défaut : langue par défaut). */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/')[1] ?? ''
  return isLocale(first) ? first : DEFAULT_LOCALE
}
