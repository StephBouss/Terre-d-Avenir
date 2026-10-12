import { erreurSansDonnees } from './erreur'
import type { Payload } from 'payload'
import type { Message } from '@/payload-types'
import type { Locale } from '../i18n/config'
import { notifierMessage } from './email'
import { CLE_GLOBALE, type LimiteurDebit } from './limite'
import { genererReference } from './reference'
import {
  CHAMPS_AUTORISES,
  CLE_IDEMPOTENCE,
  NOTICE_VERSION,
  validerAdhesion,
  validerContact,
  type DonneesAdhesion,
  type DonneesContact,
  type ReponseFormulaire,
  type TypeFormulaire,
} from './schema'

export type EntreeTraitement = {
  type: TypeFormulaire
  corps: unknown
  ip: string
  locale: Locale
  payload: Payload
  limiteur: LimiteurDebit
  /** Plafond tous visiteurs confondus (clé « * »). */
  limiteurGlobal?: LimiteurDebit
  maintenant?: number
}
export type SortieTraitement = { status: number; corps: ReponseFormulaire }

const REQUETE: SortieTraitement = { status: 400, corps: { ok: false, erreur: 'requete' } }
const succes = (reference: string): SortieTraitement => ({ status: 200, corps: { ok: true, reference } })

async function messageParCle(payload: Payload, cle: string): Promise<Message | undefined> {
  const res = await payload.find({ collection: 'messages', where: { cleIdempotence: { equals: cle } }, limit: 1, depth: 0, overrideAccess: true })
  return res.docs[0]
}

function nomAffiche(donnees: DonneesAdhesion | DonneesContact): string {
  return 'prenoms' in donnees ? `${donnees.prenoms} ${donnees.nom}` : [donnees.prenom, donnees.nom].filter(Boolean).join(' ')
}

/** Crée le message ; si un envoi simultané avec la même clé l’a déjà créé, renvoie celui-là (nouveau = false). */
async function enregistrer(payload: Payload, type: TypeFormulaire, cle: string, donnees: DonneesAdhesion | DonneesContact, locale: Locale): Promise<{ message: Message; nouveau: boolean }> {
  for (let essai = 1; ; essai++) {
    try {
      const message = await payload.create({
        collection: 'messages',
        overrideAccess: true,
        data: {
          reference: genererReference(type),
          type,
          nom: nomAffiche(donnees),
          donnees,
          locale,
          noticeVersion: type === 'adhesion' ? NOTICE_VERSION : null,
          cleIdempotence: cle,
          // État provisoire, remplacé par notifierMessage : un arrêt brutal laisse un état honnête et renvoyable.
          emailEtat: 'echec',
          emailErreur: 'Envoi non terminé.',
          traite: false,
        },
      })
      return { message, nouveau: true }
    } catch (error) {
      const existant = await messageParCle(payload, cle)
      if (existant) return { message: existant, nouveau: false }
      if (essai >= 3) throw error // sinon : collision de référence (improbable), nouvel essai
    }
  }
}

/**
 * Traite un envoi de formulaire. Ordre : requête bien formée, pot de miel, idempotence, limite, validation,
 * enregistrement (le succès n’est annoncé que s’il réussit), puis e-mail (son échec n’annule rien).
 */
export async function traiterEnvoi({ type, corps, ip, locale, payload, limiteur, limiteurGlobal, maintenant = Date.now() }: EntreeTraitement): Promise<SortieTraitement> {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps)) return REQUETE
  const brut = corps as Record<string, unknown>
  const cle = typeof brut.cle === 'string' ? brut.cle.toLowerCase() : ''
  if (!CLE_IDEMPOTENCE.test(cle)) return REQUETE

  if (typeof brut.siteWeb === 'string' && brut.siteWeb.trim() !== '') return succes(genererReference(type))

  const autorises = new Set<string>(['cle', 'siteWeb', ...CHAMPS_AUTORISES[type]])
  if (Object.keys(brut).some((k) => !autorises.has(k))) return REQUETE

  const existant = await messageParCle(payload, cle)
  if (existant) return existant.type === type ? succes(existant.reference) : REQUETE

  // Créneau réservé tout de suite (aucun await entre le contrôle et la réservation), rendu si l’envoi n’est pas enregistré.
  if (!limiteur.reserve(ip, maintenant)) return { status: 429, corps: { ok: false, erreur: 'limite' } }
  const libere = () => {
    limiteur.annule(ip, maintenant)
    limiteurGlobal?.annule(CLE_GLOBALE, maintenant)
  }
  if (limiteurGlobal && !limiteurGlobal.reserve(CLE_GLOBALE, maintenant)) {
    limiteur.annule(ip, maintenant)
    return { status: 429, corps: { ok: false, erreur: 'limite' } }
  }

  const resultat = type === 'adhesion' ? validerAdhesion(brut) : validerContact(brut)
  if (!resultat.ok) {
    libere()
    return { status: 400, corps: { ok: false, erreur: 'validation', champs: resultat.erreurs } }
  }

  let enregistre: { message: Message; nouveau: boolean }
  try {
    enregistre = await enregistrer(payload, type, cle, resultat.donnees, locale)
  } catch (error) {
    libere()
    throw error
  }
  const { message, nouveau } = enregistre
  if (!nouveau) libere()
  else {
    try {
      await notifierMessage(payload, message)
    } catch (error) {
      payload.logger.error({ err: erreurSansDonnees(error) }, `Notification e-mail impossible pour ${message.reference}`)
    }
  }
  return succes(message.reference)
}
