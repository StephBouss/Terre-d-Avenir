import { LOCALES } from './i18n/config'

export function previewUrl(base: string, path: string, secret: string): string {
  return `${base}/api/apercu?path=${encodeURIComponent(path)}&secret=${encodeURIComponent(secret)}`
}

/** Chemin interne d'une langue active, sans redirection ouverte ni remontée de dossier. */
export function isSafePreviewPath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('..')) return false
  const first = path.split('/')[1] ?? ''
  return (LOCALES as readonly string[]).includes(first)
}
