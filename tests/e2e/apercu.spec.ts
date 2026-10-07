import { expect, test } from '@playwright/test'
import { adminToken, loginAdmin, purgeActualites } from './admin-helpers'

const DRAFT = { slug: 'e2e-apercu', title: 'E2E aperçu brouillon' }

test.describe.configure({ mode: 'serial' })

test.describe('aperçu des brouillons', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop uniquement')
  let token = ''
  let id: string | number = ''

  test.beforeAll(async ({ request, isMobile }) => {
    if (isMobile) return // les hooks tournent aussi sur le projet mobile : éviter les doublons de slug
    token = await adminToken(request)
    await purgeActualites(request, token, [DRAFT.slug])
    const res = await request.post('/api/actualites?draft=true&locale=fr', {
      headers: { Authorization: `JWT ${token}` },
      data: { ...DRAFT, order: 97, _status: 'draft' },
    })
    expect(res.ok()).toBe(true)
    id = (await res.json()).doc.id
  })

  test.afterAll(async ({ request, isMobile }) => {
    if (isMobile) return
    await request.delete(`/api/actualites/${id}`, { headers: { Authorization: `JWT ${token}` } })
  })

  test('refusé sans connexion ou avec un mauvais secret', async ({ request }) => {
    expect((await request.get(`/api/apercu?path=/fr/actualites/${DRAFT.slug}&secret=e2e-apercu`)).status()).toBe(401)
    expect((await request.get(`/api/apercu?path=https://evil.com&secret=e2e-apercu`)).status()).toBe(401)
  })

  test('un admin connecté voit le brouillon avec le bandeau, puis quitte l’aperçu', async ({ page }) => {
    await loginAdmin(page)
    await page.goto(`/api/apercu?path=/fr/actualites/${DRAFT.slug}&secret=e2e-apercu`)
    await expect(page.getByRole('heading', { name: DRAFT.title })).toBeVisible()
    await expect(page.getByRole('status').getByText('Aperçu — non publié')).toBeVisible()
    await page.getByRole('link', { name: 'Quitter l’aperçu' }).click()
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  })
})
