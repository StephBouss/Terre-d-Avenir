import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/fr/actualites' }))

import SiteHeader from '@/components/layout/SiteHeader'
import { getDictionary } from '@/lib/i18n/dictionaries'

const dict = getDictionary('fr')

describe('SiteHeader', () => {
  it('liens localisés et rubrique active', () => {
    render(<SiteHeader locale="fr" labels={{ nav: dict.nav, header: dict.header }} />)
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' })
    const actu = nav.querySelector('a[href="/fr/actualites"]')!
    expect(actu).toHaveAttribute('aria-current', 'page')
    expect(nav.querySelector('a[href="/fr/ong"]')).not.toHaveAttribute('aria-current')
  })
  it('se compacte après 40 px de défilement', () => {
    const { container } = render(<SiteHeader locale="fr" labels={{ nav: dict.nav, header: dict.header }} />)
    const header = container.querySelector('header')!
    expect(header).not.toHaveClass('is-compact')
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 120, configurable: true })
      window.dispatchEvent(new Event('scroll'))
    })
    expect(header).toHaveClass('is-compact')
  })
  it('ouvre et ferme le menu mobile', async () => {
    render(<SiteHeader locale="fr" labels={{ nav: dict.nav, header: dict.header }} />)
    const button = screen.getByRole('button', { name: 'Ouvrir le menu' })
    await userEvent.click(button)
    expect(screen.getByRole('button', { name: 'Fermer le menu' })).toHaveAttribute('aria-expanded', 'true')
  })
})
