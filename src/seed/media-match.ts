const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Nom de fichier du média de seed, ou sa variante renommée par Payload (« banner-1.jpg ») : jamais un autre fichier. */
export function isSeedMediaFilename(filename: string | null | undefined, key: string, ext: string): boolean {
  if (!filename) return false
  return new RegExp(`^${escapeRegExp(key)}(-\\d+)?${escapeRegExp(ext)}$`).test(filename)
}
