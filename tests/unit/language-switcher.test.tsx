import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/fr/actualites/un-jeune-un-permis' }))

import LanguageSwitcher from '@/components/layout/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('propose chaque langue active en gardant la page', () => {
    render(<LanguageSwitcher locale="fr" label="Langue" />)
    expect(screen.getByRole('link', { name: /English/ })).toHaveAttribute('href', '/en/actualites/un-jeune-un-permis')
    expect(screen.getByRole('link', { name: /Français/ })).toHaveAttribute('aria-current', 'true')
  })
})
