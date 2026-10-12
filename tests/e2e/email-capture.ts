import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

/** Dossier où le serveur e2e écrit les e-mails (faux transport, voir src/lib/email/adaptateur.ts). Vidé par le globalSetup. */
export const EMAIL_CAPTURE_DIR = '.data/e2e-emails'

export type EmailCapture = { to?: unknown; subject?: string; text?: string; replyTo?: unknown }

export function emailsCaptures(): EmailCapture[] {
  if (!existsSync(EMAIL_CAPTURE_DIR)) return []
  return readdirSync(EMAIL_CAPTURE_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(path.join(EMAIL_CAPTURE_DIR, f), 'utf8')) as EmailCapture)
}
