import { expect, test } from '@playwright/test'

// L'image d'en-tête vient du champ propre à chaque page (seed : photos réelles des albums, 2026-10-08).
const EXPECTED: [string, RegExp][] = [
  ['/fr/ong', /kafele-nianame-4-photo/],
  ['/fr/organisation', /rencontre-populations-2026-08-1-photo/],
  ['/fr/projets', /kafele-nianame-6-photo/],
  ['/fr/adhesion', /hommage-bacheliers-2026-08-7-photo/],
  ['/fr/mediatheque', /tournoi-football-2026-08-3-photo/],
  ['/fr/contact', /rencontre-populations-2026-08-2-photo/],
  ['/fr/actualites', /hommage-bacheliers-2026-08-3-photo/],
  ['/fr/mot-de-la-presidente', /hommage-bacheliers-2026-08-9-photo/],
  ['/fr/partenariats', /kafele-nianame-3-photo/],
  ['/fr/transparence', /kafele-nianame-2-photo/],
]

for (const [path, image] of EXPECTED) {
  test(`en-tête de ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('main img').first()).toHaveAttribute('src', image)
  })
}

test('page L’ONG : photo à côté du texte « Notre ancrage », en FR et en EN', async ({ page }) => {
  for (const lg of ['fr', 'en']) {
    await page.goto(`/${lg}/ong`)
    const photo = page.locator('[data-section-image] img')
    await expect(photo).toHaveCount(1)
    await expect(photo).toHaveAttribute('src', /rencontre-populations-2026-08-3-photo/)
    await expect(photo).not.toHaveAttribute('alt', '')
  }
})

test('l’admin propose « Image d’en-tête » sur une page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'admin desktop')
  const { loginAdmin } = await import('./admin-helpers')
  await loginAdmin(page)
  await page.goto('/admin/collections/pages')
  await page.getByRole('link', { name: 'contact' }).first().click()
  await expect(page.getByText('Image d’en-tête')).toBeVisible()
})
