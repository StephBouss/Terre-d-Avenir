import type { Payload } from 'payload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { composerEmail, notifierMessage } from '@/lib/formulaires/email'
import { ipDepuisEntetes, localeDepuisReferer } from '@/lib/formulaires/entetes'
import { lignesLisibles } from '@/lib/formulaires/libelles'
import { LimiteurDebit } from '@/lib/formulaires/limite'
import { REFERENCE, genererReference } from '@/lib/formulaires/reference'
import { traiterEnvoi } from '@/lib/formulaires/traitement'
import type { Message } from '@/payload-types'

const CLE = '3b241101-e2bb-4255-8caf-4136c566a962'
const CONTACT = { cle: CLE, nom: 'Mba', prenom: 'Awa', email: 'awa@example.org', message: 'Bonjour\nMerci' }
const ADHESION = { cle: CLE, nom: 'Obiang', prenoms: 'Awa', telephone: '+241 06 12 34 56', pays: 'GA', interets: ['sport', 'jeunesse'], notice: true }

type Doc = Record<string, unknown> & { id: number }

function fauxPayload(options: { destination?: string | null; echecEmail?: boolean; echecCreation?: boolean } = {}) {
  const messages: Doc[] = []
  const emails: Record<string, unknown>[] = []
  const payload = {
    logger: { error: vi.fn() },
    find: vi.fn(async ({ where }: { where: { cleIdempotence: { equals: string } } }) => ({
      docs: messages.filter((m) => m.cleIdempotence === where.cleIdempotence.equals),
    })),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      if (options.echecCreation) throw new Error('base indisponible')
      if (messages.some((m) => m.cleIdempotence === data.cleIdempotence)) throw new Error('duplicate key')
      const doc = { ...data, id: messages.length + 1, createdAt: '2026-10-07T08:00:00.000Z' }
      messages.push(doc)
      return doc
    }),
    update: vi.fn(async ({ id, data }: { id: number; data: Record<string, unknown> }) => Object.assign(messages.find((m) => m.id === id)!, data)),
    findGlobal: vi.fn(async () => ({ emailAdhesions: options.destination ?? null, emailContact: options.destination ?? null })),
    sendEmail: vi.fn(async (m: Record<string, unknown>) => {
      if (options.echecEmail) throw new Error('SMTP indisponible')
      emails.push(m)
    }),
  }
  return { payload: payload as unknown as Payload, brut: payload, messages, emails }
}

const entree = (payload: Payload, corps: unknown, over: Partial<Parameters<typeof traiterEnvoi>[0]> = {}) => ({
  type: 'contact' as const,
  corps,
  ip: '10.0.0.1',
  locale: 'fr' as const,
  payload,
  limiteur: new LimiteurDebit(5, 600_000),
  maintenant: 1_000_000,
  ...over,
})

beforeEach(() => {
  vi.stubEnv('SMTP_HOST', '')
  vi.stubEnv('SMTP_FROM', 'site@exemple.org')
  vi.stubEnv('EMAIL_CAPTURE_DIR', '')
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://site.org')
})
afterEach(() => vi.unstubAllEnvs())

describe('limite de débit', () => {
  it('5 envois par clé et par fenêtre, puis refus ; la fenêtre glisse', () => {
    const l = new LimiteurDebit(5, 600_000)
    for (let i = 0; i < 5; i++) {
      expect(l.autorise('ip', i)).toBe(true)
      l.enregistre('ip', i)
    }
    expect(l.autorise('ip', 10)).toBe(false)
    expect(l.autorise('autre', 10)).toBe(true)
    expect(l.autorise('ip', 600_000)).toBe(true) // le premier envoi (t = 0) sort de la fenêtre
  })
})

describe('limite de débit : réservation', () => {
  it('reserve occupe un créneau tout de suite ; annule le libère', () => {
    const l = new LimiteurDebit(2, 600_000)
    expect(l.reserve('ip', 0)).toBe(true)
    expect(l.reserve('ip', 1)).toBe(true)
    expect(l.reserve('ip', 2)).toBe(false)
    l.annule('ip', 1)
    expect(l.reserve('ip', 3)).toBe(true)
  })
  it('purge au plus une fois par fenêtre', () => {
    const l = new LimiteurDebit(5, 1000)
    l.reserve('a', 0)
    l.reserve('b', 1)
    expect(l.taille).toBe(2)
    l.reserve('c', 1500) // a et b expirés : première purge de la fenêtre
    expect(l.taille).toBe(1)
    l.reserve('d', 1600)
    l.reserve('e', 1700)
    expect(l.taille).toBe(3)
  })
})

