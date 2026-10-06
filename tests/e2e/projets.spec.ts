import { expect, test } from '@playwright/test'

test('liste et fiche projet FR', async ({ page }) => {
  await page.goto('/fr/projets')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Des initiatives à découvrir')
  await expect(page.locator('article')).toHaveCount(4)
  await page.getByRole('link', { name: /Santé & sensibilisation/ }).click()
  await expect(page).toHaveURL(/\/fr\/projets\/sante-sensibilisation$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Faire circuler l’information utile.')
  await expect(page.getByText(/Société Gabonaise de Périnatologie/)).toBeVisible()
  await expect(page.getByRole('link', { name: /Consulter la publication/ }).first()).toHaveAttribute('target', '_blank')
})

test('fiche projet EN', async ({ page }) => {
  await page.goto('/en/projets/sport-cohesion')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Coming together around football.')
})
