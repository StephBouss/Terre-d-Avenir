'use client'
import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { useReveal } from './useReveal'

type Props = { as?: ElementType; delay?: number; className?: string; id?: string; children: ReactNode }

export function Reveal({ as: Tag = 'div', delay = 0, className, id, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const style = delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined
  return (
    <Tag ref={ref} id={id} data-reveal="" className={className} style={style}>
      {children}
    </Tag>
  )
}
