import { expect, test } from '@playwright/test'
import { loginAdmin } from './admin-helpers'

// Après une validation, l’admin mène à la page suivante (la liste) et confirme l’action par un bandeau.
test.describe('admin : page suivante après enregistrement', { tag: '@desktop' }, () => {
  test.skip(({ isMobile }) => isMobile, 'admin desktop')

  test('modifier un projet ramène à la liste des projets, avec confirmation', async ({ page }) => {
    await loginAdmin(page)
    const projets = await (await page.request.get('/api/projets?limit=1&depth=0&where[slug][equals]=sport-cohesion')).json()
    await page.goto(`/admin/collections/projets/${projets.docs[0].id}`)
    // Le bouton n’est actif qu’après une saisie : on retouche un champ sans en changer la valeur finale.
    const champ = page.locator('input[name="title"]')
    const valeur = await champ.inputValue()
    await champ.fill(`${valeur} `)
    await champ.fill(valeur)
    await page.getByRole('button', { name: 'Sauvegarder' }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/projets(\?.*)?$/, { timeout: 15_000 })
    const bandeau = page.locator('[data-confirmation]')
    await expect(bandeau).toContainText('Modifications enregistrées')
    await expect(bandeau).toContainText('Projet')
  })
})
