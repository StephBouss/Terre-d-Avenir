import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, PayloadRequest } from 'payload'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'

/** Erreur levée par Next.js quand revalidatePath est appelé hors d’une requête (seed, CLI). */
const OUTSIDE_NEXT = /static generation store missing/i

function revalidateNow(req: PayloadRequest) {
  try {
    revalidatePath('/', 'layout')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (OUTSIDE_NEXT.test(message)) return // Hors du contexte Next.js : rien à revalider.
    req.payload.logger.error({ err: error }, 'Échec de la revalidation du site')
  }
}

/**
 * Dans une requête, la revalidation est reportée à la fin de la réponse (`after`), donc après la validation
 * de la transaction Payload : une page rendue entre-temps ne reste pas périmée. Hors requête (seed, CLI),
 * `after` lève : repli sur un appel direct (sans effet hors Next.js).
 */
function revalidateSite(req: PayloadRequest) {
  if (req.context?.disableRevalidate) return
  try {
    after(() => revalidateNow(req))
  } catch {
    revalidateNow(req)
  }
}

export const revalidateCollection: CollectionAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req)
  return doc
}

export const revalidateCollectionDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidateSite(req)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req)
  return doc
}
