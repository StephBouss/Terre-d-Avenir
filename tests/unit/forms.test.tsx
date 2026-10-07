import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AdhesionForm from '@/components/forms/AdhesionForm'
import ContactForm from '@/components/forms/ContactForm'
import ClosedNotice from '@/components/forms/ClosedNotice'
import StepsSection from '@/components/forms/StepsSection'
import { CLE_IDEMPOTENCE } from '@/lib/formulaires/schema'
import { getDictionary } from '@/lib/i18n/dictionaries'

const dict = getDictionary('fr')

describe('formulaires du lot 1', () => {
  it('adhésion : champs des Textes v1.3, tous désactivés, sans action', () => {
    const { container } = render(<AdhesionForm locale="fr" labels={dict.adhesionForm} />)
    const form = container.querySelector('form')!
    expect(form).not.toHaveAttribute('action')
    expect(form.querySelector('fieldset')).toBeDisabled()
    for (const label of ['Nom *', 'Prénom(s) *', 'Téléphone avec indicatif international *', 'Votre motivation (facultatif)']) {
      expect(screen.getByLabelText(label)).toBeDisabled()
    }
    expect(screen.getAllByRole('checkbox')).toHaveLength(6) // 5 centres d’intérêt + la case d’information
    expect(screen.getByRole('button', { name: 'Envoyer ma demande' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.queryByLabelText(/Genre|Date de naissance/)).toBeNull()
  })
})

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

describe('masquage des brouillons', () => {
  it('l’avis de fermeture et les étapes ignorent les textes « [...] »', () => {
    const { container } = render(
      <>
        <ClosedNotice locale="fr" text="[À CONFIRMER]" newTabLabel="nouvel onglet" />
        <StepsSection section={{ key: 'etapes', heading: '[Titre]', items: [{ text: '[Étape]' }] } as never} />
      </>,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
