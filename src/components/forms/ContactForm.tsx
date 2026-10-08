'use client'

import type { FormEvent } from 'react'
import { validerContact, LIMITES, type ChampContact } from '@/lib/formulaires/schema'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import ChampErreur from './ChampErreur'
import SansJavascript from './SansJavascript'
import SuccesEnvoi from './SuccesEnvoi'
import { texteErreur } from './texte-erreur'
import { useEnvoiFormulaire } from './useEnvoiFormulaire'

const LABEL = 'block text-sm font-bold text-foreground mb-2'
// text-base (16 px) : en dessous, Safari sur iPhone zoome la page à chaque saisie.
const FIELD = 'border border-border rounded-md px-4 py-3 bg-input text-base text-foreground w-full aria-[invalid=true]:border-error'
const HELP = 'mt-1.5 text-xs text-muted-foreground'

const ID: Record<ChampContact, string> = { nom: 'ct-nom', prenom: 'ct-prenom', email: 'ct-email', telephone: 'ct-tel', organisation: 'ct-org', message: 'ct-message' }
const ORDRE = Object.keys(ID) as ChampContact[]

type Props = { locale: Locale; labels: Dictionary['contactForm']; commun: Dictionary['formulaires']; facebookUrl?: string | null }

function lire(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form)
  const v = (k: string) => String(fd.get(k) ?? '')
  return { nom: v('nom'), prenom: v('prenom'), email: v('email'), telephone: v('telephone'), organisation: v('organisation'), message: v('message'), siteWeb: v('siteWeb') }
}

export default function ContactForm({ locale, labels, commun, facebookUrl }: Props) {
  const { pret, statut, reference, erreurs, soumettre } = useEnvoiFormulaire('contact', validerContact)

  if (statut === 'succes' && reference) {
    return <SuccesEnvoi texte={labels.success} reference={reference} liens={[{ href: localizedHref(locale, '/'), label: commun.retourAccueil }]} />
  }

  const erreur = (c: ChampContact) => texteErreur(erreurs[c], c, commun.erreurs, locale)
  const decrit = (c: ChampContact, ...aides: string[]) => {
    const ids = [...aides, erreurs[c] ? `${ID[c]}-erreur` : ''].filter(Boolean).join(' ')
    return { 'aria-invalid': erreurs[c] ? true : undefined, 'aria-describedby': ids || undefined }
  }

  async function envoyer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trouvees = await soumettre(lire(event.currentTarget))
    const premier = ORDRE.find((c) => trouvees[c])
    if (premier) document.getElementById(ID[premier])?.focus()
  }

  return (
    <form method="post" noValidate onSubmit={envoyer} className="relative flex flex-col gap-5">
      <SansJavascript commun={commun} facebookUrl={facebookUrl} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor={ID.nom} className={LABEL}>{labels.lastName}</label>
          <input id={ID.nom} name="nom" autoComplete="family-name" aria-required="true" maxLength={LIMITES.nom} className={FIELD} {...decrit('nom')} />
          <ChampErreur id={`${ID.nom}-erreur`} message={erreur('nom')} />
        </div>
        <div>
          <label htmlFor={ID.prenom} className={LABEL}>{labels.firstName}</label>
          <input id={ID.prenom} name="prenom" autoComplete="given-name" maxLength={LIMITES.prenom} className={FIELD} {...decrit('prenom')} />
          <ChampErreur id={`${ID.prenom}-erreur`} message={erreur('prenom')} />
        </div>
        <div>
          <label htmlFor={ID.email} className={LABEL}>{labels.email}</label>
          <input id={ID.email} name="email" type="email" autoComplete="email" aria-required="true" maxLength={LIMITES.email} className={FIELD} {...decrit('email')} />
          <ChampErreur id={`${ID.email}-erreur`} message={erreur('email')} />
        </div>
        <div>
          <label htmlFor={ID.telephone} className={LABEL}>{labels.phone}</label>
          <input id={ID.telephone} name="telephone" type="tel" inputMode="tel" autoComplete="tel" placeholder={labels.phonePlaceholder} className={FIELD} {...decrit('telephone')} />
          <ChampErreur id={`${ID.telephone}-erreur`} message={erreur('telephone')} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={ID.organisation} className={LABEL}>{labels.organisation}</label>
          <input id={ID.organisation} name="organisation" autoComplete="organization" maxLength={LIMITES.organisation} className={FIELD} {...decrit('organisation')} />
          <ChampErreur id={`${ID.organisation}-erreur`} message={erreur('organisation')} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={ID.message} className={LABEL}>{labels.message}</label>
          <textarea id={ID.message} name="message" rows={6} aria-required="true" maxLength={LIMITES.message} className={FIELD} {...decrit('message', 'ct-message-aide')} />
          <p id="ct-message-aide" className={HELP}>{labels.helpMessage}</p>
          <ChampErreur id={`${ID.message}-erreur`} message={erreur('message')} />
        </div>
      </div>
      {/* Pot de miel : invisible, hors du parcours clavier et ignoré par les lecteurs d’écran. Un robot qui le remplit reçoit un succès apparent. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-0 w-px h-px overflow-hidden">
        <label htmlFor="ct-site">{commun.piege}</label>
        <input id="ct-site" name="siteWeb" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p role="status" className="text-sm text-muted-foreground min-h-5">{statut === 'envoi' ? labels.sending : ''}</p>
      {statut === 'erreur' && <p role="alert" className="text-sm font-semibold text-error">{labels.networkError}</p>}
      {statut === 'limite' && <p role="alert" className="text-sm font-semibold text-error">{commun.limite}</p>}
      <div>
        <button type="submit" disabled={!pret || statut === 'envoi'} className="w-full sm:w-auto font-bold text-base px-8 py-3 rounded-md font-body bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-wait">
          {labels.submit}
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{labels.dataNotice}</p>
    </form>
  )
}
