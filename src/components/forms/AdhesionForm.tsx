import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { localizedHref } from '@/lib/i18n/paths'

const LABEL = 'block text-sm font-bold text-foreground mb-2'
const FIELD = 'border border-border rounded-md px-4 py-3 bg-input text-foreground w-full disabled:opacity-70'
const HELP = 'mt-1.5 text-xs text-muted-foreground'

type Props = { locale: Locale; labels: Dictionary['adhesionForm'] }

/** Formulaire affiché pour information : l'adhésion en ligne n'est pas encore ouverte (lot 1). */
export default function AdhesionForm({ locale, labels }: Props) {
  return (
    <form noValidate className="bg-background rounded-lg border border-border p-8 flex flex-col gap-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <fieldset disabled className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="adh-nom" className={LABEL}>{labels.lastName}</label>
          <input id="adh-nom" name="nom" autoComplete="family-name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="adh-prenoms" className={LABEL}>{labels.firstNames}</label>
          <input id="adh-prenoms" name="prenoms" autoComplete="given-name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="adh-tel" className={LABEL}>{labels.phone}</label>
          <input id="adh-tel" name="telephone" type="tel" autoComplete="tel" aria-describedby="adh-tel-aide" className={FIELD} />
          <p id="adh-tel-aide" className={HELP}>{labels.helpPhone}</p>
        </div>
        <div>
          <label htmlFor="adh-email" className={LABEL}>{labels.email}</label>
          <input id="adh-email" name="email" type="email" autoComplete="email" aria-describedby="adh-email-aide" className={FIELD} />
          <p id="adh-email-aide" className={HELP}>{labels.helpEmail}</p>
        </div>
        <div>
          <label htmlFor="adh-pays" className={LABEL}>{labels.country}</label>
          <input id="adh-pays" name="pays" autoComplete="country-name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="adh-ville" className={LABEL}>{labels.city}</label>
          <input id="adh-ville" name="ville" autoComplete="address-level2" className={FIELD} />
        </div>
        <fieldset className="md:col-span-2" aria-describedby="adh-interets-aide">
          <legend className={LABEL}>{labels.interests}</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {labels.interestOptions.map((option, i) => (
              <label key={option} htmlFor={`adh-interet-${i}`} className="inline-flex items-center gap-2 text-base text-foreground">
                <input id={`adh-interet-${i}`} type="checkbox" name="interets" value={option} className="h-5 w-5 accent-[#005C38]" />
                {option}
              </label>
            ))}
          </div>
          <p id="adh-interets-aide" className={HELP}>{labels.helpInterests}</p>
        </fieldset>
        <div className="md:col-span-2">
          <label htmlFor="adh-motivation" className={LABEL}>{labels.motivation}</label>
          <textarea id="adh-motivation" name="motivation" rows={5} maxLength={1000} aria-describedby="adh-motivation-aide" className={FIELD} />
          <p id="adh-motivation-aide" className={HELP}>{labels.helpMotivation}</p>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="adh-notice" className="inline-flex items-start gap-3 text-base text-foreground">
            <input id="adh-notice" type="checkbox" name="notice" className="mt-1 h-5 w-5 accent-[#005C38]" />
            <span>{labels.notice}</span>
          </label>
        </div>
      </fieldset>
      <p className="text-sm">
        <Link href={localizedHref(locale, '/confidentialite')} className="font-bold text-primary underline">
          {labels.noticeLink}
        </Link>
      </p>
      <div>
        <button type="button" aria-disabled="true" className="font-bold text-base px-8 py-3 rounded-md font-body opacity-60 cursor-not-allowed" style={{ background: '#E6BF58', color: '#17372C' }}>
          {labels.submit}
        </button>
      </div>
    </form>
  )
}
