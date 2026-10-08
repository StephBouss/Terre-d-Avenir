import { expect, test } from '@playwright/test'

test('accueil : la bande « Découvrir Kango » mène à la page', async ({ page }) => {
  await page.goto('/fr')
  const bande = page.locator('#kango')
  await expect(bande.getByRole('heading', { level: 2 })).toHaveText('Découvrir Kango, cœur du Komo-Kango')
  await expect(bande.locator('img')).toHaveCount(3)
  await bande.getByRole('link', { name: /Découvrir Kango/ }).click()
  await expect(page).toHaveURL(/\/fr\/decouvrir-kango$/)
})

test('page Découvrir Kango : texte, 5 photos, album et version anglaise', async ({ page }) => {
  await page.goto('/fr/decouvrir-kango')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Découvrir Kango, cœur du Komo-Kango')
  await expect(page.getByText(/au bord du fleuve Komo/).first()).toBeVisible()
  await expect(page.locator('main a[href*="/medias/file/"]')).toHaveCount(5)
  await expect(page.getByRole('link', { name: /Voir l’album photo/ })).toHaveAttribute('href', '/fr/mediatheque/albums/kango')
  await page.goto('/en/decouvrir-kango')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Discover Kango, heart of Komo-Kango')
})

test('médiathèque : l’album Kango, en dernier après les événements', async ({ page }) => {
  await page.goto('/fr/mediatheque/albums/kango')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kango, cœur du Komo-Kango')
  await expect(page.locator('main a[href*="/medias/file/"]')).toHaveCount(5)
})
