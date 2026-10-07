import { expect, test, type APIRequestContext } from '@playwright/test'
import { adminToken, loginAdmin } from './admin-helpers'

test.describe('tableau de bord des indicateurs', () => {
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  test('valeurs réelles, situation datée et cartes sans source', async ({ page }) => {
    await loginAdmin(page)
    const board = page.locator('.kpi-dashboard')
    await expect(board.getByRole('heading', { name: 'Indicateurs' })).toBeVisible()
    await expect(board.getByText(/Situation au .* \(heure de Libreville\)/)).toBeVisible()
    // Seed : 6 actualités publiées. Regex tolérante : d'autres specs créent des actualités en parallèle (nettoyées en afterAll).
    await expect(board.getByRole('link', { name: /Publiées\s*([6-9]|\d{2})/ })).toBeVisible()
    await expect(board.getByText('Aucune source configurée — disponible au lot 2')).toBeVisible()
    await expect(board.getByText('Aucune source configurée — disponible au lot 4')).toBeVisible()
    await expect(board.getByText('Aucune sauvegarde configurée')).toBeVisible()
  })

  test('une carte mène à la liste filtrée', async ({ page }) => {
    await loginAdmin(page)
    await page.locator('.kpi-dashboard').getByRole('link', { name: /Provisoires à remplacer/ }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/medias/)
    await expect(page.getByRole('link', { name: /^forest.*\.jpg/ }).first()).toBeVisible() // le seed suffixe les noms de fichier
    await expect(page.getByRole('link', { name: /^banner.*\.jpg/ })).toHaveCount(0)
  })
})

// PNG 1×1 valide : suffisant pour créer une photo de test.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAHbN4NAAAAABJRU5ErkJggg==', 'base64')
const PREFIX = 'e2e-tdb'

test.describe('liens des alertes photos', () => {
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  test.describe.configure({ mode: 'serial' })
  let headers: { Authorization: string }
  const ids: (number | string)[] = []

  async function purge(request: APIRequestContext) {
    const res = await request.get(`/api/medias?limit=50&where[filename][like]=${PREFIX}`, { headers })
    for (const d of (await res.json()).docs as { id: number }[]) await request.delete(`/api/medias/${d.id}`, { headers })
  }

  async function create(request: APIRequestContext, name: string, fields: Record<string, unknown>) {
    const res = await request.post('/api/medias?locale=fr', {
      headers,
      multipart: { _payload: JSON.stringify(fields), file: { name: `${PREFIX}-${name}.png`, mimeType: 'image/png', buffer: PNG } },
    })
    expect(res.ok(), await res.text()).toBe(true)
    const id = (await res.json()).doc.id
    ids.push(id)
    return id as number
  }

  test.beforeAll(async ({ request }) => {
    headers = { Authorization: `JWT ${await adminToken(request)}` }
    await purge(request)
    await create(request, 'alt-vide', { alt: '', provisoire: false })
    const nul = await create(request, 'alt-null', { alt: 'temporaire', provisoire: false })
    const patched = await request.patch(`/api/medias/${nul}?locale=fr`, { headers, data: { alt: null } })
    expect(patched.ok(), await patched.text()).toBe(true)
    await create(request, 'alt-renseigne', { alt: 'Une description', provisoire: false })
    await create(request, 'provisoire-vide', { alt: '', provisoire: true })
  })

  test.afterAll(async ({ request }) => {
    for (const id of ids) await request.delete(`/api/medias/${id}`, { headers })
  })

  test('« Sans texte alternatif » liste les photos non provisoires dont l’alt est vide ou absent', async ({ page }) => {
    await loginAdmin(page)
    await page.locator('.kpi-dashboard').getByRole('link', { name: /Sans texte alternatif/ }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/medias/)
    await expect(page.getByRole('link', { name: new RegExp(`^${PREFIX}-alt-vide.*\.png`) })).toBeVisible()
    await expect(page.getByRole('link', { name: new RegExp(`^${PREFIX}-alt-null.*\.png`) })).toBeVisible()
    await expect(page.getByRole('link', { name: new RegExp(`^${PREFIX}-alt-renseigne`) })).toHaveCount(0)
    await expect(page.getByRole('link', { name: new RegExp(`^${PREFIX}-provisoire-vide`) })).toHaveCount(0)
  })
})

test.describe('liens des cartes', () => {
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  test('« Brouillons » exclut les archivées, comme le compte', async ({ page }) => {
    await loginAdmin(page)
    const link = page.locator('.kpi-dashboard').getByRole('link', { name: /Brouillons/ })
    await expect(link).toHaveAttribute('href', /where\[_status\]\[equals\]=draft/)
    await expect(link).toHaveAttribute('href', /where\[archivee\]\[not_equals\]=true/)
  })

  test('traductions anglaises : une ligne et un lien par collection, en anglais', async ({ page }) => {
    await loginAdmin(page)
    const board = page.locator('.kpi-dashboard .kpi-traductions')
    await expect(board.getByText('Traductions anglaises à revoir')).toBeVisible()
    for (const [name, collection] of [['Actualités', 'actualites'], ['Pages', 'pages'], ['Projets', 'projets']] as const) {
      await expect(board.getByRole('link', { name: new RegExp(`^${name}\\s*\\d+`) })).toHaveAttribute('href', new RegExp(`/admin/collections/${collection}\\?locale=en$`))
    }
  })
})
