import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: ({ fill: _f, priority: _p, ...props }: Record<string, unknown>) => <img {...(props as object)} />,
}))

import { Cta, CtaList } from '@/components/ui/Cta'
import { EmphasisText } from '@/components/ui/EmphasisText'
import { MediaImage } from '@/components/ui/MediaImage'
import { Paragraphs } from '@/components/ui/Paragraphs'

describe('Cta', () => {
  it('localise les liens internes', () => {
    render(<Cta locale="en" href="/adhesion" label="Join us" />)
    expect(screen.getByRole('link', { name: /Join us/ })).toHaveAttribute('href', '/en/adhesion')
  })
  it('ouvre les liens externes dans un nouvel onglet, annoncé aux lecteurs d’écran', () => {
    render(<Cta locale="fr" href="https://www.facebook.com/x" label="Facebook" newTabLabel="(nouvel onglet)" />)
    const link = screen.getByRole('link', { name: /Facebook.*nouvel onglet/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
  it('CtaList ne rend rien sans boutons', () => {
    const { container } = render(<CtaList locale="fr" ctas={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('Paragraphs', () => {
  it('rend les paragraphes et masque les brouillons', () => {
    render(<Paragraphs text={'Premier.\n\nSecond [À CONFIRMER].\n\nTroisième.'} />)
    expect(screen.getByText('Premier.')).toBeInTheDocument()
    expect(screen.getByText('Troisième.')).toBeInTheDocument()
    expect(screen.queryByText(/CONFIRMER/)).toBeNull()
  })
})

describe('EmphasisText', () => {
  it('met en doré le passage entre astérisques', () => {
    render(<EmphasisText text="Du monde, *faisons grandir* la solidarité." />)
    expect(screen.getByText('faisons grandir').tagName).toBe('SPAN')
  })
})

describe('MediaImage', () => {
  const media = { id: 1, url: '/api/medias/file/sport.jpg', alt: 'Un tournoi', width: 1800, height: 1200, provisoire: false } as never
  it('utilise le texte alternatif du média', () => {
    render(<MediaImage media={media} />)
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Un tournoi')
  })
  it('rend une image provisoire décorative', () => {
    const { container } = render(<MediaImage media={{ ...(media as object), provisoire: true } as never} />)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })
  it('affiche un fond de repli sans média', () => {
    const { container } = render(<MediaImage media={null} className="h-40" />)
    expect(container.querySelector('.media-fallback')).not.toBeNull()
  })
})
