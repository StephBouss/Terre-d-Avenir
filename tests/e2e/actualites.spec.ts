import { expect, test } from '@playwright/test'

test('liste des actualités FR', async ({ page }) => {
  await page.goto('/fr/actualites')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('La vie de Terre d’Avenir')
  // Les specs qui créent des actualités (titres « E2E ») tournent en parallèle : on ne compte que celles du seed.
  await expect(page.locator('article').filter({ hasNotText: 'E2E' })).toHaveCount(7)
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
  // Retour à la liste : en haut du bandeau et en bas de l’article.
  await expect(page.getByRole('link', { name: 'Retour aux actualités' })).toHaveCount(2)
  await page.locator('[data-retour]').click()
  await expect(page).toHaveURL(/\/fr\/actualites$/)
})

test('bandeaux des pages intérieures centrés', async ({ page }) => {
  for (const url of ['/fr/actualites', '/fr/mediatheque', '/fr/ong', '/fr/contact', '/fr/actualites/tournoi-komo-kango-terre-davenir']) {
    await page.goto(url)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('text-align', 'center')
  }
})

test('article EN et slug inconnu', async ({ page }) => {
  await page.goto('/en/actualites/un-jeune-un-permis')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('One young person, one licence')
  const res = await page.goto('/fr/actualites/inexistant')
  expect(res?.status()).toBe(404)
  await expect(page.getByText('Page introuvable')).toBeVisible()
})
