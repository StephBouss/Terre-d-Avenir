'use client'
import { useRef, type ElementType, type ReactNode } from 'react'
import { useReveal } from './useReveal'

type Props = { as?: ElementType; className?: string; children: ReactNode }

/** Les enfants directs apparaissent l'un après l'autre (80 ms d'écart, voir motion.css). */
export function RevealGroup({ as: Tag = 'div', className, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <Tag ref={ref} data-reveal-group="" className={className}>
      {children}
    </Tag>
  )
}
