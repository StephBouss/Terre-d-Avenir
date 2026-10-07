import { expect, test } from '@playwright/test'

test('médiathèque : médias réels uniquement, visionneuse', async ({ page }) => {
  await page.goto('/fr/mediatheque')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Médiathèque')
  // D'autres specs passent temporairement d'autres photos en « galerie » : on cible la bannière par son texte alternatif.
  const banner = page.getByRole('link', { name: 'Agrandir l’image : Bannière de Terre d’Avenir KOMO-KANGO' })
  await expect(banner).toHaveCount(1)
  await banner.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Fermer' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(banner).toBeFocused()
  for (const text of ['Tournoi de football communautaire', 'Proposer un média']) await expect(page.getByText(text)).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Facebook/ }).first()).toHaveAttribute('target', '_blank')
})
