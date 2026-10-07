import type { Dictionary } from '@/lib/i18n/dictionaries'

type Props = { commun: Dictionary['formulaires']; facebookUrl?: string | null }

/** Repli sans JavaScript : le formulaire exige JavaScript (aucun envoi natif), l’ONG reste joignable via Facebook. */
export default function SansJavascript({ commun, facebookUrl }: Props) {
  return (
    <noscript>
      <p className="text-sm font-semibold text-foreground">
        {commun.sansJs}{' '}
        {facebookUrl ? (
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline">
            {commun.sansJsFacebook}
          </a>
        ) : null}
      </p>
    </noscript>
  )
}
