import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AdhesionForm from '@/components/forms/AdhesionForm'
import ContactForm from '@/components/forms/ContactForm'
import ClosedNotice from '@/components/forms/ClosedNotice'
import StepsSection from '@/components/forms/StepsSection'
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
  it('contact : désactivé', () => {
    render(<ContactForm labels={dict.contactForm} />)
    expect(screen.getByLabelText('Votre message')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Envoyer le message' })).toBeDisabled()
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
