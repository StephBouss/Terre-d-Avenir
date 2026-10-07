import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type { EmailAdapter } from 'payload'

export const NOM_EXPEDITEUR_DEFAUT = 'Terre d’Avenir KOMO-KANGO'

/** Variables d’environnement (sous-ensemble de process.env, pour les tests). */
type Env = Record<string, string | undefined>

const ADRESSE = /^[^\s@<>]+@[^\s@<>]+$/

/** « Nom <adresse@exemple.org> » ou « adresse@exemple.org » ; null si la valeur est vide ou invalide. */
export function lireExpediteur(valeur: string | undefined): { nom: string; adresse: string } | null {
  const v = (valeur ?? '').trim()
  if (!v) return null
  const m = /^(.*)<([^<>]+)>$/.exec(v)
  if (m) {
    const adresse = m[2].trim()
    if (!ADRESSE.test(adresse)) return null
    const nom = m[1].trim().replace(/^"(.*)"$/, '$1').trim()
    return { nom: nom || NOM_EXPEDITEUR_DEFAUT, adresse }
  }
  return ADRESSE.test(v) ? { nom: NOM_EXPEDITEUR_DEFAUT, adresse: v } : null
}

/** Vrai si un transport réel (SMTP) ou le faux transport des tests e2e est configuré. */
export function transportConfigure(env: Env = process.env): boolean {
  return Boolean(env.SMTP_HOST?.trim() || env.EMAIL_CAPTURE_DIR?.trim())
}

/** Faux transport e2e : chaque e-mail est écrit en JSON dans `dossier`, rien n’est envoyé. */
export function adaptateurCapture(dossier: string): EmailAdapter<{ fichier: string }> {
  return () => ({
    name: 'capture-e2e',
    defaultFromAddress: 'site@terredavenir.local',
    defaultFromName: NOM_EXPEDITEUR_DEFAUT,
    sendEmail: async (message) => {
      mkdirSync(dossier, { recursive: true })
      const fichier = path.join(dossier, `${Date.now()}-${randomUUID()}.json`)
      writeFileSync(fichier, JSON.stringify(message))
      return { fichier }
    },
  })
}

/**
 * Adaptateur de la config Payload :
 * - EMAIL_CAPTURE_DIR (e2e uniquement) : faux transport ;
 * - SMTP_HOST : Nodemailer en SMTP ;
 * - sinon : aucun (Payload écrit alors les e-mails dans la console ; les formulaires passent en « non configuré »).
 */
export function emailAdapter(env: Env = process.env): EmailAdapter | Promise<EmailAdapter> | undefined {
  const capture = env.EMAIL_CAPTURE_DIR?.trim()
  if (capture) return adaptateurCapture(capture) as EmailAdapter
  const host = env.SMTP_HOST?.trim()
  if (!host) return undefined
  const port = Number(env.SMTP_PORT) || 587
  const user = env.SMTP_USER?.trim()
  const expediteur = lireExpediteur(env.SMTP_FROM) ?? { nom: NOM_EXPEDITEUR_DEFAUT, adresse: user ?? '' }
  return nodemailerAdapter({
    defaultFromAddress: expediteur.adresse,
    defaultFromName: expediteur.nom,
    skipVerify: true, // pas de connexion SMTP au démarrage ni pendant le build
    transportOptions: {
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass: env.SMTP_PASS ?? '' } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    },
  })
}
