import { expect, test, type APIRequestContext } from '@playwright/test'
import { adminToken, loginAdmin } from './admin-helpers'
import { envoyerFormulaire, lireMessage, purgerMessages } from './formulaires-helpers'

test.describe('tableau de bord des indicateurs', { tag: '@desktop' }, () => {
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  test('valeurs réelles et situation datée', async ({ page }) => {
    await loginAdmin(page)
    const board = page.locator('.kpi-dashboard')
    await expect(board.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()
    await expect(board.getByText(/Situation au .* \(heure de Libreville\)/)).toBeVisible()
    // Grands chiffres visibles d’emblée, chacun menant à sa liste.
    for (const [cle, label] of [['messages', 'Messages à traiter'], ['actualites', 'Actualités publiées'], ['photos', 'Photos'], ['alertes', 'Photos provisoires']]) {
      const chiffre = board.locator(`[data-kpi-chiffre="${cle}"]`)
      await expect(chiffre).toBeInViewport()
      await expect(chiffre.locator('.kpi-chiffre-label')).toHaveText(label)
      await expect(chiffre.locator('.kpi-chiffre-nombre')).toHaveText(/^\d+$/)
    }
    // Seed : 6 actualités publiées. Regex tolérante : d'autres specs créent des actualités en parallèle (nettoyées en afterAll).
    await expect(board.getByRole('link', { name: /Publiées\s*([6-9]|\d{2})/ })).toBeVisible()
    await expect(board.getByText('Aucune source configurée')).toHaveCount(0)
    await expect(board.getByText(/Chargements en erreur/)).toHaveCount(0)
    await expect(board.getByText(/Sauvegardes/)).toHaveCount(0)
  })

  test('bandeau : comptes, création, mon compte et déconnexion', async ({ page }) => {
    await loginAdmin(page)
    const actions = page.getByRole('navigation', { name: 'Compte et utilisateurs' })
    await expect(actions.getByRole('link', { name: /^Gérer les comptes \d \/ 3$/ })).toHaveAttribute('href', '/admin/collections/users')
    await expect(actions.getByRole('link', { name: 'Mon compte' })).toHaveAttribute('href', '/admin/account')
    // La déconnexion n’est pas cliquée : elle fermerait la session partagée par les autres specs.
    await expect(actions.getByRole('link', { name: 'Se déconnecter' })).toHaveAttribute('href', '/admin/logout')
    const creer = actions.getByRole('link', { name: '+ Créer un compte' })
    // Absent seulement quand les 3 comptes existent déjà.
    if (await creer.count()) await expect(creer).toHaveAttribute('href', '/admin/collections/users/create')
  })

  test('une carte mène à la liste filtrée', async ({ page }) => {
    await loginAdmin(page)
    await page.locator('.kpi-dashboard').getByRole('link', { name: /Provisoires à remplacer/ }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/medias/)
    // Les portraits provisoires de l’organigramme remplissent la première page : on cherche par nom dans la liste filtrée.
    const filtre = page.url()
    await page.goto(`${filtre}${filtre.includes('?') ? '&' : '?'}search=forest`)
    await expect(page.getByRole('link', { name: /^forest.*\.jpg/ }).first()).toBeVisible() // le seed suffixe les noms de fichier
    await page.goto(`${filtre}${filtre.includes('?') ? '&' : '?'}search=banner`)
    await expect(page.getByRole('link', { name: /^banner.*\.jpg/ })).toHaveCount(0)
  })
})

// PNG 1×1 valide : suffisant pour créer une photo de test.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAHbN4NAAAAABJRU5ErkJggg==', 'base64')
const PREFIX = 'e2e-tdb'

test.describe('liens des alertes photos', { tag: '@desktop' }, () => {
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

test.describe('liens des cartes', { tag: '@desktop' }, () => {
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

const PREFIXE_KPI = 'e2e-kpi-'

test.describe('carte « Messages non traités »', { tag: '@desktop' }, () => {
  test.describe.configure({ mode: 'serial' })
  test.skip(({ isMobile }) => isMobile, 'données partagées : desktop uniquement')
  let token = ''
  const refs = { nonTraite: '', traite: '' }

  test.beforeAll(async ({ request }) => {
    token = await adminToken(request)
    await purgerMessages(request, token, PREFIXE_KPI)
    const contact = { email: 'visiteur@example.org', message: 'Message de test du tableau de bord.' }
    refs.nonTraite = (await (await envoyerFormulaire(request, 'contact', { ...contact, nom: `${PREFIXE_KPI}A-traiter` })).json()).reference
    refs.traite = (await (await envoyerFormulaire(request, 'contact', { ...contact, nom: `${PREFIXE_KPI}Deja-traite` })).json()).reference
    const traite = await lireMessage(request, token, refs.traite)
    const patch = await request.patch(`/api/messages/${traite!.id}`, { headers: { Authorization: `JWT ${token}` }, data: { traite: true } })
    expect(patch.ok(), await patch.text()).toBe(true)
  })
  test.afterAll(async ({ request }) => {
    await purgerMessages(request, token, PREFIXE_KPI)
  })

  test('valeur réelle, répartition par type et lien vers la liste filtrée', async ({ page }) => {
    await loginAdmin(page)
    const carte = page.locator('.kpi-dashboard article').filter({ has: page.getByRole('heading', { name: 'Messages non traités' }) })
    await expect(carte.getByRole('link', { name: /^Total\s*[1-9]\d*$/ })).toBeVisible() // au moins le message non traité de ce test
    await expect(carte.getByRole('link', { name: /^Adhésions\s*\d+$/ })).toHaveAttribute('href', /where\[traite\]\[not_equals\]=true&where\[type\]\[equals\]=adhesion$/)
    await expect(carte.getByRole('link', { name: /^E-mails en échec\s*\d+$/ })).toHaveAttribute('href', /where\[emailEtat\]\[equals\]=echec$/)
    await carte.getByRole('link', { name: /^Contact\s*\d+$/ }).click()
    // Payload réécrit la requête avec des crochets encodés : on compare l’URL décodée.
    await expect.poll(() => decodeURIComponent(page.url())).toMatch(/\/admin\/collections\/messages\?.*where\[traite\]\[not_equals\]=true.*where\[type\]\[equals\]=contact/)
    // D’autres specs créent des messages en parallèle : on restreint la liste filtrée aux messages de ce test.
    await page.goto(`${page.url()}&search=${PREFIXE_KPI}`)
    await expect(page.locator('table tbody')).toContainText(refs.nonTraite)
    await expect(page.locator('table tbody')).not.toContainText(refs.traite)
  })
})
