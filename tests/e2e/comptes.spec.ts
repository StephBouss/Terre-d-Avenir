import { expect, test, type APIRequestContext } from '@playwright/test'
import { ADMIN_EMAIL } from './admin-credentials'
import { adminToken, loginAdmin } from './admin-helpers'

const REDACTION = { email: 'e2e-redaction@terredavenir.local', password: 'e2e-redaction-mot-de-passe', role: 'redaction' }
const SECRETARIAT = { email: 'e2e-secretariat@terredavenir.local', password: 'e2e-secretariat-mot-de-passe', role: 'secretariat' }
const TROISIEME = { email: 'e2e-troisieme@terredavenir.local', password: 'e2e-troisieme-mot-de-passe', role: 'personnalise' }


test.describe('comptes et accès par module', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  const admin = async () => ({ Authorization: `JWT ${await adminToken()}` })
  const jeton = async (request: APIRequestContext, compte: { email: string; password: string }) => {
    const res = await request.post('/api/users/login', { data: { email: compte.email, password: compte.password } })
    expect(res.ok(), await res.text()).toBe(true)
    return { Authorization: `JWT ${(await res.json()).token}` }
  }

  // La base e2e est persistante : avant et après, seul le compte administrateur des tests reste (places libres pour la limite).
  async function purger(request: APIRequestContext) {
    const headers = await admin()
    const res = await request.get(`/api/users?limit=50&where[email][not_equals]=${encodeURIComponent(ADMIN_EMAIL)}`, { headers })
    for (const u of (await res.json()).docs as { id: number }[]) await request.delete(`/api/users/${u.id}`, { headers })
  }
  test.beforeAll(async ({ request }) => purger(request))
  test.afterAll(async ({ request }) => purger(request))

  test('l’administrateur crée 2 comptes au plus ; personne d’autre ne crée de compte', async ({ request }) => {
    const headers = await admin()
    expect((await request.post('/api/users', { data: REDACTION })).status()).toBe(403)
    const cree = await request.post('/api/users', { headers, data: REDACTION })
    expect(cree.status(), await cree.text()).toBe(201)
    // Sans accès précisés, ceux du rôle type s’appliquent.
    expect((await cree.json()).doc.acces).toMatchObject({ actualites: 'modification', messages: 'aucun' })
    expect((await request.post('/api/users', { headers: await jeton(request, REDACTION), data: SECRETARIAT })).status()).toBe(403)
    expect((await request.post('/api/users', { headers, data: SECRETARIAT })).status()).toBe(201)
    expect((await request.post('/api/users', { headers, data: TROISIEME })).status()).toBe(403)
    expect((await request.post('/api/users', { headers, data: { ...TROISIEME, email: 'x@y.z', role: 'administrateur' } })).status()).toBe(403)
    expect((await request.post('/api/users/first-register', { data: TROISIEME })).status()).toBe(403)
  })

  test('chaque compte n’accède qu’à ses modules', async ({ request }) => {
    const redaction = await jeton(request, REDACTION)
    expect((await request.get('/api/messages', { headers: redaction })).status()).toBe(403)
    expect((await request.get('/api/pages', { headers: redaction })).ok()).toBe(true)
    const secretariat = await jeton(request, SECRETARIAT)
    expect((await request.get('/api/messages', { headers: secretariat })).ok()).toBe(true)
    expect((await request.get('/api/pages', { headers: secretariat })).status()).toBe(403)
    // Un compte limité ne voit que lui-même et ne peut pas s’attribuer de droits.
    const moi = await request.get('/api/users', { headers: redaction })
    expect((await moi.json()).docs.map((u: { email: string }) => u.email)).toEqual([REDACTION.email])
    const id = (await moi.json()).docs[0].id
    await request.patch(`/api/users/${id}`, { headers: redaction, data: { role: 'personnalise', acces: { messages: 'modification' } } })
    const apres = await request.get(`/api/users/${id}`, { headers: await admin() })
    expect((await apres.json()).acces.messages).toBe('aucun')
  })

  test('menu admin : les modules sans accès n’apparaissent pas', async ({ page }) => {
    const res = await page.request.post('/api/users/login', { data: { email: REDACTION.email, password: REDACTION.password } })
    expect(res.ok()).toBe(true)
    await page.goto('/admin')
    const nav = page.locator('nav')
    await expect(nav.getByRole('link', { name: 'Actualités' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Messages reçus' })).toHaveCount(0)
    await expect(nav.getByRole('link', { name: 'Réglages du site' })).toHaveCount(0)
  })

  test('admin : choisir un rôle type pré-remplit les accès', async ({ page, request }) => {
    // Une place libre pour le formulaire de création.
    const headers = await admin()
    const res = await request.get(`/api/users?where[email][equals]=${encodeURIComponent(SECRETARIAT.email)}`, { headers })
    for (const u of (await res.json()).docs as { id: number }[]) await request.delete(`/api/users/${u.id}`, { headers })

    await loginAdmin(page)
    await page.goto('/admin/collections/users')
    await expect(page.getByRole('link', { name: ADMIN_EMAIL })).toBeVisible()
    await page.goto('/admin/collections/users/create')
    await page.locator('#field-role').click()
    await page.getByRole('option', { name: 'Secrétariat' }).click()
    await expect(page.locator('#field-acces__messages')).toContainText('Modification')
    await expect(page.locator('#field-acces__pages')).toContainText('Aucun accès')
  })
})
