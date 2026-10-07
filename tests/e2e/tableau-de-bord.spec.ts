import { expect, test } from '@playwright/test'
import { loginAdmin } from './admin-helpers'

test.describe('tableau de bord des indicateurs', () => {
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  test('valeurs réelles, situation datée et cartes sans source', async ({ page }) => {
    await loginAdmin(page)
    const board = page.locator('.kpi-dashboard')
    await expect(board.getByRole('heading', { name: 'Indicateurs' })).toBeVisible()
    await expect(board.getByText(/Situation au .* \(heure de Libreville\)/)).toBeVisible()
    // Seed : 3 actualités publiées. Regex tolérante : d'autres specs créent des actualités en parallèle (nettoyées en afterAll).
    await expect(board.getByRole('link', { name: /Publiées\s*[3-9]/ })).toBeVisible()
    await expect(board.getByText('Aucune source configurée — disponible au lot 2')).toBeVisible()
    await expect(board.getByText('Aucune source configurée — disponible au lot 4')).toBeVisible()
    await expect(board.getByText('Aucune sauvegarde configurée')).toBeVisible()
  })

  test('une carte mène à la liste filtrée', async ({ page }) => {
    await loginAdmin(page)
    await page.locator('.kpi-dashboard').getByRole('link', { name: /Provisoires à remplacer/ }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/medias/)
    await expect(page.getByRole('link', { name: /^forest.*.jpg/ }).first()).toBeVisible() // le seed suffixe les noms de fichier
    await expect(page.getByRole('link', { name: /^banner.*.jpg/ })).toHaveCount(0)
  })
})
