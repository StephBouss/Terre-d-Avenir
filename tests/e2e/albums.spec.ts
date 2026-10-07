import { expect, test, type APIRequestContext } from '@playwright/test'
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

// PNG 1×1 valide : suffisant pour créer une photo de test.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAHbN4NAAAAABJRU5ErkJggg==', 'base64')

test.describe('visibilité des albums', () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  test.describe.configure({ mode: 'serial' })
  let headers: { Authorization: string }
  const created: { collection: string; id: number | string }[] = []

  async function purge(request: APIRequestContext) {
    for (const [collection, field, value] of [
      ['actualites', 'slug', 'e2e-actu-brouillon'],
      ['albums', 'slug', 'e2e-album-brouillon'],
      ['albums', 'slug', 'e2e-album-fr-seul'],
      ['medias', 'filename', 'e2e-album-photo'],
    ] as const) {
      const res = await request.get(`/api/${collection}?draft=true&limit=10&where[${field}][like]=${value}`, { headers })
      for (const d of (await res.json()).docs as { id: number }[]) await request.delete(`/api/${collection}/${d.id}`, { headers })
    }
  }

  test.beforeAll(async ({ request }) => {
    headers = { Authorization: `JWT ${await adminToken(request)}` }
    await purge(request)
    const media = await request.post('/api/medias?locale=fr', {
      headers,
      multipart: { _payload: JSON.stringify({ alt: 'Photo de test', galerie: false }), file: { name: 'e2e-album-photo.png', mimeType: 'image/png', buffer: PNG } },
    })
    expect(media.ok(), await media.text()).toBe(true)
    const photo = (await media.json()).doc.id as number
    created.push({ collection: 'medias', id: photo })
    const draft = await request.post('/api/albums?locale=fr', {
      headers,
      data: { slug: 'e2e-album-brouillon', order: 98, title: 'E2E album brouillon', photos: [photo], _status: 'draft' },
    })
    expect(draft.ok(), await draft.text()).toBe(true)
    const draftId = (await draft.json()).doc.id
    created.push({ collection: 'albums', id: draftId })
    const frOnly = await request.post('/api/albums?locale=fr', {
      headers,
      data: { slug: 'e2e-album-fr-seul', order: 97, title: 'E2E album français seul', photos: [photo], _status: 'published' },
    })
    expect(frOnly.ok(), await frOnly.text()).toBe(true)
    created.push({ collection: 'albums', id: (await frOnly.json()).doc.id })
    const actu = await request.post('/api/actualites?locale=fr', {
      headers,
      data: { slug: 'e2e-actu-brouillon', order: 95, title: 'E2E actualité album brouillon', album: draftId, _status: 'published' },
    })
    expect(actu.ok(), await actu.text()).toBe(true)
    created.push({ collection: 'actualites', id: (await actu.json()).doc.id })
  })

  test.afterAll(async ({ request }) => {
    for (const { collection, id } of created.reverse()) await request.delete(`/api/${collection}/${id}`, { headers })
  })

  test('un album en brouillon est invisible partout', async ({ page, request }) => {
    // L'album publié « français seul » sert de témoin : quand il apparaît, la page est à jour.
    await expect(async () => {
      await page.goto('/fr/mediatheque')
      await expect(page.getByRole('link', { name: /E2E album français seul/ })).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 20_000 })
    await expect(page.getByRole('link', { name: /E2E album brouillon/ })).toHaveCount(0)
    await expect.poll(async () => (await (await request.get('/sitemap.xml')).text()).includes('/mediatheque/albums/e2e-album-fr-seul'), { timeout: 20_000 }).toBe(true)
    expect(await (await request.get('/sitemap.xml')).text()).not.toContain('e2e-album-brouillon')
    const api = await (await request.get('/api/albums?limit=100')).json()
    expect((api.docs as { slug: string }[]).map((d) => d.slug)).not.toContain('e2e-album-brouillon')
    expect((await request.get('/fr/mediatheque/albums/e2e-album-brouillon')).status()).toBe(404)
  })

  test('l’actualité n’affiche pas de bouton vers un album en brouillon', async ({ page }) => {
    await expect(async () => {
      await page.goto('/fr/actualites/e2e-actu-brouillon')
      await expect(page.getByRole('heading', { level: 1, name: 'E2E actualité album brouillon' })).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 20_000 })
    await expect(page.getByRole('link', { name: 'Voir les photos de l’événement' })).toHaveCount(0)
  })

  test('une photo hors médiathèque apparaît dans son album, pas dans les photos isolées', async ({ page }) => {
    await expect(async () => {
      await page.goto('/fr/mediatheque/albums/e2e-album-fr-seul')
      await expect(page.locator('main a[href*="e2e-album-photo"]')).toHaveCount(1, { timeout: 1000 })
    }).toPass({ timeout: 20_000 })
    await page.goto('/fr/mediatheque')
    await expect(page.locator('main a[href*="e2e-album-photo"]')).toHaveCount(0)
  })

  test('un album sans titre anglais est masqué en anglais', async ({ page, request }) => {
    await page.goto('/en/mediatheque')
    await expect(page.getByRole('link', { name: /E2E album/ })).toHaveCount(0)
    expect((await request.get('/en/mediatheque/albums/e2e-album-fr-seul')).status()).toBe(404)
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/fr/mediatheque/albums/e2e-album-fr-seul')
    expect(sitemap).not.toContain('/en/mediatheque/albums/e2e-album-fr-seul')
  })
})
