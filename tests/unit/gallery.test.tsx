import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: ({ fill: _f, priority: _p, ...props }: Record<string, unknown>) => <img {...(props as object)} />,
}))

import Gallery from '@/components/media/Gallery'

beforeAll(() => {
  // jsdom n'implémente pas <dialog>.showModal()/close()
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

const labels = { open: 'Agrandir l’image', dialog: 'Visionneuse d’images', close: 'Fermer', previous: 'Image précédente', next: 'Image suivante' }
const items = [
  { id: 1, url: '/a.jpg', alt: 'Image A', caption: 'Légende A', width: 800, height: 600 },
  { id: 2, url: '/b.jpg', alt: 'Image B', caption: null, width: 800, height: 600 },
]

describe('Gallery', () => {
  it('ouvre, navigue au clavier et ferme', async () => {
    const { container } = render(<Gallery items={items} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: /Agrandir l’image : Image A/ }))
    const dialog = container.querySelector('dialog')!
    expect(dialog).toHaveAttribute('open')
    expect(dialog).toHaveAttribute('aria-label', 'Visionneuse d’images')
    expect(screen.getByText('Légende A')).toBeInTheDocument()
    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(dialog.querySelector('figure img')).toHaveAttribute('alt', 'Image B')
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })
    expect(dialog.querySelector('figure img')).toHaveAttribute('alt', 'Image A')
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(dialog).not.toHaveAttribute('open')
  })

  it('boucle aux extrémités et ferme avec l’événement natif close (Échap)', async () => {
    const { container } = render(<Gallery items={items} labels={labels} />)
    await userEvent.click(screen.getAllByRole('button', { name: /Agrandir l’image/ })[0])
    const dialog = container.querySelector('dialog')!
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })
    expect(dialog.querySelector('figure img')).toHaveAttribute('alt', 'Image B')
    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(dialog.querySelector('figure img')).toHaveAttribute('alt', 'Image A')
    dialog.dispatchEvent(new Event('close'))
    await vi.waitFor(() => expect(dialog.querySelector('figure')).toBeNull())
  })

  it('une image sans alt (provisoire) reste décorative', () => {
    render(<Gallery items={[{ ...items[0], alt: '' }]} labels={labels} />)
    expect(screen.getByRole('button', { name: 'Agrandir l’image' })).toBeInTheDocument()
  })

  it('masque les flèches avec une seule image', async () => {
    render(<Gallery items={[items[0]]} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: /Agrandir/ }))
    expect(screen.queryByRole('button', { name: 'Image suivante' })).toBeNull()
  })
})
