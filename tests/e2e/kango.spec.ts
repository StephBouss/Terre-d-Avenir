import { expect, test } from '@playwright/test'

test('accueil : la bande « Découvrir Kango » mène à la page', async ({ page }) => {
  await page.goto('/fr')
  const bande = page.locator('#kango')
  await expect(bande.getByRole('heading', { level: 2 })).toHaveText('Découvrir Kango, cœur du Komo-Kango')
  // Galerie défilante : les 5 photos légendées, puis leur copie (masquée aux lecteurs d’écran) pour boucler.
  const cartes = bande.locator('.kango-galerie-carte:not([data-copie])')
  await expect(cartes).toHaveCount(5)
  await expect(bande.locator('.kango-galerie-carte[data-copie][aria-hidden="true"]')).toHaveCount(5)
  await expect(cartes.first().locator('figcaption')).toContainText('Vue sur Kango, la forêt et le fleuve Komo')
  await bande.getByRole('link', { name: /Découvrir Kango/ }).click()
  await expect(page).toHaveURL(/\/fr\/decouvrir-kango$/)
})

test('accueil : la galerie Kango défile et le bouton la met en pause (WCAG 2.2.2)', async ({ page }) => {
  await page.goto('/fr')
  const piste = page.locator('#kango .kango-galerie-piste')
  await expect(piste).toHaveCSS('animation-play-state', 'running')
  await page.getByRole('button', { name: 'Mettre la galerie en pause' }).click()
  await expect(piste).toHaveCSS('animation-play-state', 'paused')
  await page.getByRole('button', { name: 'Reprendre le défilement de la galerie' }).click()
  await page.mouse.move(0, 0)
  await expect(piste).toHaveCSS('animation-play-state', 'running')
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
