import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'

type Callback = (entries: { isIntersecting: boolean; target: Element }[]) => void
let callbacks: Callback[] = []

class FakeObserver {
  constructor(cb: Callback) {
    callbacks.push(cb)
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

describe('Reveal', () => {
  beforeEach(() => {
    callbacks = []
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
  })
  afterEach(() => vi.unstubAllGlobals())

  it("marque l'élément et le révèle à l'entrée dans l'écran", () => {
    render(<Reveal>Bonjour</Reveal>)
    const el = screen.getByText('Bonjour')
    expect(el).toHaveAttribute('data-reveal')
    expect(el).not.toHaveClass('is-visible')
    act(() => callbacks[0]([{ isIntersecting: true, target: el }]))
    expect(el).toHaveClass('is-visible')
  })

  it("révèle immédiatement si l'utilisateur réduit les animations", () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    render(<Reveal>Calme</Reveal>)
    expect(screen.getByText('Calme')).toHaveClass('is-visible')
  })

  it("révèle immédiatement sans IntersectionObserver", () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Reveal>Ancien</Reveal>)
    expect(screen.getByText('Ancien')).toHaveClass('is-visible')
  })

  it("applique un délai via variable CSS", () => {
    render(<Reveal delay={160}>Délai</Reveal>)
    expect(screen.getByText('Délai').style.getPropertyValue('--reveal-delay')).toBe('160ms')
  })

  it("RevealGroup marque le conteneur", () => {
    render(
      <RevealGroup className="grid">
        <div>A</div>
        <div>B</div>
      </RevealGroup>,
    )
    const group = screen.getByText('A').parentElement!
    expect(group).toHaveAttribute('data-reveal-group')
    act(() => callbacks[0]([{ isIntersecting: true, target: group }]))
    expect(group).toHaveClass('is-visible')
  })
})
