import { expect, test } from '@playwright/test'
import { loginAdmin } from './admin-helpers'

test.describe('diaporama d’accueil', { tag: '@desktop' }, () => {
  test.skip(({ isMobile }) => isMobile, 'admin vérifiée sur desktop')

  test('écran dédié dans le groupe Images', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/globals/diaporama')
    await expect(page.getByRole('heading', { name: 'Diaporama d’accueil' })).toBeVisible()
  })

  test('le Hero de l’accueil affiche les images du diaporama', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.locator('.hero-slide img').first()).toHaveAttribute('src', /kafele-nianame-4-photo/)
  })

  test('un texte par image, qui change avec elle', async ({ page }) => {
    await page.goto('/fr')
    const textes = page.locator('.hero-texte')
    await expect(textes).toHaveCount(3)
    await expect(textes.nth(0).getByRole('heading', { level: 1 })).toContainText('faisons grandir')
    await expect(textes.nth(1)).toContainText('force vive')
    await expect(textes.nth(2)).toContainText('agissons')
    // Même rythme que les images : la 2e diapositive (texte et image) est visible vers 6,5 s.
    await page.waitForTimeout(7000)
    await expect(textes.nth(1)).toHaveCSS('opacity', '1')
    await expect(page.locator('.hero-slide').nth(1)).toHaveCSS('opacity', '1')
    await expect(textes.nth(0)).toHaveCSS('opacity', '0')
  })

  test('les textes des diapositives se modifient dans l’admin', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/globals/diaporama')
    await expect(page.getByText('Textes des diapositives')).toBeVisible()
    await expect(page.locator('input[name="textes.1.titre"]')).toHaveValue(/force vive/)
  })
})
