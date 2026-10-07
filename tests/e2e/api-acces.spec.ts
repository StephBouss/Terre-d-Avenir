import { expect, test } from '@playwright/test'

// L'API REST de Payload est publique : un visiteur anonyme ne doit voir ni brouillon ni contenu éditorial brut.
test.describe('accès anonyme à l’API REST', () => {
  test('les actualités brouillon ou archivées ne sont pas exposées', async ({ request }) => {
    const all = await request.get('/api/actualites?limit=100')
    const docs: { _status?: string; archivee?: boolean }[] = (await all.json()).docs ?? []
    expect(docs.length).toBeGreaterThan(0)
    expect(docs.every((d) => d._status === 'published' && d.archivee !== true)).toBe(true)
  })

  for (const path of ['/api/pages', '/api/projets', '/api/globals/reglages', '/api/globals/diaporama']) {
    test(`${path} est refusé`, async ({ request }) => {
      const res = await request.get(path)
      expect([401, 403]).toContain(res.status())
    })
  }

  test('les médias restent publics', async ({ request }) => {
    const res = await request.get('/api/medias?limit=1')
    expect(res.status()).toBe(200)
  })
})
