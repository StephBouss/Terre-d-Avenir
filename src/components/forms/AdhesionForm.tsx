'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { INTERETS, LIMITES, longueur, validerAdhesion, type ChampAdhesion } from '@/lib/formulaires/schema'
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

const ID: Record<ChampAdhesion, string> = {
  nom: 'adh-nom',
  prenoms: 'adh-prenoms',
  telephone: 'adh-tel',
  email: 'adh-email',
  pays: 'adh-pays',
  ville: 'adh-ville',
  interets: 'adh-interet-0',
  motivation: 'adh-motivation',
  notice: 'adh-notice',
}
const ORDRE = Object.keys(ID) as ChampAdhesion[]

/** Seuils d’annonce vocale du compteur : 80 %, 90 % et 100 % de la limite. */
const SEUILS = [0.8, 0.9, 1]
const palier = (n: number) => SEUILS.filter((p) => n >= Math.ceil(LIMITES.motivation * p)).length

type Props = { locale: Locale; labels: Dictionary['adhesionForm']; commun: Dictionary['formulaires']; pays: { code: string; nom: string }[]; facebookUrl?: string | null }

function lire(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form)
  const v = (k: string) => String(fd.get(k) ?? '')
  return {
    nom: v('nom'),
    prenoms: v('prenoms'),
    telephone: v('telephone'),
    email: v('email'),
    pays: v('pays'),
    ville: v('ville'),
    interets: fd.getAll('interets').map(String),
    motivation: v('motivation'),
    notice: fd.get('notice') === 'on',
    siteWeb: v('siteWeb'),
  }
}

