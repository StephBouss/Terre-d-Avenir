import type { Payload } from 'payload'
import type { Message } from '@/payload-types'
import { transportConfigure } from '../email/adaptateur'
import { siteUrl } from '../seo'
import { lignesLisibles } from './libelles'

export type EtatEmail = { emailEtat: Message['emailEtat']; emailErreur: string | null; emailEnvoyeLe: string | null }

const DATE = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Libreville' })

type MessageEmail = Pick<Message, 'id' | 'reference' | 'type' | 'donnees' | 'locale' | 'createdAt'>

export function composerEmail(message: MessageEmail, base: string): { subject: string; text: string; replyTo?: string } {
  const adhesion = message.type === 'adhesion'
  const titre = adhesion ? 'Nouvelle demande d’adhésion' : 'Nouveau message de contact'
  const intro = adhesion ? 'Une demande d’adhésion a été envoyée depuis le site.' : 'Un message a été envoyé depuis le formulaire de contact du site.'
  const lignes = lignesLisibles(message.donnees).map(({ libelle, valeur }) => (valeur.includes('\n') ? `${libelle} :\n${valeur}` : `${libelle} : ${valeur}`))
  const donnees = (message.donnees ?? {}) as Record<string, unknown>
  const email = typeof donnees.email === 'string' && donnees.email ? donnees.email : undefined
  return {
    subject: `${titre} — ${message.reference}`,
    text: [
      intro,
      '',
      `Référence : ${message.reference}`,
      `Reçu le : ${DATE.format(new Date(message.createdAt))} (heure de Libreville)`,
      `Langue : ${message.locale === 'en' ? 'anglais' : 'français'}`,
      '',
      ...lignes,
      '',
      `Voir le message dans l’admin : ${base}/admin/collections/messages/${message.id}`,
    ].join('\n'),
    ...(email ? { replyTo: email } : {}),
  }
}

/** Envoie la notification si le transport et l’adresse de réception sont configurés, puis enregistre l’état sur le message. */
export async function notifierMessage(payload: Payload, message: Message): Promise<EtatEmail> {
  const reglages = await payload.findGlobal({ slug: 'reglages', depth: 0, overrideAccess: true })
  const destination = (message.type === 'adhesion' ? reglages.emailAdhesions : reglages.emailContact)?.trim()
  let etat: EtatEmail
  if (!transportConfigure() || !destination) {
    etat = { emailEtat: 'non_configure', emailErreur: null, emailEnvoyeLe: null }
  } else {
    try {
      await payload.sendEmail({ to: destination, ...composerEmail(message, siteUrl()) })
      etat = { emailEtat: 'envoye', emailErreur: null, emailEnvoyeLe: new Date().toISOString() }
    } catch (error) {
      etat = { emailEtat: 'echec', emailErreur: (error instanceof Error ? error.message : String(error)).slice(0, 500), emailEnvoyeLe: null }
    }
  }
  await payload.update({ collection: 'messages', id: message.id, data: etat, depth: 0, overrideAccess: true })
  return etat
}
