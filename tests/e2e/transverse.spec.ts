import { expect, test } from '@playwright/test'
import { ALL_PATHS } from './helpers'

test.describe('toutes les pages', () => {
  for (const locale of ['fr', 'en'] as const) {
    test(`répondent en 200 avec lang, canonique et hreflang (${locale})`, async ({ page }) => {
      for (const path of ALL_PATHS(locale)) {
        const res = await page.goto(path)
        expect(res?.status(), path).toBe(200)
        await expect(page.locator('html'), path).toHaveAttribute('lang', locale)
        await expect(page.locator('h1'), path).toHaveCount(1)
        await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute('href', new RegExp(`${path}$`))
        await expect(page.locator('link[rel="alternate"][hreflang="en"]'), path).toHaveCount(1)
      }
    })
  }

  test('aucun lien interne de l’en-tête ou du pied de page ne mène à une 404', async ({ page, request }) => {
    for (const locale of ['fr', 'en']) {
      await page.goto(`/${locale}`)
      const hrefs = await page
        .locator('header a[href^="/"], footer a[href^="/"]')
        .evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('href')!))])
      for (const href of hrefs) {
        const res = await request.get(href)
        expect(res.status(), href).toBe(200)
      }
    }
  })

  test('le sélecteur de langue garde la page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'sélecteur dans le menu mobile, couvert par le test unitaire')
    await page.goto('/fr/actualites/un-jeune-un-permis')
    await page.getByRole('link', { name: 'English' }).first().click()
    await expect(page).toHaveURL(/\/en\/actualites\/un-jeune-un-permis$/)
  })

  test('redirections et langue non publiée', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/fr$/)
    await page.goto('/contact')
    await expect(page).toHaveURL(/\/fr\/contact$/)
    await page.goto('/es')
    await expect(page.getByText('Cette version linguistique n’est pas encore publiée.', { exact: false })).toBeVisible()
  })

  test('404 : URL inconnue, statut 404 et corps localisé rendu côté serveur', async ({ request }) => {
    for (const [path, titre] of [
      ['/fr/page-inexistante', 'Page introuvable'],
      ['/en/page-inexistante', 'Page not found'],
    ]) {
      const res = await request.get(path)
      expect(res.status(), path).toBe(404)
      expect(await res.text(), path).toContain(titre)
    }
  })

  test('404 : slug inconnu, statut 404 (corps rendu côté client, limite connue de Next)', async ({ page, request }) => {
    for (const path of ['/fr/actualites/inexistant', '/fr/projets/inexistant']) {
      expect((await request.get(path)).status(), path).toBe(404)
    }
    await page.goto('/fr/projets/inexistant')
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  })
})

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('le contenu animé reste visible', async ({ page }) => {
    await page.goto('/fr')
    const reveal = page.locator('[data-reveal]').first()
    await expect(reveal).toBeVisible()
    expect(await reveal.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })
})

test.describe('mouvement réduit', () => {
  test.use({ reducedMotion: 'reduce' })
  test('le contenu est affiché sans transition', async ({ page }) => {
    await page.goto('/fr/projets')
    const card = page.locator('[data-reveal-group] > *').first()
    expect(await card.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    expect(await card.evaluate((el) => getComputedStyle(el).transitionDuration)).toMatch(/^0s/)
  })
})

test('animations : apparition au défilement et en-tête compact', async ({ page, isMobile }) => {
  test.skip(isMobile, 'vérifié en desktop')
  await page.goto('/fr')
  const lastGroup = page.locator('[data-reveal-group]').last()
  await expect(lastGroup).not.toHaveClass(/is-visible/)
  await lastGroup.scrollIntoViewIfNeeded()
  await expect(lastGroup).toHaveClass(/is-visible/)
  await expect(page.locator('header.site-header')).toHaveClass(/is-compact/)
})
