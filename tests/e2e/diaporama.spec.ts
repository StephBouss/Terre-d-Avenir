import { expect, test } from '@playwright/test'
import { loginAdmin } from './admin-helpers'

test.describe('diaporama d’accueil', () => {
  test.skip(({ isMobile }) => isMobile, 'admin vérifiée sur desktop')

  test('écran dédié dans le groupe Images', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/globals/diaporama')
    await expect(page.getByRole('heading', { name: 'Diaporama d’accueil' })).toBeVisible()
  })

  test('le Hero de l’accueil affiche les images du diaporama', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.locator('.hero-slide img').first()).toHaveAttribute('src', /forest/)
  })
})
