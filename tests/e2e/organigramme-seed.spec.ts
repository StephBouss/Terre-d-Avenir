import { expect, test } from '@playwright/test'
import { adminToken, loginAdmin } from './admin-helpers'

const CLES = Array.from({ length: 10 }, (_, i) => `poste-${String(i + 1).padStart(2, '0')}`)

test.describe('organigramme : contenu de départ', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  test('les 10 postes du seed existent en brouillon et restent invisibles du public', async ({ request }) => {
    const headers = { Authorization: `JWT ${await adminToken(request)}` }
    const res = await request.get(`/api/postes?draft=true&depth=0&locale=fr&limit=50&where[cle][in]=${CLES.join(',')}`, { headers })
    expect(res.ok(), await res.text()).toBe(true)
    const docs = (await res.json()).docs as { cle: string; _status: string }[]
    expect(docs.map((d) => d.cle).sort()).toEqual(CLES)
    expect(docs.every((d) => d._status === 'draft')).toBe(true)
    const publics = (await (await request.get('/api/postes?limit=100&depth=0')).json()).docs as { cle?: string }[]
    expect(publics.some((d) => CLES.includes(d.cle ?? ''))).toBe(false)
  })

  test('aperçu : la Présidente, son intitulé et son portrait', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/api/apercu?path=/fr/organisation&secret=e2e-apercu')
    await expect(page.getByRole('status').getByText('Aperçu — non publié')).toBeVisible()
    const arbre = page.locator('[data-vue="arbre"]')
    await expect(arbre.getByText('Laurence Ndong')).toBeVisible()
    await expect(arbre.getByText('Présidente', { exact: true })).toBeVisible()
    await expect(page.locator('[data-vue="liste"] img[alt="Portrait de la Présidente"]')).toHaveCount(1)
    await page.getByRole('link', { name: 'Quitter l’aperçu' }).click()
  })
})
