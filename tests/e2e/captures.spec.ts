import { test } from '@playwright/test'

const PAGES = ['/fr', '/fr/ong', '/fr/actualites', '/fr/actualites/tournoi-komo-kango-terre-davenir', '/fr/contact', '/fr/mediatheque', '/fr/adhesion', '/en']

test.use({ reducedMotion: 'reduce' })

for (const path of PAGES) {
  test(`capture ${path}`, async ({ page }, info) => {
    await page.goto(path)
    await page.screenshot({ path: `test-results/captures/${info.project.name}${path.replace(/\//g, '_')}.png`, fullPage: true })
  })
}
