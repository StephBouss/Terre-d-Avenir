import { expect, test } from '@playwright/test'

// L'API REST de Payload est publique : un visiteur anonyme ne doit voir ni brouillon ni contenu éditorial brut.
test.describe('accès anonyme à l’API REST', () => {
  test('les actualités non publiées ne sont pas exposées', async ({ request }) => {
    const hidden = await request.get('/api/actualites?where[publie][equals]=false&limit=100')
    const body = await hidden.json()
    expect(body.docs ?? []).toHaveLength(0)

    const all = await request.get('/api/actualites?limit=100')
    const docs: { publie: boolean }[] = (await all.json()).docs ?? []
    expect(docs.every((d) => d.publie === true)).toBe(true)
  })

  for (const path of ['/api/pages', '/api/projets', '/api/globals/reglages']) {
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
