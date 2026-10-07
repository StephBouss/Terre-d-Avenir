import { expect, test, type APIRequestContext } from '@playwright/test'
import { ADMIN_EMAIL } from './admin-credentials'
import { adminToken, loginAdmin } from './admin-helpers'

const SECOND = { email: 'e2e-second-compte@terredavenir.local', password: 'e2e-second-mot-de-passe' }

test.describe('compte admin unique', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  // Un run en échec (avant l’implémentation) crée ce compte dans la base e2e persistante : on le retire avant et après.
  // Supprimer un compte reste permis tant qu’il en existe plus d’un.
  async function purger(request: APIRequestContext) {
    const headers = { Authorization: `JWT ${await adminToken(request)}` }
    const res = await request.get(`/api/users?where[email][equals]=${encodeURIComponent(SECOND.email)}`, { headers })
    for (const u of (await res.json()).docs as { id: number }[]) await request.delete(`/api/users/${u.id}`, { headers })
  }
  test.beforeAll(async ({ request }) => purger(request))
  test.afterAll(async ({ request }) => purger(request))

  test('REST : un second compte est refusé, avec ou sans jeton admin', async ({ request }) => {
    const headers = { Authorization: `JWT ${await adminToken(request)}` }
    expect((await request.post('/api/users', { data: SECOND })).status()).toBe(403)
    expect((await request.post('/api/users', { headers, data: SECOND })).status()).toBe(403)
    // Parcours « premier utilisateur » fermé dès qu’un compte existe (refus natif de Payload).
    expect((await request.post('/api/users/first-register', { data: SECOND })).status()).toBe(403)
    const found = await request.get(`/api/users?where[email][equals]=${encodeURIComponent(SECOND.email)}`, { headers })
    expect((await found.json()).totalDocs).toBe(0)
  })

  test('admin : la liste des utilisateurs n’offre pas de bouton de création', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/collections/users')
    await expect(page.getByRole('link', { name: ADMIN_EMAIL })).toBeVisible()
    await expect(page.getByText('Créer un(e) nouveau ou nouvelle')).toHaveCount(0)
  })
})
