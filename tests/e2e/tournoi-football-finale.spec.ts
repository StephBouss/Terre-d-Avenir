import { expect, test } from '@playwright/test'

const TITLE_FR = '2e tournoi de football Komo-Kango Terre d’Avenir : la finale'
const TITLE_EN = '2nd Komo-Kango Terre d’Avenir football tournament: the final'
const ALT_FR = 'Coup d’envoi de la finale, devant les joueurs alignés et les tribunes'

test('actualité FR, avec bouton vers l’album de 6 photos', async ({ page }) => {
  await page.goto('/fr/actualites')
  await expect(page.locator('article').nth(1).getByRole('heading', { level: 3, name: TITLE_FR })).toBeVisible()
  await page.goto('/fr/actualites/tournoi-football-finale-2026')
  await expect(page.getByRole('heading', { level: 1, name: TITLE_FR })).toBeVisible()
  await expect(page.getByText('Monsieur Paul Ulrich Kessany').first()).toBeVisible()
  await page.getByRole('link', { name: 'Voir les photos de l’événement' }).click()
  await expect(page).toHaveURL(/\/fr\/mediatheque\/albums\/tournoi-football-2026-08$/)
  await expect(page.getByRole('heading', { level: 1, name: TITLE_FR })).toBeVisible()
  await expect(page.locator('main a[href*="/medias/file/"]')).toHaveCount(6)
  // Les vignettes sont décoratives (alt vide) : le texte alternatif validé est porté par le nom du lien.
  await expect(page.getByRole('link', { name: new RegExp(ALT_FR) })).toHaveCount(1)
})

test('version anglaise', async ({ page }) => {
  await page.goto('/en/actualites/tournoi-football-finale-2026')
  await expect(page.getByRole('heading', { level: 1, name: TITLE_EN })).toBeVisible()
  await page.getByRole('link', { name: 'See the event photos' }).click()
  await expect(page).toHaveURL(/\/en\/mediatheque\/albums\/tournoi-football-2026-08$/)
  await expect(page.locator('main a[href*="/medias/file/"]')).toHaveCount(6)
  await page.goto('/en/mediatheque')
  await expect(page.getByRole('link', { name: new RegExp(TITLE_EN) })).toBeVisible()
})
