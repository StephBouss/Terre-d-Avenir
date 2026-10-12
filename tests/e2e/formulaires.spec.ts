import { expect, test, type Page } from '@playwright/test'
import { adminToken, loginAdmin } from './admin-helpers'
import { ipAleatoire, lireMessage, purgerMessages } from './formulaires-helpers'

test('adhésion : formulaire ouvert, sans bandeau de fermeture, FAQ', async ({ page }) => {
  await page.goto('/fr/adhesion')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rejoindre Terre d’Avenir KOMO-KANGO')
  await expect(page.getByText('ne sont pas encore ouvertes')).toHaveCount(0)
  await expect(page.getByLabel('Nom *')).toBeEnabled()
  await page.getByText('Une cotisation est-elle prévue ?').click()
  await expect(page.getByText('Aucun paiement n’est demandé dans ce formulaire.')).toBeVisible()
})

test('contact : orientations, ancre partenariat, aucune coordonnée inventée', async ({ page }) => {
  await page.goto('/fr/contact')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Entrons en contact')
  await expect(page.locator('#partenariat')).toContainText('Partenariat et presse')
  await expect(page.getByLabel('Votre message *')).toBeEnabled()
  for (const text of ['contact@terredavenir-komokango.org', '+241 XX', 'WhatsApp', 'BP :']) await expect(page.getByText(text)).toHaveCount(0)
})

const PREFIXE = 'e2e-form-ct-'

test.describe('contact : envoi', { tag: '@desktop' }, () => {
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

  async function remplir(page: Page, nom: string) {
    await page.getByLabel('Nom *').fill(nom)
    await page.getByLabel('Adresse e-mail *').fill('visiteur@example.org')
    await page.getByLabel('Votre message *').fill('Bonjour, je souhaite en savoir plus.')
  }

  test('envoi valide : référence affichée et message enregistré', async ({ page, request }) => {
    await page.setExtraHTTPHeaders({ 'X-Forwarded-For': ipAleatoire() })
    await page.goto('/fr/contact')
    await remplir(page, `${PREFIXE}Ndong`)
    await page.getByRole('button', { name: 'Envoyer le message' }).click()
    const confirmation = page.getByRole('status').filter({ hasText: 'Votre message a été enregistré.' })
    await expect(confirmation).toBeVisible()
    const reference = (await confirmation.locator('[data-reference]').textContent()) ?? ''
    expect(reference).toMatch(/^CT-[A-HJ-NP-Z2-9]{6}$/)
    expect(await lireMessage(request, token, reference)).toMatchObject({ type: 'contact', locale: 'fr', nom: `${PREFIXE}Ndong` })
    await expect(confirmation).not.toContainText(/e-mail/i) // la confirmation n’annonce jamais d’e-mail
  })

  test('champs invalides : erreurs affichées, saisie conservée, aucun envoi', async ({ page }) => {
    const envois: string[] = []
    page.on('request', (r) => {
      if (r.url().includes('/api/formulaires/')) envois.push(r.url())
    })
    await page.goto('/fr/contact')
    await page.getByLabel('Nom *').fill(`${PREFIXE}Ondo`)
    await page.getByLabel('Adresse e-mail *').fill('pas-un-email')
    await page.getByRole('button', { name: 'Envoyer le message' }).click()
    await expect(page.getByText('Vérifiez le format de votre adresse e-mail.')).toBeVisible()
    await expect(page.getByText('Ce champ est nécessaire pour traiter votre demande.')).toBeVisible()
    await expect(page.getByLabel('Adresse e-mail *')).toBeFocused()
    await expect(page.getByLabel('Nom *')).toHaveValue(`${PREFIXE}Ondo`)
    expect(envois).toEqual([])
  })

  test('erreur réseau : saisie conservée, nouvel essai avec la même clé', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'X-Forwarded-For': ipAleatoire() })
    const cles: string[] = []
    let coupe = true
    await page.route('**/api/formulaires/contact', async (route) => {
      cles.push(JSON.parse(route.request().postData() ?? '{}').cle)
      if (coupe) {
        coupe = false
        await route.abort('failed')
      } else await route.continue()
    })
    await page.goto('/fr/contact')
    await remplir(page, `${PREFIXE}Reseau`)
    await page.getByRole('button', { name: 'Envoyer le message' }).click()
    await expect(page.locator('form [role="alert"]')).toContainText('Nous n’avons pas pu confirmer l’enregistrement de votre message.')
    await expect(page.getByLabel('Nom *')).toHaveValue(`${PREFIXE}Reseau`)
    await page.getByRole('button', { name: 'Envoyer le message' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Votre message a été enregistré.' })).toBeVisible()
    expect(cles).toHaveLength(2)
    expect(cles[1]).toBe(cles[0])
  })
})

