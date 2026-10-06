import { expect, test } from '@playwright/test'

test('L’ONG', async ({ page }) => {
  await page.goto('/fr/ong')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terre d’Avenir KOMO-KANGO')
  await expect(page.getByRole('heading', { name: 'Une ONG ancrée dans son territoire' })).toBeVisible()
  for (const text of ['Nos valeurs', 'Fondée en 2022', 'Durabilité']) await expect(page.getByText(text)).toHaveCount(0)
})

test('Mot de la présidente sans signature non validée', async ({ page }) => {
  await page.goto('/fr/mot-de-la-presidente')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Le mot de la présidente')
  await expect(page.getByText('Chères filles et chers fils du Komo-Kango,', { exact: false })).toBeVisible()
  await expect(page.getByText(/À CONFIRMER/)).toHaveCount(0)
  await expect(page.locator('main img:not([alt=""])')).toHaveCount(0) // aucun portrait ni image signifiante
})

test('Organisation : état « en préparation » et FAQ', async ({ page }) => {
  await page.goto('/en/organisation')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our organization')
  await expect(page.getByText('The presentation of our organization is being prepared.', { exact: false })).toBeVisible()
  await page.getByText('How can I contact the NGO?').click()
  await expect(page.getByText(/not published automatically/)).toBeVisible()
})
