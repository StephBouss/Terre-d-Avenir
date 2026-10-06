import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HeroPauseButton from '@/components/home/HeroPauseButton'

describe('HeroPauseButton', () => {
  it('met le diaporama en pause puis le reprend, en changeant son libellé', () => {
    const { container } = render(
      <section className="hero-slider">
        <HeroPauseButton pauseLabel="Mettre le diaporama en pause" playLabel="Reprendre le diaporama" />
      </section>,
    )
    const root = container.querySelector('.hero-slider')!
    const button = screen.getByRole('button', { name: 'Mettre le diaporama en pause' })
    expect(button).toHaveAttribute('type', 'button')
    expect(root).not.toHaveClass('hero-paused')

    fireEvent.click(button)
    expect(root).toHaveClass('hero-paused')
    expect(screen.getByRole('button', { name: 'Reprendre le diaporama' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reprendre le diaporama' }))
    expect(root).not.toHaveClass('hero-paused')
    expect(screen.getByRole('button', { name: 'Mettre le diaporama en pause' })).toBeInTheDocument()
  })
})
