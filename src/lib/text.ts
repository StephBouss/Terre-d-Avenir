const BRACKET = /\[[^\]]+\]/

/** Vide, blanc ou contenant un marqueur de brouillon « [...] » : à ne pas afficher. */
export function isPlaceholder(value?: string | null): boolean {
  return !value || value.trim() === '' || BRACKET.test(value)
}

/** Paragraphes séparés par une ligne vide ; les retours simples sont conservés. */
export function paragraphs(value?: string | null): string[] {
  if (!value) return []
  return value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => !isPlaceholder(p))
}

/** Découpe « texte *mis en avant* texte » en segments. */
export function emphasisParts(value: string): { text: string; em: boolean }[] {
  return value
    .split(/(\*[^*]+\*)/)
    .filter((part) => part !== '')
    .map((part) =>
      part.startsWith('*') && part.endsWith('*') ? { text: part.slice(1, -1), em: true } : { text: part, em: false },
    )
}

export function stripEmphasis(value: string): string {
  return value.replace(/\*([^*]+)\*/g, '$1')
}
