import { expect, test } from '@playwright/test'
import { adminToken } from './admin-helpers'

const CLES = Array.from({ length: 10 }, (_, i) => `poste-${String(i + 1).padStart(2, '0')}`)

// Les postes de départ sont publiés depuis le 2026-10-08 (demande « affiche moi l’organigramme »).
test.describe('organigramme : contenu de départ', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  test('les 10 postes du seed sont publiés et visibles du public', async ({ request }) => {
    const headers = { Authorization: `JWT ${await adminToken(request)}` }
    const res = await request.get(`/api/postes?draft=true&depth=0&locale=fr&limit=50&where[cle][in]=${CLES.join(',')}`, { headers })
    expect(res.ok(), await res.text()).toBe(true)
    const docs = (await res.json()).docs as { cle: string; _status: string }[]
    expect(docs.map((d) => d.cle).sort()).toEqual(CLES)
    expect(docs.every((d) => d._status === 'published')).toBe(true)
  })

  test('page publique : la Présidente, son intitulé et son portrait, en FR et en EN', async ({ page }) => {
    await page.goto('/fr/organisation')
    const arbre = page.locator('[data-vue="arbre"]')
    await expect(arbre.getByText('Laurence Ndong')).toBeVisible()
    await expect(arbre.getByText('Présidente', { exact: true })).toBeVisible()
    await expect(page.locator('[data-vue="liste"] img[alt="Portrait de la Présidente"]')).toHaveCount(1)
    // Au moins les 10 postes du seed (la spec organigramme peut publier des postes « e2e- » en parallèle).
    expect(await page.locator('[data-vue="liste"] [data-poste]').count()).toBeGreaterThanOrEqual(10)
    await page.goto('/en/organisation')
    await expect(page.locator('[data-vue="arbre"]').getByText('President', { exact: true })).toBeVisible()
  })
})
