import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'

function hookArgs(context: Record<string, unknown> = {}) {
  const logger = { error: vi.fn() }
  const doc = { id: 1 }
  return { logger, doc, input: { doc, id: 1, req: { context, payload: { logger } } } as never }
}

describe('hooks de revalidation', () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockReset()
  })

  it('revalide le site après une suppression et renvoie le document', () => {
    const { doc, input } = hookArgs()
    expect(revalidateCollectionDelete(input)).toBe(doc)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('revalide le site après une modification', () => {
    revalidateCollection(hookArgs().input)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('ne revalide pas quand disableRevalidate est posé', () => {
    revalidateCollectionDelete(hookArgs({ disableRevalidate: true }).input)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('ignore l’erreur attendue hors du contexte Next.js', () => {
    vi.mocked(revalidatePath).mockImplementation(() => {
      throw new Error('Invariant: static generation store missing in revalidatePath /')
    })
    const { logger, input } = hookArgs()
    revalidateCollectionDelete(input)
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('journalise une erreur inattendue sans la propager', () => {
    vi.mocked(revalidatePath).mockImplementation(() => {
      throw new Error('boom')
    })
    const { logger, input } = hookArgs()
    revalidateCollectionDelete(input)
    expect(logger.error).toHaveBeenCalledTimes(1)
  })
})
