'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

type Props = { texte: string; reference: string; liens: { href: string; label: string }[] }

/** Confirmation après enregistrement : reçoit le focus pour être annoncée, et affiche la référence. */
export default function SuccesEnvoi({ texte, reference, liens }: Props) {
  const zone = useRef<HTMLDivElement>(null)
  useEffect(() => zone.current?.focus(), [])
  const [avant, apres = ''] = texte.split('{reference}')
  return (
    <div ref={zone} tabIndex={-1} role="status" className="rounded-lg p-6 flex flex-col gap-4 outline-none" style={{ background: '#F0F5EF', border: '1px solid #005C38' }}>
      <p className="text-base text-foreground font-medium leading-relaxed">
        {avant}
        <strong data-reference>{reference}</strong>
        {apres}
      </p>
      {liens.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {liens.map((lien) => (
            <Link key={lien.href} href={lien.href} className="font-bold text-primary underline">
              {lien.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
