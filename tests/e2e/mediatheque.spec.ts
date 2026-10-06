import { expect, test } from '@playwright/test'

test('médiathèque : médias réels uniquement, visionneuse', async ({ page }) => {
  await page.goto('/fr/mediatheque')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Médiathèque')
  const thumbs = page.getByRole('button', { name: /Agrandir l’image/ })
  await expect(thumbs).toHaveCount(1) // seule la bannière est marquée « galerie »
  await thumbs.first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Fermer' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(thumbs.first()).toBeFocused()
  for (const text of ['Tournoi de football communautaire', 'Proposer un média']) await expect(page.getByText(text)).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Facebook/ }).first()).toHaveAttribute('target', '_blank')
})
