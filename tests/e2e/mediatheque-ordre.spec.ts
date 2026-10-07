import { expect, test } from '@playwright/test'
import { adminToken } from './admin-helpers'

test.describe.configure({ mode: 'serial' })

test.describe('ordre de la médiathèque', () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''
  const ids: (number | string)[] = []

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    const headers = { Authorization: `JWT ${token}` }
    // Deux photos existantes du seed passent en médiathèque avec un ordre explicite.
    const list = (await (await request.get('/api/medias?limit=100', { headers })).json()).docs as { id: number; filename: string }[]
    const youth = list.find((m) => /^youth(-\d+)?\.jpg$/.test(m.filename))!
    const sport = list.find((m) => /^sport(-\d+)?\.jpg$/.test(m.filename))!
    for (const [doc, ordre] of [[sport, 1], [youth, 2]] as const) {
      const res = await request.patch(`/api/medias/${doc.id}`, { headers, data: { galerie: true, ordre } })
      expect(res.ok()).toBe(true)
      ids.push(doc.id)
    }
  })

  test.afterAll(async ({ request }) => {
    for (const id of ids) await request.patch(`/api/medias/${id}`, { headers: { Authorization: `JWT ${token}` }, data: { galerie: false, ordre: 0 } })
  })

  test('les photos suivent l’ordre d’affichage', async ({ page }) => {
    await page.goto('/fr/mediatheque')
    const hrefs = await page.locator('main a[href*="/medias/file/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))
    const iSport = hrefs.findIndex((h) => h.includes('sport'))
    const iYouth = hrefs.findIndex((h) => h.includes('youth'))
    expect(iSport).toBeGreaterThanOrEqual(0)
    expect(iSport).toBeLessThan(iYouth)
  })
})
