import { expect, test } from '@playwright/test'
import { adminToken } from './admin-helpers'

test.describe.configure({ mode: 'serial' })

test.describe('albums', () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''
  const created: { collection: string; id: number | string }[] = []

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    const headers = { Authorization: `JWT ${token}` }
    const medias = (await (await request.get('/api/medias?limit=100', { headers })).json()).docs as { id: number; filename: string }[]
    const pick = (name: string) => medias.find((m) => m.filename.startsWith(name) && m.filename.endsWith('.jpg'))!.id
    const album = await request.post('/api/albums?locale=fr', {
      headers,
      data: { slug: 'e2e-album', order: 99, title: 'E2E album', dateLabel: '1er janvier 2026', description: 'Album de test', cover: pick('forest'), photos: [pick('forest'), pick('youth')], _status: 'published' },
    })
    expect(album.ok()).toBe(true)
    const albumId = (await album.json()).doc.id
    created.push({ collection: 'albums', id: albumId })
    const actu = await request.post('/api/actualites?locale=fr', {
      headers,
      data: { slug: 'e2e-actu-album', order: 96, title: 'E2E actualité avec album', album: albumId, _status: 'published' },
    })
    expect(actu.ok()).toBe(true)
    created.push({ collection: 'actualites', id: (await actu.json()).doc.id })
  })

  test.afterAll(async ({ request }) => {
    for (const { collection, id } of created.reverse()) await request.delete(`/api/${collection}/${id}`, { headers: { Authorization: `JWT ${token}` } })
  })

  test('la médiathèque liste l’album et sa page affiche ses photos', async ({ page }) => {
    await expect(async () => {
      await page.goto('/fr/mediatheque')
      await expect(page.getByRole('link', { name: /E2E album/ })).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 20_000 })
    await page.getByRole('link', { name: /E2E album/ }).click()
    await expect(page).toHaveURL(/\/fr\/mediatheque\/albums\/e2e-album$/)
    await expect(page.getByRole('heading', { level: 1, name: 'E2E album' })).toBeVisible()
    await expect(page.locator('main a[href*="/medias/file/"]')).toHaveCount(2)
  })

  test('l’actualité liée mène à l’album', async ({ page }) => {
    const link = page.getByRole('link', { name: 'Voir les photos de l’événement' })
    await expect(async () => {
      await page.goto('/fr/actualites/e2e-actu-album')
      await expect(link).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 20_000 })
    await link.click()
    await expect(page).toHaveURL(/\/fr\/mediatheque\/albums\/e2e-album$/)
  })

  test('album inconnu : 404 ; plan du site : album présent', async ({ request }) => {
    expect((await request.get('/fr/mediatheque/albums/inexistant')).status()).toBe(404)
    await expect.poll(async () => (await (await request.get('/sitemap.xml')).text()).includes('/mediatheque/albums/e2e-album'), { timeout: 20_000 }).toBe(true)
  })
})
