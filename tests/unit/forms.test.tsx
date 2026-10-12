import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AdhesionForm from '@/components/forms/AdhesionForm'
import ContactForm from '@/components/forms/ContactForm'
import { useEnvoiFormulaire } from '@/components/forms/useEnvoiFormulaire'
import StepsSection from '@/components/forms/StepsSection'
import { CLE_IDEMPOTENCE } from '@/lib/formulaires/schema'
import { getDictionary } from '@/lib/i18n/dictionaries'

const dict = getDictionary('fr')

describe('formulaire de contact', () => {
  afterEach(() => vi.unstubAllGlobals())
  const rendu = () => render(<ContactForm locale="fr" labels={dict.contactForm} commun={dict.formulaires} />)
  const bouton = () => screen.getByRole('button', { name: 'Envoyer le message' })
  async function remplir(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText('Nom *'), 'Mba')
    await user.type(screen.getByLabelText('Adresse e-mail *'), 'awa@example.org')
    await user.type(screen.getByLabelText('Votre message *'), 'Bonjour')
  }
  const corpsEnvoye = (fetch: ReturnType<typeof vi.fn>, i: number) => JSON.parse((fetch.mock.calls[i] as [string, RequestInit])[1].body as string)

  it('champs actifs ; pot de miel masqué et hors du parcours clavier', () => {
    rendu()
    expect(screen.getByLabelText('Votre message *')).toBeEnabled()
    const piege = document.querySelector('input[name="siteWeb"]')!
    expect(piege).toHaveAttribute('tabindex', '-1')
    expect(piege.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('erreurs côté client : aucun envoi, saisie conservée, focus sur le premier champ en erreur', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await user.type(screen.getByLabelText('Nom *'), 'Mba')
    await user.type(screen.getByLabelText('Adresse e-mail *'), 'pas-un-email')
    await user.click(bouton())
    expect(fetch).not.toHaveBeenCalled()
    expect(screen.getByText('Vérifiez le format de votre adresse e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Ce champ est nécessaire pour traiter votre demande.')).toBeInTheDocument()
    expect(screen.getByLabelText('Adresse e-mail *')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Adresse e-mail *')).toHaveFocus()
    expect(screen.getByLabelText('Nom *')).toHaveValue('Mba')
  })

  it('succès : référence affichée ; envoi JSON avec une clé, sans langue', async () => {
    const fetch = vi.fn(async () => Response.json({ ok: true, reference: 'CT-ABC234' }))
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await remplir(user)
    await user.click(bouton())
    expect(await screen.findByText('CT-ABC234')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Votre message a été enregistré. Référence : CT-ABC234. Il sera examiné par l’ONG.')
    expect((fetch.mock.calls[0] as unknown[])[0]).toBe('/api/formulaires/contact')
    const corps = corpsEnvoye(fetch, 0)
    expect(corps).toMatchObject({ nom: 'Mba', email: 'awa@example.org', message: 'Bonjour', siteWeb: '' })
    expect(corps.cle).toMatch(CLE_IDEMPOTENCE)
    expect(corps).not.toHaveProperty('locale')
  })

  it('erreur réseau : message, saisie conservée, nouvel essai avec la même clé', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(Response.json({ ok: true, reference: 'CT-ABC234' }))
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await remplir(user)
    await user.click(bouton())
    expect(await screen.findByRole('alert')).toHaveTextContent('Nous n’avons pas pu confirmer l’enregistrement de votre message.')
    expect(screen.getByLabelText('Nom *')).toHaveValue('Mba')
    expect(bouton()).toBeEnabled()
    await user.click(bouton())
    expect(await screen.findByText('CT-ABC234')).toBeInTheDocument()
    expect(corpsEnvoye(fetch, 1).cle).toBe(corpsEnvoye(fetch, 0).cle)
  })

  it('erreurs renvoyées par le serveur, puis limite atteinte', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ ok: false, erreur: 'validation', champs: { email: 'email' } }, { status: 400 }))
      .mockResolvedValueOnce(Response.json({ ok: false, erreur: 'limite' }, { status: 429 }))
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await remplir(user)
    await user.click(bouton())
    expect(await screen.findByText('Vérifiez le format de votre adresse e-mail.')).toBeInTheDocument()
    await user.click(bouton())
    expect(await screen.findByRole('alert')).toHaveTextContent('Plusieurs envois ont déjà été faits depuis cette connexion.')
  })
})

