'use client'
import { useId } from 'react'

/** Drapeau en SVG (les émojis drapeaux ne s'affichent pas sous Windows). Décoratif : le nom de la langue est porté par le lien. */
export default function Flag({ code, className = '' }: { code: string; className?: string }) {
  const id = useId()
  const common = { 'data-flag': code, 'aria-hidden': true, focusable: false, className, preserveAspectRatio: 'xMidYMid slice' } as const

  if (code === 'fr') {
    return (
      <svg {...common} viewBox="0 0 3 2">
        <rect width="1" height="2" fill="#002654" />
        <rect x="1" width="1" height="2" fill="#FFFFFF" />
        <rect x="2" width="1" height="2" fill="#CE1126" />
      </svg>
    )
  }

  if (code === 'gb') {
    return (
      <svg {...common} viewBox="0 0 60 30">
        <clipPath id={`${id}-s`}>
          <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id={`${id}-t`}>
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <g clipPath={`url(#${id}-s)`}>
          <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#C8102E" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
      </svg>
    )
  }

  return null
}
