import { describe, expect, it } from 'vitest'
import { getDictionary } from '@/lib/i18n/dictionaries'

function leaves(obj: unknown, prefix = ''): [string, unknown][] {
  if (Array.isArray(obj)) return obj.flatMap((v, i) => leaves(v, `${prefix}[${i}]`))
  if (obj && typeof obj === 'object') return Object.entries(obj).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k))
  return [[prefix, obj]]
}

describe('dictionnaires', () => {
  it('fr et en ont exactement les mêmes clés', () => {
    expect(leaves(getDictionary('en')).map(([k]) => k)).toEqual(leaves(getDictionary('fr')).map(([k]) => k))
  })
  it('aucun libellé vide', () => {
    for (const locale of ['fr', 'en'] as const) {
      for (const [key, value] of leaves(getDictionary(locale))) {
        expect(typeof value === 'string' && value.trim().length > 0, `${locale}:${key}`).toBe(true)
      }
    }
  })
})
