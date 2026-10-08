import { expect, test } from '@playwright/test'

test('médiathèque : les albums d’événements du plus récent au plus ancien, puis Kango', async ({ page }) => {
  await page.goto('/fr/mediatheque')
  // Les albums « e2e-… » sont créés par d’autres specs en parallèle : on ne garde que ceux du seed.
  const hrefs = await page.locator('main a[href*="/mediatheque/albums/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))
  const seeded = hrefs.filter((h) => !/\/albums\/e2e-/.test(h)).map((h) => h.replace(/^.*\/albums\//, ''))
  expect([...new Set(seeded)]).toEqual(['kafele-nianame-2026-09', 'tournoi-football-2026-08', 'rencontre-populations-2026-08', 'hommage-bacheliers-2026-08', 'kango'])
})
