import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, PayloadRequest } from 'payload'
import { revalidatePath } from 'next/cache'

/** Erreur levée par Next.js quand revalidatePath est appelé hors d’une requête (seed, CLI). */
const OUTSIDE_NEXT = /static generation store missing/i

function revalidateSite(req: PayloadRequest) {
  if (req.context?.disableRevalidate) return
  try {
    revalidatePath('/', 'layout')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (OUTSIDE_NEXT.test(message)) return // Hors du contexte Next.js : rien à revalider.
    req.payload.logger.error({ err: error }, 'Échec de la revalidation du site')
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