const PREFIXE_ADH = 'e2e-form-adh-'

test.describe('adhésion : envoi', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    await purgerMessages(request, token, PREFIXE_ADH)
  })
  test.afterAll(async ({ request }) => {
    await purgerMessages(request, token, PREFIXE_ADH)
  })

  test('envoi valide : référence ADH, données normalisées, visible dans « Messages reçus »', async ({ page, request }) => {
    await page.setExtraHTTPHeaders({ 'X-Forwarded-For': ipAleatoire() })
    await page.goto('/fr/adhesion')
    await page.getByLabel('Nom *').fill(`${PREFIXE_ADH}Obiang`)
    await page.getByLabel('Prénom(s) *').fill('Awa')
    await page.getByLabel('Téléphone avec indicatif international *').fill('+241 06 12 34 56')
    await page.getByLabel('Pays de résidence (facultatif)').selectOption({ label: 'Gabon' })
    await page.getByRole('checkbox', { name: 'Jeunesse' }).check()
    await page.getByLabel('Votre motivation (facultatif)').fill('Contribuer')
    await expect(page.getByText(/^10 \/ 1\s000 caractères$/)).toBeVisible()
    await page.getByRole('checkbox', { name: 'J’ai pris connaissance des informations relatives au traitement de ma demande d’adhésion.' }).check()
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
    const confirmation = page.getByRole('status').filter({ hasText: 'Votre demande a été enregistrée.' })
    await expect(confirmation).toBeVisible()
    const reference = (await confirmation.locator('[data-reference]').textContent()) ?? ''
    expect(reference).toMatch(/^ADH-[A-HJ-NP-Z2-9]{6}$/)
    const message = await lireMessage(request, token, reference)
    expect(message).toMatchObject({ type: 'adhesion', locale: 'fr', noticeVersion: '2026-10-07', emailEtat: 'non_configure' })
    expect(message?.donnees).toMatchObject({ telephone: '+24106123456', pays: 'GA', interets: ['jeunesse'], motivation: 'Contribuer' })
    await loginAdmin(page)
    await page.goto(`/admin/collections/messages?where[reference][equals]=${reference}`)
    await expect(page.getByRole('link', { name: reference })).toBeVisible()
  })

  test('notice non cochée et téléphone sans indicatif : erreurs, saisie conservée', async ({ page }) => {
    await page.goto('/fr/adhesion')
    await page.getByLabel('Nom *').fill(`${PREFIXE_ADH}Ella`)
    await page.getByLabel('Prénom(s) *').fill('Rodrigue')
    await page.getByLabel('Téléphone avec indicatif international *').fill('06 12 34 56')
    await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
    await expect(page.getByText('Vérifiez votre numéro et son indicatif international.')).toBeVisible()
    await expect(page.getByText('Veuillez prendre connaissance des informations sur le traitement de votre demande.')).toBeVisible()
    await expect(page.getByLabel('Téléphone avec indicatif international *')).toBeFocused()
    await expect(page.getByLabel('Nom *')).toHaveValue(`${PREFIXE_ADH}Ella`)
  })

  test('anglais : pays traduits et langue enregistrée', async ({ page, request }) => {
    await page.setExtraHTTPHeaders({ 'X-Forwarded-For': ipAleatoire() })
    await page.goto('/en/adhesion')
    await expect(page.getByLabel('Country of residence (optional)').locator('option', { hasText: 'Germany' })).toHaveCount(1)
    await page.getByLabel('Last name *').fill(`${PREFIXE_ADH}Mintsa`)
    await page.getByLabel('First name(s) *').fill('Prisca')
    await page.getByLabel('Phone number with international code *').fill('+33 6 12 34 56 78')
    await page.getByRole('checkbox', { name: 'I have read the information on how my membership application will be processed.' }).check()
    await page.getByRole('button', { name: 'Submit my application' }).click()
    const confirmation = page.getByRole('status').filter({ hasText: 'Your application has been recorded.' })
    await expect(confirmation).toBeVisible()
    const reference = (await confirmation.locator('[data-reference]').textContent()) ?? ''
    expect((await lireMessage(request, token, reference))?.locale).toBe('en')
  })
})
