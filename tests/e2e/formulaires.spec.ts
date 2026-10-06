import { expect, test, type Page } from '@playwright/test'

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
  await expect(page.getByLabel('Votre message')).toBeDisabled()
  for (const text of ['contact@terredavenir-komokango.org', '+241 XX', 'WhatsApp', 'BP :']) await expect(page.getByText(text)).toHaveCount(0)
})

test('contact : aucun envoi possible', async ({ page }) => {
  await expectNoSubmission(page, '/fr/contact', 'Envoyer le message', false)
})
