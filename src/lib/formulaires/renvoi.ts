import type { PayloadHandler } from 'payload'
import { notifierMessage } from './email'

export const ETATS_RENVOYABLES = ['echec', 'non_configure'] as const

/** POST /api/messages/:id/renvoyer — admin connecté uniquement ; refait la notification d’un message en échec ou non configuré. */
export const renvoyerEmail: PayloadHandler = async (req) => {
  if (!req.user) return Response.json({ message: 'Connexion requise.' }, { status: 403 })
  const id = String(req.routeParams?.id ?? '')
  const message = await req.payload.findByID({ collection: 'messages', id, depth: 0, disableErrors: true, overrideAccess: true })
  if (!message) return Response.json({ message: 'Message introuvable.' }, { status: 404 })
  if (!(ETATS_RENVOYABLES as readonly string[]).includes(message.emailEtat)) {
    return Response.json({ message: 'L’e-mail de ce message a déjà été envoyé.' }, { status: 409 })
  }
  return Response.json(await notifierMessage(req.payload, message))
}
