import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/fr/actualites/un-jeune-un-permis' }))

import LanguageSwitcher from '@/components/layout/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('propose les autres langues par leur drapeau, en gardant la page', () => {
    render(<LanguageSwitcher locale="fr" label="Langue" />)
    const en = screen.getByRole('link', { name: /English/ })
    expect(en).toHaveAttribute('href', '/en/actualites/un-jeune-un-permis')
    expect(en.querySelector('svg[data-flag="gb"]')).not.toBeNull()
    expect(en).not.toHaveTextContent(/^en$/i)
  })

  it('n’affiche pas la langue active', () => {
    render(<LanguageSwitcher locale="fr" label="Langue" />)
    expect(screen.queryByRole('link', { name: /Français/ })).toBeNull()
  })

  it('en anglais, propose le drapeau français', () => {
    render(<LanguageSwitcher locale="en" label="Language" />)
    const fr = screen.getByRole('link', { name: /Français/ })
    expect(fr.querySelector('svg[data-flag="fr"]')).not.toBeNull()
    expect(screen.queryByRole('link', { name: /English/ })).toBeNull()
  })
})
