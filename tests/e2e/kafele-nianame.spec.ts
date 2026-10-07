import { expect, test } from '@playwright/test'

const TITLE_FR = 'Kafélé et Nianame : un dispensaire et une école réhabilités'
const TITLE_EN = 'Kafélé and Nianame: a health centre and a school rehabilitated'
const ALT_FR = 'Photo de groupe des participants devant le bâtiment réhabilité'

test('actualité FR en tête de liste, avec bouton vers l’album', async ({ page }) => {
  await page.goto('/fr/actualites')
  await expect(page.locator('article').first().getByRole('heading', { level: 3, name: TITLE_FR })).toBeVisible()
  await page.goto('/fr/actualites/kafele-nianame-rehabilitation')
  await expect(page.getByRole('heading', { level: 1, name: TITLE_FR })).toBeVisible()
  await expect(page.getByText('Construction du Komo SARL')).toBeVisible()
  await page.getByRole('link', { name: 'Voir les photos de l’événement' }).click()
  await expect(page).toHaveURL(/\/fr\/mediatheque\/albums\/kafele-nianame-2026-09$/)
  await expect(page.getByRole('heading', { level: 1, name: TITLE_FR })).toBeVisible()
  await expect(page.locator('main a[href*="/medias/file/"]')).toHaveCount(6)
  // Les vignettes sont décoratives (alt vide) : le texte alternatif validé est porté par le nom du lien.
  await expect(page.getByRole('link', { name: new RegExp(ALT_FR) })).toHaveCount(1)
})

test('version anglaise', async ({ page }) => {
  await page.goto('/en/actualites/kafele-nianame-rehabilitation')
  await expect(page.getByRole('heading', { level: 1, name: TITLE_EN })).toBeVisible()
  await page.getByRole('link', { name: 'See the event photos' }).click()
  await expect(page).toHaveURL(/\/en\/mediatheque\/albums\/kafele-nianame-2026-09$/)
  await expect(page.locator('main a[href*="/medias/file/"]')).toHaveCount(6)
  await page.goto('/en/mediatheque')
  await expect(page.getByRole('link', { name: new RegExp(TITLE_EN) })).toBeVisible()
})
