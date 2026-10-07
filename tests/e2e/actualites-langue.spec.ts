import { expect, test } from '@playwright/test'
import { adminToken, purgeActualites } from './admin-helpers'

const FR_ONLY = { slug: 'e2e-actu-fr-seul', title: 'E2E actualité français seul' }

test.describe.configure({ mode: 'serial' })

test.describe('actualité sans titre anglais', { tag: '@desktop' }, () => {
  let token = ''
  let id: string | number = ''

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    await purgeActualites(request, token, [FR_ONLY.slug])
    const res = await request.post('/api/actualites?locale=fr', {
      headers: { Authorization: `JWT ${token}` },
      data: { ...FR_ONLY, order: 94, _status: 'published' },
    })
    expect(res.ok(), await res.text()).toBe(true)
    id = (await res.json()).doc.id
  })

  test.afterAll(async ({ request }) => {
    await request.delete(`/api/actualites/${id}`, { headers: { Authorization: `JWT ${token}` } })
  })

  test('visible en français : liste, accueil et page', async ({ page }) => {
    await expect(async () => {
      await page.goto('/fr/actualites')
      await expect(page.getByText(FR_ONLY.title).first()).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 20_000 })
    await page.goto(`/fr/actualites/${FR_ONLY.slug}`)
    await expect(page.getByRole('heading', { level: 1, name: FR_ONLY.title })).toBeVisible()
  })

  test('absente de /en/actualites, de l’accueil anglais, 404 sur sa page anglaise', async ({ page, request }) => {
    for (const path of ['/en/actualites', '/en']) {
      await page.goto(path)
      await expect(page.getByText(FR_ONLY.title)).toHaveCount(0)
      await expect(page.locator(`a[href$="/actualites/${FR_ONLY.slug}"]`)).toHaveCount(0)
    }
    expect((await request.get(`/en/actualites/${FR_ONLY.slug}`)).status()).toBe(404)
  })

  test('plan du site : URL française seulement', async ({ request }) => {
    await expect.poll(async () => (await (await request.get('/sitemap.xml')).text()).includes(`/fr/actualites/${FR_ONLY.slug}`), { timeout: 20_000 }).toBe(true)
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).not.toContain(`/en/actualites/${FR_ONLY.slug}`)
  })
})
