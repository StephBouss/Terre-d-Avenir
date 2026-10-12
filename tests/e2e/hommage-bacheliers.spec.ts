import { expect, test } from '@playwright/test'

const TITLE_FR = 'Hommage aux nouveaux bacheliers du Komo-Kango'
const TITLE_EN = 'Honouring Komo-Kango’s new baccalaureate graduates'
const ALT_FR = 'Quatre bacheliers distingués posent avec leur ordinateur portable'

test('actualité FR (4e de la liste), avec bouton vers l’album de 11 photos', async ({ page }) => {
  await page.goto('/fr/actualites')
  await expect(page.locator('article').filter({ hasNotText: 'E2E' }).nth(3).getByRole('heading', { level: 3, name: TITLE_FR })).toBeVisible()
  await page.goto('/fr/actualites/hommage-bacheliers-komo-kango-2026')
  await expect(page.getByRole('heading', { level: 1, name: TITLE_FR })).toBeVisible()
  await expect(page.getByText('« Komo-Kango : Un jeune, un permis »', { exact: false })).toBeVisible()
  await page.getByRole('link', { name: 'Voir les photos de l’événement' }).click()
  await expect(page).toHaveURL(/\/fr\/mediatheque\/albums\/hommage-bacheliers-2026-08$/)
  await expect(page.getByRole('heading', { level: 1, name: TITLE_FR })).toBeVisible()
  await expect(page.locator('main a[href*="/medias/file/"]')).toHaveCount(11)
  await expect(page.getByRole('link', { name: new RegExp(ALT_FR) })).toHaveCount(1)
})

test('version anglaise', async ({ page }) => {
  await page.goto('/en/actualites/hommage-bacheliers-komo-kango-2026')
  await expect(page.getByRole('heading', { level: 1, name: TITLE_EN })).toBeVisible()
  await page.getByRole('link', { name: 'See the event photos' }).click()
  await expect(page).toHaveURL(/\/en\/mediatheque\/albums\/hommage-bacheliers-2026-08$/)
  await expect(page.locator('main a[href*="/medias/file/"]')).toHaveCount(11)
})
