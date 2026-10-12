import type { PayloadHandler } from 'payload'
import { type Compte, peutModifier } from '../permissions'
import { notifierMessage } from './email'
import { ETATS_RENVOYABLES } from './etats'
import { notificationsEnCours } from './verrou'

/** POST /api/messages/:id/renvoyer — compte autorisé à modifier les messages ; refait la notification d’un message en échec ou non configuré. */
export const renvoyerEmail: PayloadHandler = async (req) => {
  if (!peutModifier(req.user as Compte | null, 'messages')) return Response.json({ message: 'Accès refusé.' }, { status: 403 })
  const id = String(req.routeParams?.id ?? '')
  const message = await req.payload.findByID({ collection: 'messages', id, depth: 0, disableErrors: true, overrideAccess: true })
  if (!message) return Response.json({ message: 'Message introuvable.' }, { status: 404 })
  if (!(ETATS_RENVOYABLES as readonly string[]).includes(message.emailEtat)) {
    return Response.json({ message: 'L’e-mail de ce message a déjà été envoyé.' }, { status: 409 })
  }
  // Un double clic ne doit pas envoyer deux e-mails : un seul renvoi à la fois par message.
  const cle = String(message.id)
  if (notificationsEnCours.has(cle)) return Response.json({ message: 'Envoi déjà en cours.' }, { status: 409 })
  notificationsEnCours.add(cle)
  try {
    return Response.json(await notifierMessage(req.payload, message))
  } finally {
    notificationsEnCours.delete(cle)
  }
}
