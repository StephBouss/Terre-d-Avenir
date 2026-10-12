'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, toast, useConfig, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { ETATS_RENVOYABLES } from '../../lib/formulaires/etats'

/** Bouton de la vue d’édition d’un message : visible seulement si l’e-mail est en échec ou non configuré. */
export default function RenvoyerEmail() {
  const { id } = useDocumentInfo()
  const { config } = useConfig()
  const etat = useFormFields(([fields]) => fields.emailEtat?.value as string | undefined)
  const router = useRouter()
  const [enCours, setEnCours] = useState(false)
  const [fait, setFait] = useState(false)

  if (!id || fait || !(ETATS_RENVOYABLES as readonly string[]).includes(etat ?? '')) return null

  async function renvoyer() {
    setEnCours(true)
    try {
      const res = await fetch(`${config.serverURL}${config.routes.api}/messages/${id}/renvoyer`, { method: 'POST', credentials: 'include' })
      const corps = (await res.json().catch(() => ({}))) as { emailEtat?: string; emailErreur?: string; message?: string }
      if (!res.ok) toast.error(corps.message ?? 'Renvoi impossible.')
      else if (corps.emailEtat === 'envoye') {
        toast.success('E-mail envoyé.')
        setFait(true)
        router.refresh()
      } else if (corps.emailEtat === 'non_configure') toast.warning('E-mail non configuré : renseigner le SMTP et l’adresse de réception dans les Réglages.')
      else toast.error(`Échec de l’envoi : ${corps.emailErreur ?? 'erreur inconnue'}`)
    } catch {
      toast.error('Renvoi impossible : vérifiez la connexion.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Button buttonStyle="secondary" size="medium" disabled={enCours} onClick={renvoyer}>
      Renvoyer l’e-mail
    </Button>
  )
}
