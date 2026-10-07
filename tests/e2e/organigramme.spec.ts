import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { adminToken, loginAdmin } from './admin-helpers'
import { creerPoste, purgerPostes, type Entetes } from './postes-helpers'

const PREFIXE = 'e2e-org-'
const BROUILLON = 'E2E poste brouillon'

test.describe.configure({ mode: 'serial' })

// Seule spec qui publie des postes : elle peut affirmer l’état exact de la page (le seed ne crée que des brouillons).
test.describe('organigramme public', { tag: '@desktop' }, () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let headers: Entetes
  const ids = { racine: 0, premier: 0, second: 0, sousPoste: 0 }

  test.beforeAll(async ({ request }) => {
    headers = { Authorization: `JWT ${await adminToken(request)}` }
    await purgerPostes(request, headers, PREFIXE)
  })
  test.afterAll(async ({ request }) => {
    await purgerPostes(request, headers, PREFIXE)
  })

  test('aucun poste publié : message « en cours de validation » ; brouillon invisible partout', async ({ page, request }) => {
    // L’écriture déclenche aussi la revalidation : la page pré-rendue au build (base de dev) est remplacée.
    await creerPoste(request, headers, { cle: `${PREFIXE}brouillon`, intitule: BROUILLON, ordre: 0 }, 'draft')
    await expect(async () => {
      await page.goto('/fr/organisation')
      await expect(page.getByText('Organigramme en cours de validation.')).toBeVisible({ timeout: 2_000 })
    }).toPass({ timeout: 20_000 })
    await expect(page.getByText(BROUILLON)).toHaveCount(0)
    await page.goto('/en/organisation')
    await expect(page.getByText('Organisation chart being finalised.')).toBeVisible()
    const publics: { intitule?: string }[] = (await (await request.get('/api/postes?limit=100')).json()).docs
    expect(publics.map((d) => d.intitule)).not.toContain(BROUILLON)
    expect(await (await request.get('/sitemap.xml')).text()).not.toContain(PREFIXE)
  })

  test('postes publiés : arbre et liste avec les mêmes rattachements, dans le même ordre', async ({ page, request }) => {
    ids.racine = await creerPoste(request, headers, { cle: `${PREFIXE}racine`, intitule: 'E2E Présidence', personneNom: 'E2E Personne A', mission: 'E2E mission de la racine', ordre: 0 }, 'published')
    ids.second = await creerPoste(request, headers, { cle: `${PREFIXE}second`, intitule: 'E2E Second poste', parent: ids.racine, ordre: 2 }, 'published')
    ids.premier = await creerPoste(request, headers, { cle: `${PREFIXE}premier`, intitule: 'E2E Premier poste', parent: ids.racine, ordre: 1 }, 'published')
    ids.sousPoste = await creerPoste(request, headers, { cle: `${PREFIXE}sous-poste`, intitule: 'E2E Sous-poste', parent: ids.second, ordre: 0 }, 'published')
    await expect(async () => {
      await page.goto('/fr/organisation')
      await expect(page.locator('[data-vue="liste"]').getByText('E2E Sous-poste')).toHaveCount(1, { timeout: 2_000 })
    }).toPass({ timeout: 20_000 })
    const lire = (vue: string) =>
      page.locator(`[data-vue="${vue}"] [data-poste]`).evaluateAll((els) => els.map((e) => `${e.getAttribute('data-poste')}<${e.getAttribute('data-parent')}`))
    const liste = await lire('liste')
    expect(liste).toEqual([`${ids.racine}<`, `${ids.premier}<${ids.racine}`, `${ids.second}<${ids.racine}`, `${ids.sousPoste}<${ids.second}`])
    expect(await lire('arbre')).toEqual(liste)
    await expect(page.locator('[data-vue="arbre"]')).toBeVisible()
    await expect(page.locator('[data-vue="arbre"]')).toHaveAttribute('aria-hidden', 'true')
    await expect(page.getByRole('list', { name: 'Organigramme : liste des postes' })).toBeAttached()
    await expect(page.getByRole('heading', { level: 3, name: 'E2E Premier poste' })).toBeAttached()
    await expect(page.getByText(BROUILLON)).toHaveCount(0)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
  })

  test('clavier : aucun arrêt dans le schéma décoratif', async ({ page }) => {
    await page.goto('/fr/organisation')
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-vue="arbre"]')))).toBe(false)
    }
  })

  test('mobile : la liste remplace l’arbre', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/fr/organisation')
    await expect(page.locator('[data-vue="liste"]')).toBeVisible()
    await expect(page.locator('[data-vue="arbre"]')).toBeHidden()
    await expect(page.locator('[data-vue="liste"]').getByText('E2E mission de la racine')).toBeVisible()
  })

  test('aperçu : un admin voit les brouillons avec le bandeau, puis quitte l’aperçu', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/api/apercu?path=/fr/organisation&secret=e2e-apercu')
    await expect(page.getByRole('status').getByText('Aperçu — non publié')).toBeVisible()
    await expect(page.locator('[data-vue="arbre"]').getByText(BROUILLON)).toBeVisible()
    // Les brouillons ne doivent pas être indexés.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await page.getByRole('link', { name: 'Quitter l’aperçu' }).click()
    await expect(async () => {
      await page.goto('/fr/organisation')
      await expect(page.getByText(BROUILLON)).toHaveCount(0, { timeout: 2_000 })
      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0)
    }).toPass({ timeout: 20_000 })
  })
})
