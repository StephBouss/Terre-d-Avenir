import { expect, test } from '@playwright/test'

const PAGES = [
  { path: '/fr/partenariats', h1: 'Construire des coopérations utiles', must: 'Presse et information' },
  { path: '/fr/transparence', h1: 'Comprendre notre démarche', must: 'Aucun document public n’est disponible' },
  { path: '/fr/confidentialite', h1: 'Informations sur vos données personnelles', must: 'Liens externes' },
  { path: '/fr/mentions-legales', h1: 'Mentions légales', must: 'Terre d’Avenir KOMO-KANGO, ONG.' },
  { path: '/en/partenariats', h1: 'Building useful partnerships', must: 'Press and information' },
]

for (const { path, h1, must } of PAGES) {
  test(`page ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1)
    await expect(page.getByText(must, { exact: false }).first()).toBeVisible()
    await expect(page.getByText(/\[[^\]]+\]/)).toHaveCount(0)
    await expect(page.getByText('Stéphane')).toHaveCount(0)
  })
}
