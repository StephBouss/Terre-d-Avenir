import { expect, test } from '@playwright/test'
import { loginAdmin } from './admin-helpers'

test.describe('admin Payload', () => {
  test.skip(({ isMobile }) => isMobile, 'admin vérifiée sur desktop')

  test('interface en français et menu regroupé', async ({ page }) => {
    await loginAdmin(page)
    const nav = page.locator('nav')
    for (const group of ['Contenus', 'Images', 'Site', 'Administration']) {
      await expect(nav.getByText(group, { exact: true })).toBeVisible()
    }
    // Libellé natif de Payload traduit en français.
    await expect(nav.getByText('Tableau de bord', { exact: true })).toBeVisible()
  })
})
