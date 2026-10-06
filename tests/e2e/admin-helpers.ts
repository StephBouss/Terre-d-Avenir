import { expect, type APIRequestContext, type Page } from '@playwright/test'
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './admin-credentials'

/** Connexion à l'admin Payload par l'interface. */
export async function loginAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login')
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD)
  await page.locator('form button[type="submit"]').click()
  await expect(page).toHaveURL(/\/admin(\/)?$/)
}

/** Jeton JWT pour l'API REST de Payload (en-tête Authorization: JWT <token>). */
export async function adminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/users/login', { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
  expect(res.ok()).toBe(true)
  return (await res.json()).token as string
}

/** Supprime d'éventuelles actualités de test restées d'une exécution interrompue (la base e2e est persistante). */
export async function purgeActualites(request: APIRequestContext, token: string, slugs: string[]): Promise<void> {
  const headers = { Authorization: `JWT ${token}` }
  for (const slug of slugs) {
    const res = await request.get(`/api/actualites?draft=true&limit=10&where[slug][equals]=${encodeURIComponent(slug)}`, { headers })
    if (!res.ok()) continue
    for (const doc of (await res.json()).docs as { id: string | number }[]) {
      await request.delete(`/api/actualites/${doc.id}`, { headers })
    }
  }
}
