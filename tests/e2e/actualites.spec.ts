import { expect, test } from '@playwright/test'

test('liste des actualités FR', async ({ page }) => {
  await page.goto('/fr/actualites')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('La vie de Terre d’Avenir')
  await expect(page.locator('article')).toHaveCount(4)
  await expect(page.getByRole('link', { name: /Toutes les publications sur Facebook/ })).toHaveAttribute('target', '_blank')
})

test('article FR avec sa source', async ({ page }) => {
  await page.goto('/fr/actualites')
  await page.locator('article').filter({ hasText: 'Le tournoi Komo-Kango' }).getByRole('link', { name: 'Lire l’article' }).click()
  await expect(page).toHaveURL(/\/fr\/actualites\/tournoi-komo-kango-terre-davenir$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Le tournoi Komo-Kango Terre d’Avenir')
  await expect(page.getByText('8 août 2026').first()).toBeVisible()
  await expect(page.getByText('Le contexte')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Sur Facebook/ }).first()).toHaveAttribute('href', /facebook\.com/)
})

test('article EN et slug inconnu', async ({ page }) => {
  await page.goto('/en/actualites/un-jeune-un-permis')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('One young person, one licence')
  const res = await page.goto('/fr/actualites/inexistant')
  expect(res?.status()).toBe(404)
  await expect(page.getByText('Page introuvable')).toBeVisible()
})
