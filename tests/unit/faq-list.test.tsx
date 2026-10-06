import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import FaqList from '@/components/ui/FaqList'

const section = {
  key: 'faq',
  heading: 'Avant de déposer votre demande',
  items: [
    { title: 'L’envoi du formulaire me rend-il membre ?', text: 'Non.' },
    { title: '[QUESTION À VALIDER]', text: 'x' },
  ],
}

describe('FaqList', () => {
  it('affiche les questions validées, repliées par défaut', async () => {
    render(<FaqList section={section as never} />)
    expect(screen.getByRole('heading', { name: 'Avant de déposer votre demande' })).toBeInTheDocument()
    expect(screen.queryByText(/QUESTION À VALIDER/)).toBeNull()
    const summary = screen.getByText('L’envoi du formulaire me rend-il membre ?')
    expect(summary.closest('details')).not.toHaveAttribute('open')
    await userEvent.click(summary)
    expect(summary.closest('details')).toHaveAttribute('open')
  })
})
