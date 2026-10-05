import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

function revalidateSite(context: Record<string, unknown> | undefined) {
  if (context?.disableRevalidate) return
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Hors du contexte Next.js (seed, CLI) : rien à revalider.
  }
}

export const revalidateCollection: CollectionAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req.context)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req.context)
  return doc
}
