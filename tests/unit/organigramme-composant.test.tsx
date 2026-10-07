import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Organigramme from '@/components/organisation/Organigramme'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { construireArbre } from '@/lib/organigramme'
import type { Poste } from '@/payload-types'

const dict = getDictionary('fr')
const poste = (id: number, parent: number | null, ordre: number, intitule: string, extra: Partial<Poste> = {}) => ({ id, parent, ordre, intitule, ...extra }) as unknown as Poste

describe('composant organigramme', () => {
  it('aucun poste : message « en cours de validation », ni arbre ni liste', () => {
    const { container } = render(<Organigramme titre="Notre organigramme" noeuds={[]} labels={dict.organigramme} />)
    expect(screen.getByText('Organigramme en cours de validation.')).toBeInTheDocument()
    expect(container.querySelector('[data-vue]')).toBeNull()
  })

  it('arbre décoratif et liste accessible : mêmes rattachements, même ordre', () => {
    const noeuds = construireArbre([
      poste(1, null, 0, 'Présidence', { personneNom: 'Nom A', mission: 'Mission A' }),
      poste(3, 1, 2, 'Trésorerie'),
      poste(2, 1, 1, 'Secrétariat', { mission: '[à valider]' }),
    ])
    const { container } = render(<Organigramme titre="Notre organigramme" noeuds={noeuds} labels={dict.organigramme} />)
    const lire = (vue: string) => [...container.querySelectorAll(`[data-vue="${vue}"] [data-poste]`)].map((li) => `${li.getAttribute('data-poste')}<${li.getAttribute('data-parent')}`)
    expect(lire('liste')).toEqual(['1<', '2<1', '3<1'])
    expect(lire('arbre')).toEqual(lire('liste'))
    expect(container.querySelector('[data-vue="arbre"]')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('list', { name: 'Organigramme : liste des postes' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Présidence', 'Secrétariat', 'Trésorerie'])
    expect(screen.queryByText('[à valider]')).toBeNull() // brouillon de texte masqué
  })
})
