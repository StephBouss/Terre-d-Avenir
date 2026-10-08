import { describe, expect, it } from 'vitest'
import { diapositives } from '@/lib/diaporama'

const REPLI = { titre: 'Titre de la page', texte: 'Intro de la page' }

describe('diapositives', () => {
  it('sans texte saisi : une seule diapositive, celle de la page Accueil', () => {
    expect(diapositives([], REPLI)).toEqual([REPLI])
    expect(diapositives(null, REPLI)).toEqual([REPLI])
  })

  it('un texte par image, dans l’ordre', () => {
    const textes = [
      { titre: 'Un', texte: 'a' },
      { titre: 'Deux', texte: 'b' },
      { titre: 'Trois', texte: null },
    ]
    expect(diapositives(textes, REPLI)).toEqual([
      { titre: 'Un', texte: 'a' },
      { titre: 'Deux', texte: 'b' },
      { titre: 'Trois', texte: null },
    ])
  })

  it('diapositive manquante ou provisoire : texte de la page Accueil', () => {
    expect(diapositives([{ titre: 'Un', texte: 'a' }, { titre: '[À rédiger]', texte: 'x' }], REPLI)).toEqual([
      { titre: 'Un', texte: 'a' },
      REPLI,
      REPLI,
    ])
  })

  it('ignore les textes au-delà de la 3e image', () => {
    const textes = ['1', '2', '3', '4'].map((titre) => ({ titre, texte: null }))
    expect(diapositives(textes, REPLI).map((d) => d.titre)).toEqual(['1', '2', '3'])
  })
})
