import { expect, test, type Page } from '@playwright/test'
import { adminToken } from './admin-helpers'
import { ipAleatoire, lireMessage, purgerMessages } from './formulaires-helpers'

/** Après le chargement, tente d'envoyer le formulaire : aucune requête non-GET ni navigation ne doit partir. */
async function expectNoSubmission(page: Page, path: string, submitName: string, ariaOnlyButton: boolean) {
  await page.goto(path)
  const url = page.url()
  const sent: string[] = []
  page.on('request', (r) => {
    if (r.method() !== 'GET' || r.isNavigationRequest()) sent.push(`${r.method()} ${r.url()}`)
  })
  await page.getByLabel(/^Nom/).first().fill('Test', { force: true, timeout: 1000 }).catch(() => {}) // champ désactivé : refus attendu
  const button = page.getByRole('button', { name: submitName })
  if (ariaOnlyButton) {
    await button.focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Space')
  }
  await button.click({ force: true })
  await page.keyboard.press('Enter')
  await page.waitForTimeout(300)
  expect(sent).toEqual([])
  expect(page.url()).toBe(url)
  expect(page.url()).not.toContain('?')
}

test('adhésion : non ouverte, aucun envoi possible', async ({ page }) => {
  await page.goto('/fr/adhesion')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rejoindre Terre d’Avenir KOMO-KANGO')
  await expect(page.getByRole('note')).toContainText('ne sont pas encore ouvertes')
  await expect(page.getByLabel('Nom *')).toBeDisabled()
  await page.getByText('Une cotisation est-elle prévue ?').click()
  await expect(page.getByText('Aucun paiement n’est demandé dans ce formulaire.')).toBeVisible()
  await expectNoSubmission(page, '/fr/adhesion', 'Envoyer ma demande', true)
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
