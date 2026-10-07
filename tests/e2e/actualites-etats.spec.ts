import { expect, test } from '@playwright/test'
import { adminToken, purgeActualites } from './admin-helpers'

const DRAFT = { slug: 'e2e-brouillon', title: 'E2E brouillon invisible' }
const ARCHIVED = { slug: 'e2e-archivee', title: 'E2E archivée invisible' }

test.describe.configure({ mode: 'serial' })

test.describe('états des actualités', () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''
  const ids: (string | number)[] = []

  test.beforeAll(async ({ request, isMobile }) => {
    if (isMobile) return // les hooks tournent aussi sur le projet mobile : éviter les doublons de slug
    token = await adminToken(request)
    await purgeActualites(request, token, [DRAFT.slug, ARCHIVED.slug])
    const headers = { Authorization: `JWT ${token}` }
    const draft = await request.post('/api/actualites?draft=true&locale=fr', {
      headers,
      data: { ...DRAFT, order: 99, _status: 'draft' },
    })
    expect(draft.ok(), await draft.text()).toBe(true)
    ids.push((await draft.json()).doc.id)
    const archived = await request.post('/api/actualites?locale=fr', {
      headers,
      data: { ...ARCHIVED, order: 98, _status: 'published', archivee: true },
    })
    expect(archived.ok(), await archived.text()).toBe(true)
    ids.push((await archived.json()).doc.id)
  })

  test.afterAll(async ({ request, isMobile }) => {
    if (isMobile) return
    for (const id of ids) await request.delete(`/api/actualites/${id}`, { headers: { Authorization: `JWT ${token}` } })
  })

  test('absentes de la liste, de l’accueil et du plan du site', async ({ page, request }) => {
    for (const path of ['/fr/actualites', '/fr']) {
      await page.goto(path)
      await expect(page.getByText(DRAFT.title)).toHaveCount(0)
      await expect(page.getByText(ARCHIVED.title)).toHaveCount(0)
    }
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).not.toContain(DRAFT.slug)
    expect(sitemap).not.toContain(ARCHIVED.slug)
  })

  test('URL publique en 404', async ({ request }) => {
    expect((await request.get(`/fr/actualites/${DRAFT.slug}`)).status()).toBe(404)
    expect((await request.get(`/fr/actualites/${ARCHIVED.slug}`)).status()).toBe(404)
  })

  test('absentes de l’API publique', async ({ request }) => {
    const docs: { slug: string }[] = (await (await request.get('/api/actualites?limit=100')).json()).docs
    expect(docs.map((d) => d.slug)).not.toContain(DRAFT.slug)
    expect(docs.map((d) => d.slug)).not.toContain(ARCHIVED.slug)
  })
})
