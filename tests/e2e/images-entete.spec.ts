import { expect, test } from '@playwright/test'

// L'image d'en-tête vient du champ propre à chaque page (seed : correspondance du lot 1 conservée).
const EXPECTED: [string, RegExp][] = [
  ['/fr/ong', /community/],
  ['/fr/organisation', /solidarity/],
  ['/fr/projets', /education/],
  ['/fr/adhesion', /youth/],
  ['/fr/mediatheque', /sport/],
  ['/fr/contact', /forest/],
  ['/fr/actualites', /forest/],
  ['/fr/mot-de-la-presidente', /forest/],
  ['/fr/partenariats', /solidarity/],
  ['/fr/transparence', /community/],
]

for (const [path, image] of EXPECTED) {
  test(`en-tête de ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('main img').first()).toHaveAttribute('src', image)
  })
}

test('l’admin propose « Image d’en-tête » sur une page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'admin desktop')
  const { loginAdmin } = await import('./admin-helpers')
  await loginAdmin(page)
  await page.goto('/admin/collections/pages')
  await page.getByRole('link', { name: 'contact' }).first().click()
  await expect(page.getByText('Image d’en-tête')).toBeVisible()
})
