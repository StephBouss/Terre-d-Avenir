import { expect, test, type APIRequestContext } from '@playwright/test'
import { adminToken, loginAdmin } from './admin-helpers'
import { emailsCaptures } from './email-capture'
import { envoyerFormulaire, lireMessage, purgerMessages } from './formulaires-helpers'

const PREFIXE = 'e2e-mail-'
const DESTINATAIRE = 'e2e-reception@terredavenir.local'
const CONTACT = { email: 'visiteur@example.org', message: 'Message de test de la notification.' }

test.describe.configure({ mode: 'serial' })

// Seule spec qui modifie Réglages > emailContact : elle le remet à vide après coup. Aucune autre spec n’affirme l’état e-mail d’un contact.
test.describe('notification e-mail des messages', { tag: '@desktop' }, () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''
  const refs: Record<string, string> = {}

  async function reglerContact(request: APIRequestContext, adresse: string | null) {
    const res = await request.post('/api/globals/reglages', { headers: { Authorization: `JWT ${token}` }, data: { emailContact: adresse } })
    expect(res.ok(), await res.text()).toBe(true)
  }

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    await purgerMessages(request, token, PREFIXE)
    await reglerContact(request, null)
  })
  test.afterAll(async ({ request }) => {
    await reglerContact(request, null)
    await purgerMessages(request, token, PREFIXE)
  })

  test('sans adresse de réception : enregistré, état « non configuré », aucun e-mail', async ({ request }) => {
    const { reference } = await (await envoyerFormulaire(request, 'contact', { ...CONTACT, nom: `${PREFIXE}Sans-adresse` })).json()
    refs.sansAdresse = reference
    expect(await lireMessage(request, token, reference)).toMatchObject({ emailEtat: 'non_configure' })
    expect(emailsCaptures().some((e) => e.text?.includes(reference))).toBe(false)
  })

  test('avec adresse : e-mail capturé avec la référence et le lien admin, état « envoyé »', async ({ request }) => {
    await reglerContact(request, DESTINATAIRE)
    const { reference } = await (await envoyerFormulaire(request, 'contact', { ...CONTACT, nom: `${PREFIXE}Avec-adresse` })).json()
    refs.avecAdresse = reference
    const message = await lireMessage(request, token, reference)
    expect(message).toMatchObject({ emailEtat: 'envoye', emailErreur: null })
    expect(message?.emailEnvoyeLe).toBeTruthy()
    const email = emailsCaptures().find((e) => e.text?.includes(reference))
    expect(email, 'e-mail capturé').toBeDefined()
    expect(email!.to).toBe(DESTINATAIRE)
    expect(email!.subject).toContain(reference)
    expect(email!.text).toContain(`/admin/collections/messages/${message!.id}`)
    expect(email!.replyTo).toBe(CONTACT.email)
  })

  test('admin : données lisibles, puis « Renvoyer l’e-mail » sur un message non configuré', async ({ page, request }) => {
    const message = await lireMessage(request, token, refs.sansAdresse)
    expect(message?.emailEtat).toBe('non_configure')
    await loginAdmin(page)
    await page.goto(`/admin/collections/messages/${message!.id}`)
    const donnees = page.locator('.donnees-lisibles')
    await expect(donnees.getByText('Message', { exact: true })).toBeVisible()
    await expect(donnees.getByText(CONTACT.message)).toBeVisible()
    await page.getByRole('button', { name: 'Renvoyer l’e-mail' }).click()
    await expect(page.getByText('E-mail envoyé.')).toBeVisible()
    expect((await lireMessage(request, token, refs.sansAdresse))?.emailEtat).toBe('envoye')
    expect(emailsCaptures().some((e) => e.text?.includes(refs.sansAdresse))).toBe(true)
    await page.reload()
    await expect(page.getByRole('button', { name: 'Renvoyer l’e-mail' })).toHaveCount(0)
  })

  test('endpoint de renvoi : refusé sans session, refusé pour un e-mail déjà envoyé', async ({ request }) => {
    const message = await lireMessage(request, token, refs.avecAdresse)
    expect((await request.post(`/api/messages/${message!.id}/renvoyer`)).status()).toBe(403)
    expect((await request.post(`/api/messages/${message!.id}/renvoyer`, { headers: { Authorization: `JWT ${token}` } })).status()).toBe(409)
  })

  test('liste : colonnes demandées, non traités d’abord', async ({ page, request }) => {
    const message = await lireMessage(request, token, refs.sansAdresse)
    const patch = await request.patch(`/api/messages/${message!.id}`, { headers: { Authorization: `JWT ${token}` }, data: { traite: true } })
    expect(patch.ok(), await patch.text()).toBe(true)
    await loginAdmin(page)
    await page.goto(`/admin/collections/messages?search=${PREFIXE}`)
    const entete = page.locator('table thead')
    for (const colonne of ['Référence', 'Type', 'Nom', 'État de l’e-mail', 'Traité', 'Créé(e) à']) await expect(entete).toContainText(colonne)
    await expect(page.locator('table tbody')).toContainText(refs.avecAdresse)
    const lignes = await page.locator('table tbody tr').allTextContents()
    const nonTraite = lignes.findIndex((t) => t.includes(refs.avecAdresse))
    const traite = lignes.findIndex((t) => t.includes(refs.sansAdresse))
    expect(nonTraite).toBeGreaterThanOrEqual(0)
    expect(traite).toBeGreaterThan(nonTraite)
  })
})
