'use client'

import { Fragment } from 'react'
import { useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import { lignesLisibles } from '@/lib/formulaires/libelles'

/** Affiche le champ JSON `donnees` d’un message sous forme de liste « libellé : valeur », en lecture seule. */
const DonneesLisibles: JSONFieldClientComponent = ({ path }) => {
  const { value } = useField<unknown>({ path })
  const lignes = lignesLisibles(value)
  return (
    <div className="field-type donnees-lisibles" style={{ marginBottom: 'var(--base)' }}>
      <p className="field-label" style={{ marginBottom: 8 }}>Données envoyées</p>
      {lignes.length === 0 ? (
        <p>Aucune donnée.</p>
      ) : (
        <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, max-content) 1fr', gap: '6px 16px', margin: 0 }}>
          {lignes.map((ligne) => (
            <Fragment key={ligne.libelle}>
              <dt style={{ fontWeight: 600 }}>{ligne.libelle}</dt>
              <dd style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{ligne.valeur}</dd>
            </Fragment>
          ))}
        </dl>
      )}
    </div>
  )
}

export default DonneesLisibles
