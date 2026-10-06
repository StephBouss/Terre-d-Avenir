import { expect, test } from '@playwright/test'

test('accueil FR : contenus des Textes v1.3', async ({ page }) => {
  await page.goto('/fr')
  await expect(page).toHaveTitle(/ONG, solidarité et développement local/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('faisons grandir')
  await expect(page.getByText('Depuis février 2025')).toBeVisible()
  await expect(page.getByRole('link', { name: /Lire le mot de la présidente/ })).toHaveAttribute('href', '/fr/mot-de-la-presidente')
  await expect(page.locator('article')).toHaveCount(3)
  await expect(page.getByRole('link', { name: /Jeunesse & opportunités|En savoir plus/ }).first()).toBeVisible()
})

test('accueil FR : aucun contenu inventé de la maquette', async ({ page }) => {
  await page.goto('/fr')
  for (const text of ['Fondée au Komo-Kango', 'Membres actifs', 'Demandes reçues', 'Données à connecter', 'Portrait à valider']) {
    await expect(page.getByText(text)).toHaveCount(0)
  }
})

test('accueil EN', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('let’s grow')
  await expect(page.getByRole('link', { name: /Join us/ }).first()).toHaveAttribute('href', '/en/adhesion')
})
