import { estCodePays } from './pays'

/* Règles partagées par le navigateur et le serveur : aucune dépendance serveur dans ce fichier. */

export type TypeFormulaire = 'adhesion' | 'contact'
export type CodeErreur = 'requis' | 'tropLong' | 'email' | 'telephone' | 'invalide' | 'notice'

/** Version de la notice d’information du formulaire d’adhésion, enregistrée avec chaque demande. */
export const NOTICE_VERSION = '2026-10-07'

/** Centres d’intérêt, dans l’ordre des libellés `adhesionForm.interestOptions` des dictionnaires. */
export const INTERETS = ['jeunesse', 'sante', 'sport', 'solidarite', 'autre'] as const
export type Interet = (typeof INTERETS)[number]

export const LIMITES = { nom: 80, prenoms: 80, prenom: 80, email: 254, ville: 100, motivation: 1000, organisation: 120, message: 2000 } as const

export type ChampAdhesion = 'nom' | 'prenoms' | 'telephone' | 'email' | 'pays' | 'ville' | 'interets' | 'motivation' | 'notice'
export type ChampContact = 'nom' | 'prenom' | 'email' | 'telephone' | 'organisation' | 'message'
export type Erreurs<C extends string> = Partial<Record<C, CodeErreur>>
export type Resultat<D, C extends string> = { ok: true; donnees: D } | { ok: false; erreurs: Erreurs<C> }

export type DonneesAdhesion = {
  nom: string
  prenoms: string
  telephone: string
  email: string | null
  pays: string | null
  ville: string | null
  interets: Interet[]
  motivation: string | null
}
export type DonneesContact = { nom: string; prenom: string | null; email: string; telephone: string | null; organisation: string | null; message: string }

export type ReponseFormulaire =
  | { ok: true; reference: string }
  | { ok: false; erreur: 'validation'; champs: Erreurs<string> }
  | { ok: false; erreur: 'limite' | 'requete' | 'serveur' }

export const CLE_IDEMPOTENCE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TELEPHONE = /^\+[1-9]\d{6,14}$/

/** Longueur en caractères visibles (un émoji ou un idéogramme compte pour un). */
export const longueur = (s: string): number => [...s].length

/** Chaîne nettoyée : caractères de contrôle retirés (sauf tabulation et retours à la ligne), espaces de bord supprimés. */
function texte(v: unknown): string {
  if (typeof v !== 'string') return ''
  return Array.from(v)
    .filter((c) => {
      const n = c.codePointAt(0) ?? 0
      return n === 9 || n === 10 || n === 13 || (n >= 32 && n !== 127)
    })
    .join('')
    .trim()
}

const objet = (brut: unknown): Record<string, unknown> => (brut && typeof brut === 'object' && !Array.isArray(brut) ? (brut as Record<string, unknown>) : {})

function obligatoire<C extends string>(erreurs: Erreurs<C>, champ: C, valeur: string, max: number) {
  if (!valeur) erreurs[champ] = 'requis'
  else if (longueur(valeur) > max) erreurs[champ] = 'tropLong'
}

function facultatif<C extends string>(erreurs: Erreurs<C>, champ: C, valeur: string, max: number) {
  if (valeur && longueur(valeur) > max) erreurs[champ] = 'tropLong'
}

const emailValide = (v: string) => longueur(v) <= LIMITES.email && EMAIL.test(v)

/** Numéro international : « +241 06 12 34 56 » ou « 00241… » → « +24106123456 » ; null si l’indicatif manque ou si la longueur est hors norme (E.164). */
export function normaliserTelephone(brut: string): string | null {
  const compact = brut.replace(/[\s.\-()  ]/g, '')
  const international = compact.startsWith('00') ? `+${compact.slice(2)}` : compact
  return TELEPHONE.test(international) ? international : null
}

export function validerAdhesion(brut: unknown): Resultat<DonneesAdhesion, ChampAdhesion> {
  const b = objet(brut)
  const erreurs: Erreurs<ChampAdhesion> = {}
  const nom = texte(b.nom)
  const prenoms = texte(b.prenoms)
  const telBrut = texte(b.telephone)
  const email = texte(b.email)
  const pays = texte(b.pays).toUpperCase()
  const ville = texte(b.ville)
  const motivation = texte(b.motivation)

  obligatoire(erreurs, 'nom', nom, LIMITES.nom)
  obligatoire(erreurs, 'prenoms', prenoms, LIMITES.prenoms)
  const telephone = telBrut ? normaliserTelephone(telBrut) : null
  if (!telBrut) erreurs.telephone = 'requis'
  else if (!telephone) erreurs.telephone = 'telephone'
  if (email && !emailValide(email)) erreurs.email = 'email'
  if (pays && !estCodePays(pays)) erreurs.pays = 'invalide'
  facultatif(erreurs, 'ville', ville, LIMITES.ville)
  const choix = b.interets === undefined ? [] : b.interets
  const interetsValides = Array.isArray(choix) && choix.every((i) => (INTERETS as readonly unknown[]).includes(i))
  if (!interetsValides) erreurs.interets = 'invalide'
  facultatif(erreurs, 'motivation', motivation, LIMITES.motivation)
  if (b.notice !== true) erreurs.notice = 'notice'

  if (Object.keys(erreurs).length > 0) return { ok: false, erreurs }
  return {
    ok: true,
    donnees: {
      nom,
      prenoms,
      telephone: telephone as string,
      email: email || null,
      pays: pays || null,
      ville: ville || null,
      interets: INTERETS.filter((i) => (choix as unknown[]).includes(i)),
      motivation: motivation || null,
    },
  }
}

export function validerContact(brut: unknown): Resultat<DonneesContact, ChampContact> {
  const b = objet(brut)
  const erreurs: Erreurs<ChampContact> = {}
  const nom = texte(b.nom)
  const prenom = texte(b.prenom)
  const email = texte(b.email)
  const telBrut = texte(b.telephone)
  const organisation = texte(b.organisation)
  const message = texte(b.message)

  obligatoire(erreurs, 'nom', nom, LIMITES.nom)
  facultatif(erreurs, 'prenom', prenom, LIMITES.prenom)
  if (!email) erreurs.email = 'requis'
  else if (!emailValide(email)) erreurs.email = 'email'
  const telephone = telBrut ? normaliserTelephone(telBrut) : null
  if (telBrut && !telephone) erreurs.telephone = 'telephone'
  facultatif(erreurs, 'organisation', organisation, LIMITES.organisation)
  obligatoire(erreurs, 'message', message, LIMITES.message)

  if (Object.keys(erreurs).length > 0) return { ok: false, erreurs }
  return { ok: true, donnees: { nom, prenom: prenom || null, email, telephone, organisation: organisation || null, message } }
}

/** Clé d’idempotence (UUID v4), générée au premier envoi. Repli sur getRandomValues hors contexte sécurisé (http hors localhost). */
export function nouvelleCle(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const o = crypto.getRandomValues(new Uint8Array(16))
  o[6] = (o[6] & 0x0f) | 0x40
  o[8] = (o[8] & 0x3f) | 0x80
  const h = Array.from(o, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