describe('référence', () => {
  it('ADH-XXXXXX ou CT-XXXXXX, sans caractère ambigu', () => {
    for (let i = 0; i < 50; i++) {
      expect(genererReference('adhesion')).toMatch(/^ADH-/)
      expect(genererReference('contact')).toMatch(REFERENCE)
    }
  })
})

describe('en-têtes', () => {
  it('IP : premier X-Forwarded-For, puis X-Real-IP', () => {
    expect(ipDepuisEntetes(new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4')
    expect(ipDepuisEntetes(new Headers({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8')
    expect(ipDepuisEntetes(new Headers())).toBe('inconnue')
  })
  it('langue : celle de la page d’origine, sinon le français', () => {
    expect(localeDepuisReferer('https://site.org/en/contact')).toBe('en')
    expect(localeDepuisReferer('https://site.org/fr/adhesion?x=1')).toBe('fr')
    expect(localeDepuisReferer('https://site.org/es/contact')).toBe('fr')
    expect(localeDepuisReferer('pas une url')).toBe('fr')
    expect(localeDepuisReferer(null)).toBe('fr')
  })
})

describe('libellés lisibles', () => {
  it('ordre des champs, pays et centres d’intérêt en clair, valeurs vides omises', () => {
    expect(lignesLisibles({ interets: ['jeunesse', 'sport'], pays: 'GA', nom: 'Obiang', email: null, inconnu: 'x' })).toEqual([
      { libelle: 'Nom', valeur: 'Obiang' },
      { libelle: 'Pays de résidence', valeur: 'Gabon (GA)' },
      { libelle: 'Centres d’intérêt', valeur: 'Jeunesse, Sport' },
    ])
    expect(lignesLisibles(null)).toEqual([])
  })
})

describe('e-mail de notification', () => {
  const message = {
    id: 7,
    reference: 'CT-ABCDEF',
    type: 'contact',
    locale: 'en',
    createdAt: '2026-10-07T08:00:00.000Z',
    donnees: { nom: 'Mba', prenom: 'Awa', email: 'awa@example.org', telephone: null, organisation: null, message: 'Bonjour\nMerci' },
  } as unknown as Message

  it('résumé lisible, lien vers l’admin, réponse au visiteur', () => {
    const mail = composerEmail(message, 'https://site.org')
    expect(mail.subject).toBe('Nouveau message de contact — CT-ABCDEF')
    expect(mail.replyTo).toBe('awa@example.org')
    for (const ligne of ['Référence : CT-ABCDEF', 'Reçu le : 7 octobre 2026 à 09:00 (heure de Libreville)', 'Langue : anglais', 'Nom : Mba', 'Prénom : Awa', 'Message :\nBonjour\nMerci', 'https://site.org/admin/collections/messages/7']) {
      expect(mail.text).toContain(ligne)
    }
    expect(mail.text).not.toContain('Téléphone')
  })

  it('non configuré sans transport, même avec une adresse', async () => {
    const f = fauxPayload({ destination: 'recu@exemple.org' })
    f.messages.push({ ...(message as unknown as Doc) })
    expect(await notifierMessage(f.payload, message)).toEqual({ emailEtat: 'non_configure', emailErreur: null, emailEnvoyeLe: null })
    expect(f.brut.sendEmail).not.toHaveBeenCalled()
  })

  it('non configuré sans adresse de réception, même avec un transport', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    const f = fauxPayload({ destination: null })
    f.messages.push({ ...(message as unknown as Doc) })
    expect((await notifierMessage(f.payload, message)).emailEtat).toBe('non_configure')
  })

  it('envoyé, puis état enregistré sur le message', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    const f = fauxPayload({ destination: 'recu@exemple.org' })
    f.messages.push({ ...(message as unknown as Doc) })
    const etat = await notifierMessage(f.payload, message)
    expect(etat.emailEtat).toBe('envoye')
    expect(f.emails[0]).toMatchObject({ to: 'recu@exemple.org', subject: 'Nouveau message de contact — CT-ABCDEF' })
    expect(f.messages[0]).toMatchObject({ emailEtat: 'envoye', emailErreur: null })
  })

  it('échec : erreur conservée', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    const f = fauxPayload({ destination: 'recu@exemple.org', echecEmail: true })
    f.messages.push({ ...(message as unknown as Doc) })
    expect(await notifierMessage(f.payload, message)).toEqual({ emailEtat: 'echec', emailErreur: 'SMTP indisponible', emailEnvoyeLe: null })
  })
})

describe('traitement d’un envoi : correctifs de revue', () => {
  const REQUETE = { status: 400, corps: { ok: false, erreur: 'requete' } }
  const AUTRE_CLE = '3b241101-e2bb-4255-8caf-4136c566a963'
  it('champs inconnus : 400 requete, rien d’enregistré', async () => {
    const { payload, messages } = fauxPayload()
    expect(await traiterEnvoi(entree(payload, { ...CONTACT, role: 'admin' }))).toEqual(REQUETE)
    expect(await traiterEnvoi(entree(payload, { ...CONTACT, notice: true }))).toEqual(REQUETE)
    expect(messages).toHaveLength(0)
  })
  it('rafale : 12 appels concurrents avec des clés différentes, 5 passent', async () => {
    const { payload, messages } = fauxPayload()
    const limiteur = new LimiteurDebit(5, 600_000)
    const cles = Array.from({ length: 12 }, (_, i) => `3b241101-e2bb-4255-8caf-4136c566a9${String(i).padStart(2, '0')}`)
    const sorties = await Promise.all(cles.map((cle) => traiterEnvoi(entree(payload, { ...CONTACT, cle }, { limiteur }))))
    expect(sorties.filter((s) => s.status === 200)).toHaveLength(5)
    expect(sorties.filter((s) => s.status === 429)).toHaveLength(7)
    expect(messages).toHaveLength(5)
  })
  it('validation en échec ou clé déjà connue : aucun créneau consommé', async () => {
    const { payload } = fauxPayload()
    const limiteur = new LimiteurDebit(1, 600_000)
    expect((await traiterEnvoi(entree(payload, { ...CONTACT, nom: '' }, { limiteur }))).status).toBe(400)
    expect((await traiterEnvoi(entree(payload, CONTACT, { limiteur }))).status).toBe(200)
    expect((await traiterEnvoi(entree(payload, CONTACT, { limiteur }))).status).toBe(200) // même clé : pas de créneau
    expect((await traiterEnvoi(entree(payload, { ...CONTACT, cle: AUTRE_CLE }, { limiteur }))).status).toBe(429)
  })
  it('même clé en simultané : un seul créneau consommé', async () => {
    const { payload, messages } = fauxPayload()
    const limiteur = new LimiteurDebit(2, 600_000)
    await Promise.all([traiterEnvoi(entree(payload, CONTACT, { limiteur })), traiterEnvoi(entree(payload, CONTACT, { limiteur }))])
    expect(messages).toHaveLength(1)
    expect((await traiterEnvoi(entree(payload, { ...CONTACT, cle: AUTRE_CLE }, { limiteur }))).status).toBe(200)
  })
})

describe('mise à jour de l’état après envoi', () => {
  it('première mise à jour en échec : journalisée, retentée, état « envoyé » conservé, un seul e-mail', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    const { payload, brut, messages, emails } = fauxPayload({ destination: 'bureau@exemple.org' })
    const message = { id: 1, reference: 'CT-ABCDEF', type: 'contact', donnees: { nom: 'x' }, locale: 'fr', createdAt: '2026-10-07T08:00:00.000Z' }
    messages.push({ ...message, emailEtat: 'echec', emailErreur: 'Envoi non terminé.' })
    brut.update.mockRejectedValueOnce(new Error('base occupée'))
    const etat = await notifierMessage(payload, message as unknown as Message)
    expect(etat.emailEtat).toBe('envoye')
    expect(emails).toHaveLength(1)
    expect(brut.update).toHaveBeenCalledTimes(2)
    expect(brut.logger.error).toHaveBeenCalled()
    expect(messages[0].emailEtat).toBe('envoye')
  })
})

describe('traitement d’un envoi', () => {
  it('contact valide : référence, enregistrement complet, e-mail non configuré', async () => {
    const f = fauxPayload()
    const sortie = await traiterEnvoi(entree(f.payload, CONTACT))
    expect(sortie.status).toBe(200)
    expect(sortie.corps.ok && sortie.corps.reference).toMatch(/^CT-/)
    expect(f.messages).toHaveLength(1)
    expect(f.messages[0]).toMatchObject({ type: 'contact', nom: 'Awa Mba', locale: 'fr', noticeVersion: null, cleIdempotence: CLE, emailEtat: 'non_configure', traite: false })
    expect(f.messages[0].donnees).toEqual({ nom: 'Mba', prenom: 'Awa', email: 'awa@example.org', telephone: null, organisation: null, message: 'Bonjour\nMerci' })
  })

  it('adhésion valide : version de la notice et données normalisées', async () => {
    const f = fauxPayload()
    const sortie = await traiterEnvoi(entree(f.payload, ADHESION, { type: 'adhesion', locale: 'en' }))
    expect(sortie.corps.ok && sortie.corps.reference).toMatch(/^ADH-/)
    expect(f.messages[0]).toMatchObject({ type: 'adhesion', nom: 'Awa Obiang', locale: 'en', noticeVersion: '2026-10-07' })
    expect(f.messages[0].donnees).toMatchObject({ telephone: '+24106123456', pays: 'GA', interets: ['jeunesse', 'sport'] })
  })

  it('même clé : même référence, aucun doublon, aucun second e-mail', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    const f = fauxPayload({ destination: 'recu@exemple.org' })
    const limiteur = new LimiteurDebit(5, 600_000)
    const a = await traiterEnvoi(entree(f.payload, CONTACT, { limiteur }))
    const b = await traiterEnvoi(entree(f.payload, CONTACT, { limiteur }))
    expect(b).toEqual(a)
    expect(f.messages).toHaveLength(1)
    expect(f.emails).toHaveLength(1)
  })

  it('même clé pour un autre formulaire : requête refusée', async () => {
    const f = fauxPayload()
    await traiterEnvoi(entree(f.payload, CONTACT))
    expect(await traiterEnvoi(entree(f.payload, ADHESION, { type: 'adhesion' }))).toEqual({ status: 400, corps: { ok: false, erreur: 'requete' } })
  })

  it('pot de miel rempli : succès apparent, rien n’est enregistré ni compté', async () => {
    const f = fauxPayload()
    const limiteur = new LimiteurDebit(1, 600_000)
    const sortie = await traiterEnvoi(entree(f.payload, { ...CONTACT, siteWeb: 'https://spam.example' }, { limiteur }))
    expect(sortie.status).toBe(200)
    expect(sortie.corps.ok && sortie.corps.reference).toMatch(REFERENCE)
    expect(f.messages).toHaveLength(0)
    expect(limiteur.autorise('10.0.0.1', 1_000_000)).toBe(true)
  })

  it('limite atteinte : 429 ; une clé déjà connue garde sa référence', async () => {
    const f = fauxPayload()
    const limiteur = new LimiteurDebit(1, 600_000)
    const premier = await traiterEnvoi(entree(f.payload, CONTACT, { limiteur }))
    const autre = { ...CONTACT, cle: 'a3bb189e-8bf9-4888-9912-ace4e6543002' }
    expect(await traiterEnvoi(entree(f.payload, autre, { limiteur }))).toEqual({ status: 429, corps: { ok: false, erreur: 'limite' } })
    expect(await traiterEnvoi(entree(f.payload, CONTACT, { limiteur }))).toEqual(premier)
  })

  it('validation : 400 avec les erreurs par champ, rien d’enregistré', async () => {
    const f = fauxPayload()
    expect(await traiterEnvoi(entree(f.payload, { cle: CLE, nom: 'Mba' }))).toEqual({ status: 400, corps: { ok: false, erreur: 'validation', champs: { email: 'requis', message: 'requis' } } })
    expect(f.messages).toHaveLength(0)
  })

  it('corps ou clé invalides : 400 requete', async () => {
    const f = fauxPayload()
    for (const corps of [null, [], 'texte', { ...CONTACT, cle: 'pas-une-cle' }]) {
      expect(await traiterEnvoi(entree(f.payload, corps))).toEqual({ status: 400, corps: { ok: false, erreur: 'requete' } })
    }
  })

  it('échec de l’e-mail : l’enregistrement et la référence restent', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.exemple.org')
    const f = fauxPayload({ destination: 'recu@exemple.org', echecEmail: true })
    const sortie = await traiterEnvoi(entree(f.payload, CONTACT))
    expect(sortie.status).toBe(200)
    expect(f.messages[0]).toMatchObject({ emailEtat: 'echec', emailErreur: 'SMTP indisponible' })
  })

  it('échec de l’enregistrement : l’erreur remonte (la route répond 500)', async () => {
    const f = fauxPayload({ echecCreation: true })
    await expect(traiterEnvoi(entree(f.payload, CONTACT))).rejects.toThrow('base indisponible')
  })
})
