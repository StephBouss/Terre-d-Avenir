/** Taille maximale du corps d’une requête de formulaire, en octets. */
export const TAILLE_MAX = 20_000

export type LectureCorps = { ok: true; corps: unknown } | { ok: false; status: 400 | 413 | 415 }

/**
 * Lit le corps JSON d’une requête : type de contenu strict (415), taille limitée avant et pendant la lecture (413),
 * JSON valide (400). Un `content-length` trop grand est refusé sans lire le corps ; sinon le flux est interrompu dès que la limite est dépassée.
 */
export async function lireCorpsJson(request: Request): Promise<LectureCorps> {
  const type = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  if (type !== 'application/json') return { ok: false, status: 415 }

  const declare = Number(request.headers.get('content-length'))
  if (Number.isFinite(declare) && declare > TAILLE_MAX) return { ok: false, status: 413 }

  const octets = new Uint8Array(TAILLE_MAX)
  let total = 0
  if (request.body) {
    const lecteur = request.body.getReader()
    for (;;) {
      const { done, value } = await lecteur.read()
      if (done) break
      if (total + value.length > TAILLE_MAX) {
        await lecteur.cancel().catch(() => undefined)
        return { ok: false, status: 413 }
      }
      octets.set(value, total)
      total += value.length
    }
  }
  try {
    return { ok: true, corps: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(octets.subarray(0, total))) }
  } catch {
    return { ok: false, status: 400 }
  }
}
