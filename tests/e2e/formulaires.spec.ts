import { expect, test } from '@playwright/test'

test('adhésion : non ouverte, aucun envoi possible', async ({ page }) => {
  const posts: string[] = []
  page.on('request', (r) => {
    if (r.method() !== 'GET') posts.push(r.url())
  })
  await page.goto('/fr/adhesion')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rejoindre Terre d’Avenir KOMO-KANGO')
  await expect(page.getByRole('note')).toContainText('ne sont pas encore ouvertes')
  await expect(page.getByLabel('Nom *')).toBeDisabled()
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click({ force: true })
  await page.getByText('Une cotisation est-elle prévue ?').click()
  await expect(page.getByText('Aucun paiement n’est demandé dans ce formulaire.')).toBeVisible()
  expect(posts).toEqual([])
})

test('contact : orientations, ancre partenariat, aucune coordonnée inventée', async ({ page }) => {
  await page.goto('/fr/contact')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Entrons en contact')
  await expect(page.locator('#partenariat')).toContainText('Partenariat et presse')
  await expect(page.getByLabel('Votre message')).toBeDisabled()
  for (const text of ['contact@terredavenir-komokango.org', '+241 XX', 'WhatsApp', 'BP :']) await expect(page.getByText(text)).toHaveCount(0)
})
