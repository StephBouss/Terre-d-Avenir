'use client'

import { useState } from 'react'

type Props = {
  pauseLabel: string
  playLabel: string
  /** Conteneur animé (ancêtre du bouton) et classe qui fige son animation ; par défaut, le diaporama. */
  conteneur?: string
  classePause?: string
  className?: string
}

/** Pause d’un contenu animé (WCAG 2.2.2) : bascule la classe de pause sur le conteneur (voir globals.css). */
export default function HeroPauseButton({ pauseLabel, playLabel, conteneur = '.hero-slider', classePause = 'hero-paused', className = 'hero-pause' }: Props) {
  const [paused, setPaused] = useState(false)

  return (
    <button
      type="button"
      className={className}
      aria-label={paused ? playLabel : pauseLabel}
      onClick={(event) => {
        const next = !paused
        event.currentTarget.closest(conteneur)?.classList.toggle(classePause, next)
        setPaused(next)
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" focusable="false">
        {paused ? <path d="M3 1.5v11l9-5.5z" /> : <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" />}
      </svg>
    </button>
  )
}
