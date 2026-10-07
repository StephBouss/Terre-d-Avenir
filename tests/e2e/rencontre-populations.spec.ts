import { expect, test } from '@playwright/test'

const TITLE_FR = 'Au plus près des Kangolaises et des Kangolais'
const TITLE_EN = 'Close to the people of Kango'
const ALT_FR = 'Une accolade chaleureuse entre deux participantes'

test('actualité FR, avec bouton vers l’album de 5 photos', async ({ page }) => {
  await page.goto('/fr/actualites')
  await expect(page.locator('article').nth(2).getByRole('heading', { level: 3, name: TITLE_FR })).toBeVisible()
  await page.goto('/fr/actualites/rencontre-populations-komo-kango')
  await expect(page.getByRole('heading', { level: 1, name: TITLE_FR })).toBeVisible()
  await expect(page.getByText('« Maman Lolo »')).toBeVisible()
  await page.getByRole('link', { name: 'Voir les photos de l’événement' }).click()
  await expect(page).toHaveURL(/\/fr\/mediatheque\/albums\/rencontre-populations-2026-08$/)
  await expect(page.getByRole('heading', { level: 1, name: TITLE_FR })).toBeVisible()
  await expect(page.locator('main a[href*="/medias/file/"]')).toHaveCount(5)
  await expect(page.getByRole('link', { name: new RegExp(ALT_FR) })).toHaveCount(1)
})

test('version anglaise', async ({ page }) => {
  await page.goto('/en/actualites/rencontre-populations-komo-kango')
  await expect(page.getByRole('heading', { level: 1, name: TITLE_EN })).toBeVisible()
  await page.getByRole('link', { name: 'See the event photos' }).click()
  await expect(page).toHaveURL(/\/en\/mediatheque\/albums\/rencontre-populations-2026-08$/)
  await expect(page.locator('main a[href*="/medias/file/"]')).toHaveCount(5)
  await page.goto('/en/mediatheque')
  await expect(page.getByRole('link', { name: new RegExp(TITLE_EN) })).toBeVisible()
})
