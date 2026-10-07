import { expect, test } from '@playwright/test'
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './admin-credentials'
import { loginAdmin } from './admin-helpers'

test.describe('admin Payload', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'admin vérifiée sur desktop')

  // Vrai login par le formulaire : ajoute une session sans invalider la session partagée (jamais de logout). Desktop et en série.
  test('le formulaire de connexion ouvre l’admin', async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('input[name="email"]').fill(ADMIN_EMAIL)
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD)
    await page.locator('form button[type="submit"]').click()
    await expect(page).toHaveURL(/\/admin\/?(\?.*)?$/)
  })

  test('interface en français et menu regroupé', async ({ page }) => {
    await loginAdmin(page)
    const nav = page.getByRole('complementary').getByRole('navigation') // menu latéral
    for (const group of ['Contenus', 'Images', 'Site', 'Administration']) {
      await expect(nav.getByText(group, { exact: true })).toBeVisible()
    }
    // Libellé natif de Payload traduit en français (fil d’Ariane de l’en-tête).
    await expect(page.getByRole('banner').getByRole('navigation').getByText('Tableau de bord', { exact: true })).toBeVisible()
  })
})
