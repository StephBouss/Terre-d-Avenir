import { expect, test, type Page } from '@playwright/test'
import { ALL_PATHS } from './helpers'

// Responsive : chaque page tient dans la largeur des petits écrans, sans défilement horizontal.
const PAGES = [...ALL_PATHS('fr'), '/fr/mediatheque/albums/kango', '/fr/mediatheque/albums/hommage-bacheliers-2026-08', '/fr/actualites/hommage-bacheliers-komo-kango-2026', '/en', '/en/organisation', '/en/adhesion']

async function debordement(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    if (document.documentElement.scrollWidth <= vw) return []
    // Éléments responsables, hors contenus volontairement rognés (galerie défilante, diaporama).
    return [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > vw + 1 && !el.closest('[aria-hidden="true"], .kango-galerie, .hero-slider'))
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`)
  })
}

test.describe('responsive', { tag: '@desktop' }, () => {
  for (const largeur of [320, 390, 768]) {
    test(`aucun débordement horizontal à ${largeur} px`, async ({ page }) => {
      test.setTimeout(240_000)
      await page.setViewportSize({ width: largeur, height: 800 })
      for (const chemin of PAGES) {
        await page.goto(chemin)
        expect(await debordement(page), `${chemin} à ${largeur} px`).toEqual([])
      }
    })
  }

  test('menu mobile : ouverture, liens, fermeture', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/fr')
    const bouton = page.locator('.mobile-menu-button')
    await expect(bouton).toBeVisible()
    await expect(page.locator('.desktop-navigation')).toBeHidden()
    await expect(bouton).toHaveAttribute('aria-expanded', 'false')
    await bouton.click()
    await expect(bouton).toHaveAttribute('aria-expanded', 'true')
    const menu = page.locator('#mobile-navigation')
    for (const nom of ['L’ONG', 'Organisation', 'Actualités', 'Contact']) await expect(menu.getByRole('link', { name: nom, exact: true })).toBeVisible()
    await menu.getByRole('link', { name: 'Organisation', exact: true }).click()
    await expect(page).toHaveURL(/\/fr\/organisation$/)
    await expect(bouton).toHaveAttribute('aria-expanded', 'false')
  })

  test('cibles tactiles : liens du pied de page et liens texte d’au moins 24 px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/fr')
    const hauteurs = await page.evaluate(() =>
      [...document.querySelectorAll('footer li a, main a.btn-arrow')]
        .filter((a) => a.getBoundingClientRect().width > 0)
        .map((a) => ({ texte: (a.textContent ?? '').trim().slice(0, 30), h: Math.round(a.getBoundingClientRect().height) })),
    )
    expect(hauteurs.length).toBeGreaterThan(10)
    expect(hauteurs.filter((x) => x.h < 24)).toEqual([])
  })

  test('formulaires : champs en 16 px au moins (pas de zoom forcé sur iPhone), bouton pleine largeur', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    for (const chemin of ['/fr/contact', '/fr/adhesion']) {
      await page.goto(chemin)
      const tailles = await page.locator('main form').first().evaluate((f) =>
        [...f.querySelectorAll('input:not([type="checkbox"]):not([type="hidden"]), textarea, select')].map((el) => parseFloat(getComputedStyle(el).fontSize)),
      )
      expect(tailles.length, chemin).toBeGreaterThan(2)
      expect(Math.min(...tailles), chemin).toBeGreaterThanOrEqual(16)
      const envoi = page.locator('main form button[type="submit"]')
      const [bouton, formulaire] = await Promise.all([envoi.boundingBox(), page.locator('main form').first().boundingBox()])
      expect(bouton!.width, chemin).toBeGreaterThan(formulaire!.width * 0.8)
    }
  })
})
