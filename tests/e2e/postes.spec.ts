import { expect, test } from '@playwright/test'
import { adminToken } from './admin-helpers'
import { creerPoste, purgerPostes, type Entetes } from './postes-helpers'

const PREFIXE = 'e2e-postes-'

test.describe('organigramme : règles des postes', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let headers: Entetes
  const ids = { racine: 0, enfant: 0 }

  test.beforeAll(async ({ request }) => {
    headers = { Authorization: `JWT ${await adminToken(request)}` }
    await purgerPostes(request, headers, PREFIXE)
    ids.racine = await creerPoste(request, headers, { cle: `${PREFIXE}racine`, intitule: 'E2E postes racine', ordre: 0 }, 'draft')
    ids.enfant = await creerPoste(request, headers, { cle: `${PREFIXE}enfant`, intitule: 'E2E postes enfant', parent: ids.racine, ordre: 0 }, 'draft')
  })
  test.afterAll(async ({ request }) => {
    await purgerPostes(request, headers, PREFIXE)
  })

  test('auto-rattachement refusé avec un message explicite', async ({ request }) => {
    const res = await request.patch(`/api/postes/${ids.racine}?draft=true&locale=fr`, { headers, data: { parent: ids.racine } })
    expect(res.status()).toBe(400)
    expect(await res.text()).toContain('Un poste ne peut pas être rattaché à lui-même.')
    // Le champ « Rattaché à » doit être désigné, y compris en production (sinon l’admin ne le surligne pas).
    const { errors } = await res.json()
    expect(errors[0].data.errors[0].path).toBe('parent')
  })

  test('boucle refusée avec un message explicite', async ({ request }) => {
    const res = await request.patch(`/api/postes/${ids.racine}?draft=true&locale=fr`, { headers, data: { parent: ids.enfant } })
    expect(res.status()).toBe(400)
    expect(await res.text()).toContain('Ce rattachement créerait une boucle')
  })

  test('parent absent refusé avec un message explicite', async ({ request }) => {
    const res = await request.post('/api/postes?locale=fr&draft=true', { headers, data: { cle: `${PREFIXE}orphelin`, intitule: 'E2E postes orphelin', parent: 99999999, _status: 'draft' } })
    expect(res.status()).toBe(400)
    expect(await res.text()).toContain('n’existe pas')
  })

  test('suppression d’un parent refusée tant qu’un poste (même brouillon) lui est rattaché', async ({ request }) => {
    const res = await request.delete(`/api/postes/${ids.racine}`, { headers })
    expect(res.ok()).toBe(false)
    expect(await res.text()).toContain('Rattachez-les d’abord à un autre poste')
    expect((await request.get(`/api/postes/${ids.racine}?draft=true`, { headers })).status()).toBe(200)
  })

  test('API publique : les brouillons ne sont pas exposés', async ({ request }) => {
    const docs: { _status?: string; intitule?: string }[] = (await (await request.get('/api/postes?limit=100')).json()).docs
    expect(docs.every((d) => d._status === 'published')).toBe(true)
    expect(docs.map((d) => d.intitule)).not.toContain('E2E postes racine')
    expect([403, 404]).toContain((await request.get(`/api/postes/${ids.racine}`)).status())
  })
})
