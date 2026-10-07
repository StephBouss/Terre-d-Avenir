import { expect, test } from '@playwright/test'
import { adminToken, loginAdmin, purgeActualites } from './admin-helpers'

const DRAFT = { slug: 'e2e-apercu', title: 'E2E aperçu brouillon' }

test.describe.configure({ mode: 'serial' })

test.describe('aperçu des brouillons', { tag: '@desktop' }, () => {
  test.skip(({ isMobile }) => isMobile, 'desktop uniquement')
  let token = ''
  let id: string | number = ''

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    await purgeActualites(request, token, [DRAFT.slug])
    const res = await request.post('/api/actualites?draft=true&locale=fr', {
      headers: { Authorization: `JWT ${token}` },
      data: { ...DRAFT, order: 97, _status: 'draft' },
    })
    expect(res.ok()).toBe(true)
    id = (await res.json()).doc.id
  })

  test.afterAll(async ({ request }) => {
    await request.delete(`/api/actualites/${id}`, { headers: { Authorization: `JWT ${token}` } })
  })

  test('refusé sans connexion, même avec le bon secret, ou pour un chemin externe', async ({ request }) => {
    expect((await request.get(`/api/apercu?path=/fr/actualites/${DRAFT.slug}&secret=e2e-apercu`)).status()).toBe(401)
    expect((await request.get(`/api/apercu?path=https://evil.com&secret=e2e-apercu`)).status()).toBe(401)
  })

  test('refusé à un admin connecté avec un mauvais secret', async ({ page }) => {
    await loginAdmin(page)
    const res = await page.request.get(`/api/apercu?path=/fr/actualites/${DRAFT.slug}&secret=faux`, { maxRedirects: 0 })
    expect(res.status()).toBe(401)
  })

  test('après déconnexion, le cookie d’aperçu ne montre plus le brouillon', async ({ page }) => {
    await loginAdmin(page)
    await page.goto(`/api/apercu?path=/fr/actualites/${DRAFT.slug}&secret=e2e-apercu`)
    await expect(page.getByRole('status').getByText('Aperçu — non publié')).toBeVisible()
    // Session supprimée, cookie d’aperçu conservé.
    await page.context().clearCookies({ name: 'payload-token' })
    await page.goto(`/fr/actualites/${DRAFT.slug}`)
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
    await expect(page.getByText('Aperçu — non publié')).toHaveCount(0)
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
