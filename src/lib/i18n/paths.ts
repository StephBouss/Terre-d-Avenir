import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './config'

export function isExternal(href: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(href)
}

export function localizedHref(locale: Locale, href: string): string {
  if (isExternal(href) || href.startsWith('#')) return href
  if (href === '/' || href === '') return `/${locale}`
  return `/${locale}${href.startsWith('/') ? href : `/${href}`}`
}

export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split('/')
  if (!isLocale(first ?? '')) return pathname || '/'
  const path = `/${rest.join('/')}`.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

export function switchLocale(pathname: string, target: Locale): string {
  return localizedHref(target, stripLocale(pathname))
}

export function alternates(path: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const locale of LOCALES) result[locale] = localizedHref(locale, path)
  result['x-default'] = localizedHref(DEFAULT_LOCALE, path)
  return result
}

export function isActivePath(current: string, href: string): boolean {
  if (href === '/') return current === '/'
  return current === href || current.startsWith(`${href}/`)
}
