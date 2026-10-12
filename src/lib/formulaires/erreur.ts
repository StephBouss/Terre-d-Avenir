/**
 * Version journalisable d’une erreur : ni message ni pile, car certains messages (DrizzleQueryError, SMTP)
 * embarquent les paramètres de la requête, donc les données du visiteur.
 */
export function erreurSansDonnees(error: unknown): { name: string; code?: string; causeCode?: string } {
  const e = (error ?? {}) as { name?: unknown; code?: unknown; cause?: { code?: unknown } | null }
  const texte = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v) : undefined)
  const code = texte(e.code)
  const causeCode = texte(e.cause?.code)
  return { name: texte(e.name) ?? 'Error', ...(code ? { code } : {}), ...(causeCode ? { causeCode } : {}) }
}
