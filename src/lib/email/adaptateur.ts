import { randomUUID } from 'node:crypto'
import { mkdirSync, renameSync, writeFileSync } from 'node:fs'
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

/** Expéditeur SMTP : SMTP_FROM, sinon SMTP_USER ; null si vide ou invalide. */
function expediteurSmtp(env: Env): { nom: string; adresse: string } | null {
  return lireExpediteur(env.SMTP_FROM) ?? lireExpediteur(env.SMTP_USER)
}

/** La capture e2e ne s’active que si SMTP_HOST est vide : un SMTP réel l’emporte toujours. */
function dossierCapture(env: Env): string | undefined {
  const dossier = env.EMAIL_CAPTURE_DIR?.trim()
  return dossier && !env.SMTP_HOST?.trim() ? dossier : undefined
}

/** Vrai si un transport utilisable (SMTP complet ou faux transport des tests e2e) est configuré. */
export function transportConfigure(env: Env = process.env): boolean {
  if (dossierCapture(env)) return true
  return Boolean(env.SMTP_HOST?.trim() && expediteurSmtp(env))
}

/** Options du transport Nodemailer. STARTTLS est exigé (aucun identifiant en clair) sauf SMTP_INSECURE=1 (dev local). */
export function optionsSmtp(env: Env) {
  const port = Number(env.SMTP_PORT) || 587
  const user = env.SMTP_USER?.trim()
  return {
    host: env.SMTP_HOST?.trim() ?? '',
    port,
    secure: port === 465,
    requireTLS: port !== 465 && env.SMTP_INSECURE !== '1',
    auth: user ? { user, pass: env.SMTP_PASS ?? '' } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  }
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
      // Écriture atomique : le lecteur (tests e2e) ne voit jamais un fichier .json à moitié écrit.
      writeFileSync(`${fichier}.tmp`, JSON.stringify(message))
      renameSync(`${fichier}.tmp`, fichier)
      return { fichier }
    },
  })
}

/**
 * Adaptateur de la config Payload :
 * - EMAIL_CAPTURE_DIR (e2e uniquement, et seulement si SMTP_HOST est vide) : faux transport ;
 * - SMTP_HOST : Nodemailer en SMTP ;
 * - sinon : aucun (Payload écrit alors les e-mails dans la console ; les formulaires passent en « non configuré »).
 */
export function emailAdapter(env: Env = process.env): EmailAdapter | Promise<EmailAdapter> | undefined {
  const capture = dossierCapture(env)
  if (capture) return adaptateurCapture(capture) as EmailAdapter
  if (!env.SMTP_HOST?.trim()) return undefined
  const expediteur = expediteurSmtp(env)
  if (!expediteur) return undefined // expéditeur vide ou invalide : état « non configuré »
  return nodemailerAdapter({
    defaultFromAddress: expediteur.adresse,
    defaultFromName: expediteur.nom,
    skipVerify: true, // pas de connexion SMTP au démarrage ni pendant le build
    transportOptions: optionsSmtp(env),
  })
}
