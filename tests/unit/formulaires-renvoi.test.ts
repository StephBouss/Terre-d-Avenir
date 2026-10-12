import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renvoyerEmail } from '@/lib/formulaires/renvoi'

const ADMIN = { id: 1, role: 'administrateur' }
const MESSAGE = { id: 5, reference: 'CT-ABCDEF', type: 'contact', locale: 'fr', createdAt: '2026-10-07T08:00:00.000Z', donnees: { nom: 'Mba' } }

function requete(user: unknown, message: Record<string, unknown> | null) {
  const update = vi.fn(async () => ({}))
  const req = {
    user,
    routeParams: { id: '5' },
    payload: {
      findByID: vi.fn(async () => message),
      findGlobal: vi.fn(async () => ({ emailContact: null, emailAdhesions: null })),
      update,
      sendEmail: vi.fn(),
    },
  }
  return { req: req as never, update }
}

beforeEach(() => {
  vi.stubEnv('SMTP_HOST', '')
  vi.stubEnv('EMAIL_CAPTURE_DIR', '')
})
afterEach(() => vi.unstubAllEnvs())

describe('renvoi de l’e-mail d’un message', () => {
  it('403 sans session ou sans droit de modification des messages', async () => {
    expect((await renvoyerEmail(requete({ id: 2, role: 'secretariat', acces: { messages: 'lecture' } }, { ...MESSAGE, emailEtat: 'echec' }).req)).status).toBe(403)
    expect((await renvoyerEmail(requete(null, { ...MESSAGE, emailEtat: 'echec' }).req)).status).toBe(403)
  })
  it('404 pour un message inconnu', async () => {
    expect((await renvoyerEmail(requete(ADMIN, null).req)).status).toBe(404)
  })
  it('409 si l’e-mail est déjà envoyé', async () => {
    expect((await renvoyerEmail(requete(ADMIN, { ...MESSAGE, emailEtat: 'envoye' }).req)).status).toBe(409)
  })
  it('échec ou non configuré : nouvelle tentative, état enregistré et renvoyé', async () => {
    const { req, update } = requete(ADMIN, { ...MESSAGE, emailEtat: 'echec' })
    const res = await renvoyerEmail(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ emailEtat: 'non_configure', emailErreur: null, emailEnvoyeLe: null })
    expect(update).toHaveBeenCalledTimes(1)
  })
  it('409 « Envoi déjà en cours. » si un renvoi du même message est en cours, puis le verrou est libéré', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    vi.stubEnv('SMTP_FROM', 'site@exemple.org')
    const { req } = requete(ADMIN, { ...MESSAGE, emailEtat: 'echec' })
    const payload = (req as unknown as { payload: { findGlobal: ReturnType<typeof vi.fn>; sendEmail: ReturnType<typeof vi.fn> } }).payload
    payload.findGlobal.mockResolvedValue({ emailContact: 'bureau@exemple.org', emailAdhesions: 'bureau@exemple.org' })
    let finir: () => void = () => {}
    payload.sendEmail.mockImplementation(() => new Promise<void>((resolve) => (finir = resolve)))
    const premier = renvoyerEmail(req)
    await vi.waitFor(() => expect(payload.sendEmail).toHaveBeenCalled())
    const second = await renvoyerEmail(req)
    expect(second.status).toBe(409)
    expect(await second.json()).toEqual({ message: 'Envoi déjà en cours.' })
    finir()
    expect((await premier).status).toBe(200)
    payload.sendEmail.mockResolvedValue(undefined)
    expect((await renvoyerEmail(req)).status).toBe(200)
  })
  it('le verrou est libéré même si l’envoi échoue', async () => {
    const { req, update } = requete(ADMIN, { ...MESSAGE, emailEtat: 'echec' })
    update.mockRejectedValue(new Error('base indisponible'))
    ;(req as unknown as { payload: { logger: unknown } }).payload.logger = { error: vi.fn() }
    await expect(renvoyerEmail(req)).rejects.toThrow()
    const { notificationsEnCours } = await import('@/lib/formulaires/verrou')
    expect(notificationsEnCours.size).toBe(0)
  })
})
