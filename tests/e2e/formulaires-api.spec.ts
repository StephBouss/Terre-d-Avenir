import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { adminToken } from './admin-helpers'
import { envoyerFormulaire, ipAleatoire, lireMessage, purgerMessages } from './formulaires-helpers'

const PREFIXE = 'e2e-api-'
const CONTACT = { nom: `${PREFIXE}Mba`, email: 'visiteur@example.org', message: 'Bonjour, une question.' }
const ADHESION = { nom: `${PREFIXE}Obiang`, prenoms: 'Awa', telephone: '+241 06 12 34 56', notice: true }

test.describe('traitement des formulaires (API)', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    await purgerMessages(request, token, PREFIXE)
  })
  test.afterAll(async ({ request }) => {
    await purgerMessages(request, token, PREFIXE)
  })

  test('contact valide : référence CT et message enregistré', async ({ request }) => {
    const res = await envoyerFormulaire(request, 'contact', CONTACT)
    expect(res.status()).toBe(200)
    const { ok, reference } = await res.json()
    expect(ok).toBe(true)
    expect(reference).toMatch(/^CT-[A-HJ-NP-Z2-9]{6}$/)
    expect(await lireMessage(request, token, reference)).toMatchObject({ type: 'contact', locale: 'fr', nom: CONTACT.nom, noticeVersion: null })
  })

  test('adhésion valide : téléphone normalisé, notice versionnée, e-mail « non configuré »', async ({ request }) => {
    const { reference } = await (await envoyerFormulaire(request, 'adhesion', ADHESION)).json()
    expect(reference).toMatch(/^ADH-/)
    const message = await lireMessage(request, token, reference)
    // Aucune spec ne renseigne emailAdhesions : l’état est toujours « non configuré » pour une adhésion.
    expect(message).toMatchObject({ type: 'adhesion', nom: `Awa ${PREFIXE}Obiang`, noticeVersion: '2026-10-07', emailEtat: 'non_configure' })
    expect(message?.donnees).toMatchObject({ telephone: '+24106123456', interets: [] })
  })

  test('langue déduite de la page d’origine, jamais du corps', async ({ request }) => {
    const en = await (await envoyerFormulaire(request, 'contact', CONTACT, { referer: 'http://localhost:3100/en/contact' })).json()
    expect((await lireMessage(request, token, en.reference))?.locale).toBe('en')
    expect((await envoyerFormulaire(request, 'contact', { ...CONTACT, locale: 'en' })).status()).toBe(400) // le corps n’a pas de champ locale
    const sans = await (await envoyerFormulaire(request, 'contact', CONTACT)).json()
    expect((await lireMessage(request, token, sans.reference))?.locale).toBe('fr')
  })

  test('même clé deux fois : même référence, un seul message', async ({ request }) => {
    const cle = randomUUID()
    const ip = ipAleatoire()
    const a = await (await envoyerFormulaire(request, 'contact', { ...CONTACT, cle }, { ip })).json()
    const b = await (await envoyerFormulaire(request, 'contact', { ...CONTACT, cle }, { ip })).json()
    expect(b.reference).toBe(a.reference)
    const res = await request.get(`/api/messages?where[cleIdempotence][equals]=${cle}&depth=0`, { headers: { Authorization: `JWT ${token}` } })
    expect((await res.json()).totalDocs).toBe(1)
  })

  test('pot de miel rempli : succès apparent, rien n’est enregistré', async ({ request }) => {
    const res = await envoyerFormulaire(request, 'contact', { ...CONTACT, siteWeb: 'https://spam.example' })
    expect(res.status()).toBe(200)
    const { reference } = await res.json()
    expect(reference).toMatch(/^CT-/)
    expect(await lireMessage(request, token, reference)).toBeUndefined()
  })

  test('au-delà de 5 envois par IP en 10 minutes : refus 429', async ({ request }) => {
    const ip = ipAleatoire()
    for (let i = 0; i < 5; i++) expect((await envoyerFormulaire(request, 'contact', CONTACT, { ip })).status()).toBe(200)
    const refus = await envoyerFormulaire(request, 'contact', CONTACT, { ip })
    expect(refus.status()).toBe(429)
    expect(await refus.json()).toEqual({ ok: false, erreur: 'limite' })
    expect((await envoyerFormulaire(request, 'contact', CONTACT)).status()).toBe(200) // autre IP : accepté
  })

  test('champs invalides : 400 avec l’erreur de chaque champ', async ({ request }) => {
    const res = await envoyerFormulaire(request, 'adhesion', { nom: '', prenoms: 'Awa', telephone: '0612', email: 'x@', notice: false })
    expect(res.status()).toBe(400)
    expect(await res.json()).toEqual({ ok: false, erreur: 'validation', champs: { nom: 'requis', telephone: 'telephone', email: 'email', notice: 'notice' } })
  })

  test('requête mal formée : 415 sans JSON, 400 sans clé', async ({ request }) => {
    expect((await request.post('/api/formulaires/contact', { headers: { 'Content-Type': 'text/plain' }, data: 'nom=x' })).status()).toBe(415)
    expect((await request.post('/api/formulaires/contact', { data: CONTACT })).status()).toBe(400)
  })

  test('type de contenu strict : « text/plain;application/json » donne 415', async ({ request }) => {
    const res = await request.post('/api/formulaires/contact', { headers: { 'Content-Type': 'text/plain;application/json' }, data: JSON.stringify({ cle: randomUUID(), ...CONTACT }) })
    expect(res.status()).toBe(415)
  })

  test('corps trop grand : 413, rien d’enregistré', async ({ request }) => {
    const res = await request.post('/api/formulaires/contact', {
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ipAleatoire() },
      data: JSON.stringify({ cle: randomUUID(), ...CONTACT, message: 'x'.repeat(30_000) }),
    })
    expect(res.status()).toBe(413)
  })

  test('champ inconnu : 400 requête', async ({ request }) => {
    const res = await envoyerFormulaire(request, 'contact', { ...CONTACT, role: 'admin' })
    expect(res.status()).toBe(400)
    expect(await res.json()).toEqual({ ok: false, erreur: 'requete' })
  })
})
