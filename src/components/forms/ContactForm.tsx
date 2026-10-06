import type { Dictionary } from '@/lib/i18n/dictionaries'

const LABEL = 'block text-sm font-bold text-foreground mb-2'
const FIELD = 'border border-border rounded-md px-4 py-3 bg-input text-foreground w-full disabled:opacity-70'

/** Formulaire affiché pour information : l'envoi de messages n'est pas encore ouvert (lot 1). */
export default function ContactForm({ labels }: { labels: Dictionary['contactForm'] }) {
  return (
    <form noValidate className="flex flex-col gap-5">
      <fieldset disabled className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="ct-nom" className={LABEL}>{labels.lastName}</label>
          <input id="ct-nom" autoComplete="family-name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="ct-prenom" className={LABEL}>{labels.firstName}</label>
          <input id="ct-prenom" autoComplete="given-name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="ct-email" className={LABEL}>{labels.email}</label>
          <input id="ct-email" type="email" autoComplete="email" className={FIELD} />
        </div>
        <div>
          <label htmlFor="ct-tel" className={LABEL}>{labels.phone}</label>
          <input id="ct-tel" type="tel" autoComplete="tel" className={FIELD} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="ct-org" className={LABEL}>{labels.organisation}</label>
          <input id="ct-org" autoComplete="organization" className={FIELD} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="ct-message" className={LABEL}>{labels.message}</label>
          <textarea id="ct-message" rows={6} className={FIELD} />
        </div>
        <div>
          <button type="button" disabled aria-disabled="true" className="font-bold text-base px-8 py-3 rounded-md font-body bg-primary text-primary-foreground opacity-60 cursor-not-allowed">
            {labels.submit}
          </button>
        </div>
      </fieldset>
    </form>
  )
}
