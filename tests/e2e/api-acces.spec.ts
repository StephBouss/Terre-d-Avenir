import { expect, test } from '@playwright/test'
import { adminToken } from './admin-helpers'

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

  test('les précisions sur les droits des médias ne sont pas exposées', async ({ request }) => {
    const docs: Record<string, unknown>[] = (await (await request.get('/api/medias?limit=100')).json()).docs
    expect(docs.length).toBeGreaterThan(0)
    expect(docs.some((d) => 'droitsNote' in d)).toBe(false)
  })

  test('/api/messages : lecture et création refusées sans jeton', async ({ request }) => {
    expect((await request.get('/api/messages')).status()).toBe(403)
    expect((await request.post('/api/messages', { data: { reference: 'CT-AAAAAA' } })).status()).toBe(403)
  })

  test('les médias restent publics', async ({ request }) => {
    const res = await request.get('/api/medias?limit=1')
    expect(res.status()).toBe(200)
  })
})

test.describe('messages : création REST refusée même à l’admin', { tag: '@desktop' }, () => {
  test.skip(({ isMobile }) => isMobile, 'admin desktop')
  test('POST /api/messages avec jeton admin', async ({ request }) => {
    const res = await request.post('/api/messages', {
      headers: { Authorization: `JWT ${await adminToken(request)}` },
      data: { reference: 'CT-AAAAAA', type: 'contact', donnees: {}, cleIdempotence: '00000000-0000-4000-8000-000000000000' },
    })
    expect(res.status()).toBe(403)
  })
})
