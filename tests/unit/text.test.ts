import { describe, expect, it } from 'vitest'
import { emphasisParts, isPlaceholder, paragraphs, stripEmphasis } from '@/lib/text'

describe('textes', () => {
  it('repère les brouillons et les vides', () => {
    expect(isPlaceholder('[NOM DE LA PRÉSIDENTE À CONFIRMER]')).toBe(true)
    expect(isPlaceholder('Signature : [NOM]')).toBe(true)
    expect(isPlaceholder('   ')).toBe(true)
    expect(isPlaceholder(null)).toBe(true)
    expect(isPlaceholder('Komo-Kango, Gabon')).toBe(false)
  })
  it('découpe en paragraphes et masque les brouillons', () => {
    expect(paragraphs('Un.\n\nDeux.\n  \nTrois [À CONFIRMER].')).toEqual(['Un.', 'Deux.'])
    expect(paragraphs('Ligne 1,\nLigne 2,\n\nSuite.')).toEqual(['Ligne 1,\nLigne 2,', 'Suite.'])
    expect(paragraphs(undefined)).toEqual([])
  })
  it('gère l’emphase *…*', () => {
    expect(emphasisParts('Du Komo-Kango au monde, *faisons grandir* la solidarité.')).toEqual([
      { text: 'Du Komo-Kango au monde, ', em: false },
      { text: 'faisons grandir', em: true },
      { text: ' la solidarité.', em: false },
    ])
    expect(stripEmphasis('A *b* c')).toBe('A b c')
  })
})
