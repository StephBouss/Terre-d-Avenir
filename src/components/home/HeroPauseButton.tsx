'use client'

import { useState } from 'react'

type Props = { pauseLabel: string; playLabel: string }

/** Pause du diaporama (WCAG 2.2.2) : bascule la classe .hero-paused sur la section du héros (voir globals.css). */
export default function HeroPauseButton({ pauseLabel, playLabel }: Props) {
  const [paused, setPaused] = useState(false)

  return (
    <button
      type="button"
      className="hero-pause"
      aria-label={paused ? playLabel : pauseLabel}
      onClick={(event) => {
        const next = !paused
        event.currentTarget.closest('.hero-slider')?.classList.toggle('hero-paused', next)
        setPaused(next)
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" focusable="false">
        {paused ? <path d="M3 1.5v11l9-5.5z" /> : <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" />}
      </svg>
    </button>
  )
}
