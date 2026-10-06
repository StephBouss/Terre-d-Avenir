import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ShareButtons from '@/components/article/ShareButtons'

const labels = { newTab: '(nouvel onglet)', share: 'Partager :', copyLink: 'Copier le lien', linkCopied: 'Lien copié' }

describe('ShareButtons', () => {
  it('lien de partage Facebook encodé', () => {
    render(<ShareButtons url="https://site.org/fr/actualites/a" labels={labels} />)
    expect(screen.getByRole('link', { name: /Facebook/ })).toHaveAttribute(
      'href',
      'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fsite.org%2Ffr%2Factualites%2Fa',
    )
  })
  it('annonce l’ouverture dans un nouvel onglet', () => {
    render(<ShareButtons url="https://site.org/x" labels={labels} />)
    expect(screen.getByRole('link', { name: /Facebook.*(nouvel onglet)/ })).toBeInTheDocument()
  })
  it('copie le lien et le confirme', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<ShareButtons url="https://site.org/x" labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: 'Copier le lien' }))
    expect(writeText).toHaveBeenCalledWith('https://site.org/x')
    expect(screen.getByRole('status')).toHaveTextContent('Lien copié')
  })
})
