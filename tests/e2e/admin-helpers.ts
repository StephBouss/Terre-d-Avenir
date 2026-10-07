import { readFileSync } from 'node:fs'
import { expect, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test'

/** Fichier écrit par le globalSetup (un seul login API, partagé : voir scripts/e2e-server.ts). */
const ADMIN_STATE_FILE = '.data/e2e-admin-state.json'

/** Connecte la page à l'admin avec la session partagée (cookie du storageState), sans refaire de login. */
export async function loginAdmin(page: Page): Promise<void> {
  const state = JSON.parse(readFileSync(ADMIN_STATE_FILE, 'utf8')) as { cookies: Parameters<BrowserContext['addCookies']>[0] }
  await page.context().addCookies(state.cookies)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/?(\?.*)?$/)
}

/** Jeton JWT partagé pour l'API REST de Payload (en-tête Authorization: JWT <token>), obtenu par le globalSetup. */
export async function adminToken(_request?: APIRequestContext): Promise<string> {
  const token = process.env.E2E_ADMIN_TOKEN
  if (!token) throw new Error('E2E_ADMIN_TOKEN absent : le globalSetup n’a pas ouvert de session admin')
  return token
}

/** Supprime d'éventuelles actualités de test restées d'une exécution interrompue (la base e2e est persistante). */
export async function purgeActualites(request: APIRequestContext, token: string, slugs: string[]): Promise<void> {
  const headers = { Authorization: `JWT ${token}` }
  for (const slug of slugs) {
    const res = await request.get(`/api/actualites?draft=true&limit=10&where[slug][equals]=${encodeURIComponent(slug)}`, { headers })
    expect(res.ok(), `purge ${slug} : ${res.status()} ${await res.text()}`).toBe(true)
    for (const doc of (await res.json()).docs as { id: string | number }[]) {
      await request.delete(`/api/actualites/${doc.id}`, { headers })
    }
  }
}