export default function AdhesionForm({ locale, labels, commun, pays, facebookUrl }: Props) {
  const { pret, statut, reference, erreurs, soumettre } = useEnvoiFormulaire('adhesion', validerAdhesion)
  const [caracteres, setCaracteres] = useState(0)
  const [annonce, setAnnonce] = useState({ palier: 0, restants: 0 })
  const zone = useRef<HTMLTextAreaElement>(null)

  function mesurer(valeur: string) {
    const n = longueur(valeur)
    setCaracteres(n)
    const p = palier(n)
    // L’annonce ne change qu’au franchissement d’un seuil, jamais à chaque frappe.
    setAnnonce((a) => (a.palier === p ? a : { palier: p, restants: LIMITES.motivation - n }))
  }

  // Après l’hydratation, le navigateur a pu restaurer la valeur du textarea : le compteur part de la valeur réelle.
  useEffect(() => {
    if (pret && zone.current) mesurer(zone.current.value)
  }, [pret])

  if (statut === 'succes' && reference) {
    return (
      <SuccesEnvoi
        texte={labels.success}
        reference={reference}
        liens={[
          { href: localizedHref(locale, '/'), label: commun.retourAccueil },
          { href: localizedHref(locale, '/projets'), label: labels.discoverActions },
        ]}
      />
    )
  }

  const nombre = new Intl.NumberFormat(locale)
  const compteur = labels.motivationCounter.replace('{n}', nombre.format(caracteres)).replace('{max}', nombre.format(LIMITES.motivation))
  const erreur = (c: ChampAdhesion) => texteErreur(erreurs[c], c, commun.erreurs, locale)
  const decrit = (c: ChampAdhesion, ...aides: string[]) => {
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
    <form method="post" noValidate onSubmit={envoyer} className="relative bg-background rounded-lg border border-border p-8 flex flex-col gap-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <SansJavascript commun={commun} facebookUrl={facebookUrl} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor={ID.nom} className={LABEL}>{labels.lastName}</label>
          <input id={ID.nom} name="nom" autoComplete="family-name" aria-required="true" maxLength={LIMITES.nom} className={FIELD} {...decrit('nom')} />
          <ChampErreur id={`${ID.nom}-erreur`} message={erreur('nom')} />
        </div>
        <div>
          <label htmlFor={ID.prenoms} className={LABEL}>{labels.firstNames}</label>
          <input id={ID.prenoms} name="prenoms" autoComplete="given-name" aria-required="true" maxLength={LIMITES.prenoms} className={FIELD} {...decrit('prenoms')} />
          <ChampErreur id={`${ID.prenoms}-erreur`} message={erreur('prenoms')} />
        </div>
        <div>
          <label htmlFor={ID.telephone} className={LABEL}>{labels.phone}</label>
          <input
            id={ID.telephone}
            name="telephone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-required="true"
            placeholder={labels.phonePlaceholder}
            className={FIELD}
            {...decrit('telephone', 'adh-tel-aide', 'adh-tel-format')}
          />
          <p id="adh-tel-aide" className={HELP}>{labels.helpPhone}</p>
          <p id="adh-tel-format" className={HELP}>{labels.helpPhoneFormat}</p>
          <ChampErreur id={`${ID.telephone}-erreur`} message={erreur('telephone')} />
        </div>
        <div>
          <label htmlFor={ID.email} className={LABEL}>{labels.email}</label>
          <input id={ID.email} name="email" type="email" autoComplete="email" maxLength={LIMITES.email} className={FIELD} {...decrit('email', 'adh-email-aide')} />
          <p id="adh-email-aide" className={HELP}>{labels.helpEmail}</p>
          <ChampErreur id={`${ID.email}-erreur`} message={erreur('email')} />
        </div>
        <div>
          <label htmlFor={ID.pays} className={LABEL}>{labels.country}</label>
          <select id={ID.pays} name="pays" autoComplete="country" defaultValue="" className={FIELD} {...decrit('pays')}>
            <option value="">{labels.countryPlaceholder}</option>
            {pays.map((p) => (
              <option key={p.code} value={p.code}>{p.nom}</option>
            ))}
          </select>
          <ChampErreur id={`${ID.pays}-erreur`} message={erreur('pays')} />
        </div>
        <div>
          <label htmlFor={ID.ville} className={LABEL}>{labels.city}</label>
          <input id={ID.ville} name="ville" autoComplete="address-level2" maxLength={LIMITES.ville} className={FIELD} {...decrit('ville')} />
          <ChampErreur id={`${ID.ville}-erreur`} message={erreur('ville')} />
        </div>
        <fieldset className="md:col-span-2" aria-describedby={['adh-interets-aide', erreurs.interets ? 'adh-interets-erreur' : ''].filter(Boolean).join(' ')}>
          <legend className={LABEL}>{labels.interests}</legend>
          {/* Une case par ligne sur smartphone ; côte à côte à partir de 640 px. */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-3">
            {INTERETS.map((valeur, i) => (
              <label key={valeur} htmlFor={`adh-interet-${i}`} className="inline-flex items-center gap-2 text-base text-foreground">
                <input id={`adh-interet-${i}`} type="checkbox" name="interets" value={valeur} className="h-6 w-6 shrink-0 accent-[#005C38]" />
                {labels.interestOptions[i]}
              </label>
            ))}
          </div>
          <p id="adh-interets-aide" className={HELP}>{labels.helpInterests}</p>
          <ChampErreur id="adh-interets-erreur" message={erreur('interets')} />
        </fieldset>
        <div className="md:col-span-2">
          <label htmlFor={ID.motivation} className={LABEL}>{labels.motivation}</label>
          <textarea
            id={ID.motivation}
            name="motivation"
            rows={5}
            maxLength={LIMITES.motivation}
            ref={zone}
            onChange={(e) => mesurer(e.target.value)}
            className={FIELD}
            {...decrit('motivation', 'adh-motivation-aide', 'adh-motivation-compteur')}
          />
          <p id="adh-motivation-aide" className={HELP}>{labels.helpMotivation}</p>
          <p id="adh-motivation-compteur" className={HELP} suppressHydrationWarning>{compteur}</p>
          <p className="sr-only" role="status" aria-live="polite" suppressHydrationWarning>
            {annonce.palier > 0 ? commun.caracteresRestants.replace('{n}', nombre.format(annonce.restants)) : ''}
          </p>
          <ChampErreur id={`${ID.motivation}-erreur`} message={erreur('motivation')} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={ID.notice} className="inline-flex items-start gap-3 text-base text-foreground">
            <input id={ID.notice} type="checkbox" name="notice" aria-required="true" className="mt-0.5 h-6 w-6 shrink-0 accent-[#005C38]" {...decrit('notice')} />
            <span>{labels.notice}</span>
          </label>
          <ChampErreur id={`${ID.notice}-erreur`} message={erreur('notice')} />
          <p className="mt-2 text-sm">
            <Link href={localizedHref(locale, '/confidentialite')} className="font-bold text-primary underline">
              {labels.noticeLink}
            </Link>
          </p>
        </div>
      </div>
      {/* Pot de miel : invisible, hors du parcours clavier et ignoré par les lecteurs d’écran. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-0 w-px h-px overflow-hidden">
        <label htmlFor="adh-site">{commun.piege}</label>
        <input id="adh-site" name="siteWeb" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p role="status" className="text-sm text-muted-foreground min-h-5">{statut === 'envoi' ? labels.sending : ''}</p>
      {statut === 'erreur' && (
        <div role="alert" className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-error">{labels.networkError}</p>
          <Link href={localizedHref(locale, '/contact')} className="text-sm font-bold text-primary underline">
            {commun.contacterOng}
          </Link>
        </div>
      )}
      {statut === 'limite' && <p role="alert" className="text-sm font-semibold text-error">{commun.limite}</p>}
      <div>
        <button type="submit" disabled={!pret || statut === 'envoi'} className="w-full sm:w-auto font-bold text-base px-8 py-3 rounded-md font-body disabled:opacity-60 disabled:cursor-wait" style={{ background: '#E6BF58', color: '#17372C' }}>
          {labels.submit}
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{labels.dataNotice}</p>
    </form>
  )
}