describe('formulaire d’adhésion', () => {
  afterEach(() => vi.unstubAllGlobals())
  const PAYS = [
    { code: 'DE', nom: 'Allemagne' },
    { code: 'GA', nom: 'Gabon' },
  ]
  const rendu = () => render(<AdhesionForm locale="fr" labels={dict.adhesionForm} commun={dict.formulaires} pays={PAYS} />)
  const bouton = () => screen.getByRole('button', { name: 'Envoyer ma demande' })

  it('champs des Textes v1.3 actifs, notice non précochée, aucun champ superflu', () => {
    rendu()
    for (const label of ['Nom *', 'Prénom(s) *', 'Téléphone avec indicatif international *', 'Votre motivation (facultatif)']) {
      expect(screen.getByLabelText(label)).toBeEnabled()
    }
    expect(screen.getAllByRole('checkbox')).toHaveLength(6) // 5 centres d’intérêt + la notice
    expect(screen.getByRole('checkbox', { name: dict.adhesionForm.notice })).not.toBeChecked()
    expect(screen.getByRole('option', { name: 'Choisir un pays' })).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Gabon' })).toHaveValue('GA')
    expect(screen.queryByLabelText(/Genre|Date de naissance/)).toBeNull()
  })

  it('compteur de la motivation', async () => {
    const user = userEvent.setup()
    rendu()
    await user.type(screen.getByLabelText('Votre motivation (facultatif)'), 'abc')
    expect(screen.getByText(/^3 \/ 1\s000 caractères$/)).toBeInTheDocument()
  })

  it('erreurs côté client : requis, téléphone, notice ; focus sur le premier champ en erreur', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await user.type(screen.getByLabelText('Prénom(s) *'), 'Awa')
    await user.type(screen.getByLabelText('Téléphone avec indicatif international *'), '0612')
    await user.click(bouton())
    expect(fetch).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Nom *')).toHaveFocus()
    expect(screen.getByText('Vérifiez votre numéro et son indicatif international.')).toBeInTheDocument()
    expect(screen.getByText('Veuillez prendre connaissance des informations sur le traitement de votre demande.')).toBeInTheDocument()
    expect(screen.getByLabelText('Prénom(s) *')).toHaveValue('Awa')
  })

  it('succès : données envoyées, référence ADH et liens de suite', async () => {
    const fetch = vi.fn(async () => Response.json({ ok: true, reference: 'ADH-ABC234' }))
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    rendu()
    await user.type(screen.getByLabelText('Nom *'), 'Obiang')
    await user.type(screen.getByLabelText('Prénom(s) *'), 'Awa')
    await user.type(screen.getByLabelText('Téléphone avec indicatif international *'), '+241 06 12 34 56')
    await user.selectOptions(screen.getByLabelText('Pays de résidence (facultatif)'), 'GA')
    await user.click(screen.getByRole('checkbox', { name: 'Jeunesse' }))
    await user.click(screen.getByRole('checkbox', { name: dict.adhesionForm.notice }))
    await user.click(bouton())
    expect(await screen.findByText('ADH-ABC234')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Votre demande a été enregistrée. Référence : ADH-ABC234. Elle sera examinée par l’ONG.')
    expect(screen.getByRole('link', { name: 'Découvrir nos actions' })).toHaveAttribute('href', '/fr/projets')
    const corps = JSON.parse((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(corps).toMatchObject({ nom: 'Obiang', prenoms: 'Awa', telephone: '+241 06 12 34 56', pays: 'GA', interets: ['jeunesse'], notice: true, siteWeb: '' })
  })
})

describe('envoi avant hydratation', () => {
  const PAYS = [{ code: 'GA', nom: 'Gabon' }]
  const formes = {
    contact: () => <ContactForm locale="fr" labels={dict.contactForm} commun={dict.formulaires} />,
    adhesion: () => <AdhesionForm locale="fr" labels={dict.adhesionForm} commun={dict.formulaires} pays={PAYS} />,
  }

  for (const [nom, forme] of Object.entries(formes)) {
    it(`${nom} : rendu serveur en POST avec bouton désactivé (aucune donnée dans l’URL), actif une fois hydraté`, () => {
      const html = document.createElement('div')
      html.innerHTML = renderToString(forme())
      expect(html.querySelector('form')).toHaveAttribute('method', 'post')
      expect(html.querySelector('button[type="submit"]')).toBeDisabled()
      const { container } = render(forme())
      expect(container.querySelector('button[type="submit"]')).toBeEnabled()
    })
  }
})

describe('clé d’idempotence', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('une nouvelle clé est générée après un succès', async () => {
    const fetch = vi.fn(async () => Response.json({ ok: true, reference: 'CT-ABC234' }))
    vi.stubGlobal('fetch', fetch)
    const { result } = renderHook(() => useEnvoiFormulaire('contact', (brut) => ({ ok: true, donnees: brut })))
    await act(() => result.current.soumettre({ a: 1 }))
    await act(() => result.current.soumettre({ a: 1 }))
    const cle = (i: number) => JSON.parse((fetch.mock.calls[i] as unknown as [string, RequestInit])[1].body as string).cle
    expect(cle(1)).not.toBe(cle(0))
  })
})

describe('masquage des brouillons', () => {
  it('les étapes ignorent les textes « [...] »', () => {
    const { container } = render(
      <>
        <StepsSection section={{ key: 'etapes', heading: '[Titre]', items: [{ text: '[Étape]' }] } as never} />
      </>,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

describe('accessibilité et repli des formulaires (revue tâche 5)', () => {
  afterEach(() => vi.unstubAllGlobals())
  const FB = 'https://www.facebook.com/exemple'
  const PAYS = [{ code: 'GA', nom: 'Gabon' }]
  const adhesion = (locale: 'fr' | 'en' = 'fr', facebookUrl: string | null = FB) => {
    const d = getDictionary(locale)
    return <AdhesionForm locale={locale} labels={d.adhesionForm} commun={d.formulaires} pays={PAYS} facebookUrl={facebookUrl} />
  }
  const annonce = () => document.querySelector('p.sr-only[role="status"]')!

  it('annonce le compteur aux seuils de 80 %, 90 % et 100 %, pas à chaque frappe', async () => {
    const user = userEvent.setup()
    render(adhesion())
    const zone = screen.getByLabelText('Votre motivation (facultatif)')
    expect(annonce()).toHaveAttribute('aria-live', 'polite')
    expect(annonce()).toHaveTextContent('')
    await user.click(zone)
    await user.paste('a'.repeat(799))
    expect(annonce()).toHaveTextContent('')
    await user.paste('a')
    expect(annonce()).toHaveTextContent('Il reste 200 caractères')
    await user.paste('a')
    expect(annonce()).toHaveTextContent('Il reste 200 caractères') // pas de nouvelle annonce entre deux seuils
    await user.paste('a'.repeat(99))
    expect(annonce()).toHaveTextContent('Il reste 100 caractères')
    await user.paste('a'.repeat(100))
    expect(annonce()).toHaveTextContent('Il reste 0 caractères')
  })

  it('le compteur visuel n’est pas une zone live ; le textarea le référence', () => {
    render(adhesion())
    const compteur = document.getElementById('adh-motivation-compteur')!
    expect(compteur).not.toHaveAttribute('aria-live')
    expect(screen.getByLabelText('Votre motivation (facultatif)').getAttribute('aria-describedby')).toContain('adh-motivation-compteur')
  })

  it('annonce traduite en anglais', async () => {
    const user = userEvent.setup()
    render(adhesion('en'))
    await user.click(screen.getByLabelText('Your motivation (optional)'))
    await user.paste('a'.repeat(800))
    expect(annonce()).toHaveTextContent('200 characters left')
  })

  it('centres d’intérêt : fieldset avec legend', () => {
    render(adhesion())
    expect(screen.getByRole('group', { name: dict.adhesionForm.interests })).toBeInTheDocument()
  })

  it('compteur initialisé depuis la valeur restaurée par le navigateur', () => {
    const lecteur = vi.spyOn(HTMLTextAreaElement.prototype, 'value', 'get').mockReturnValue('a'.repeat(12))
    try {
      render(adhesion())
      expect(document.getElementById('adh-motivation-compteur')).toHaveTextContent(/^12 [/] 1/)
    } finally {
      lecteur.mockRestore()
    }
  })

  it('erreur réseau : lien vers le contact (adhésion), pas de lien vers la même page (contact)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('réseau')))
    const user = userEvent.setup()
    render(adhesion())
    await user.type(screen.getByLabelText('Nom *'), 'Mba')
    await user.type(screen.getByLabelText('Prénom(s) *'), 'Awa')
    await user.type(screen.getByLabelText('Téléphone avec indicatif international *'), '+241 06 12 34 56')
    await user.selectOptions(screen.getByLabelText('Pays de résidence (facultatif)'), 'GA')
    await user.click(screen.getByRole('checkbox', { name: dict.adhesionForm.notice }))
    await user.click(screen.getByRole('button', { name: 'Envoyer ma demande' }))
    const lien = await screen.findByRole('link', { name: 'Contacter l’ONG' })
    expect(lien).toHaveAttribute('href', '/fr/contact')
  })

  it('sans JavaScript : noscript traduit avec lien Facebook, pour les deux formulaires', () => {
    const d = getDictionary('en')
    const html = renderToString(adhesion('en'))
    expect(html).toContain('<noscript>')
    expect(html).toContain('This form requires JavaScript.')
    expect(html).toContain(`href="${FB}"`)
    const contact = renderToString(<ContactForm locale="fr" labels={dict.contactForm} commun={dict.formulaires} facebookUrl={FB} />)
    expect(contact).toContain('Ce formulaire nécessite JavaScript.')
    expect(contact).toContain(`href="${FB}"`)
    expect(contact).not.toContain('/fr/contact')
    expect(d.formulaires.sansJs).toBeTruthy()
    expect(renderToString(adhesion('fr', null))).not.toContain('facebook.com')
  })
})
