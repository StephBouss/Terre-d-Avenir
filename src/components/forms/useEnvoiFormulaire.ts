'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import { nouvelleCle, type Erreurs, type ReponseFormulaire, type Resultat, type TypeFormulaire } from '@/lib/formulaires/schema'

export type Statut = 'saisie' | 'envoi' | 'succes' | 'erreur' | 'limite'

const abonner = () => () => {}

/**
 * États d’un formulaire public : saisie, erreurs de champ, envoi, succès, erreur réseau, limite.
 * La clé d’idempotence naît au premier envoi valide et sert à chaque nouvel essai : le serveur ne crée jamais de doublon.
 * Renvoie les erreurs trouvées, pour que le composant place le focus sur le premier champ en erreur.
 * `pret` (faux au rendu serveur et à l’hydratation, vrai ensuite) ne passe à `true` qu’après l’hydratation : le bouton reste désactivé avant, pour qu’un envoi natif (GET) ne place jamais de données personnelles dans l’URL.
 */
export function useEnvoiFormulaire<D, C extends string>(type: TypeFormulaire, valider: (brut: Record<string, unknown>) => Resultat<D, C>) {
  const pret = useSyncExternalStore(abonner, () => true, () => false)
  const cle = useRef<string | null>(null)
  const [statut, setStatut] = useState<Statut>('saisie')
  const [reference, setReference] = useState<string | null>(null)
  const [erreurs, setErreurs] = useState<Erreurs<C>>({})

  async function soumettre(brut: Record<string, unknown>): Promise<Erreurs<C>> {
    const verification = valider(brut)
    if (!verification.ok) {
      setErreurs(verification.erreurs)
      setStatut('saisie')
      return verification.erreurs
    }
    setErreurs({})
    cle.current ??= nouvelleCle()
    setStatut('envoi')
    try {
      const res = await fetch(`/api/formulaires/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...brut, cle: cle.current }),
      })
      const corps = (await res.json()) as ReponseFormulaire
      if (corps.ok) {
        cle.current = null
        setReference(corps.reference)
        setStatut('succes')
        return {}
      }
      if (corps.erreur === 'validation') {
        const champs = corps.champs as Erreurs<C>
        setErreurs(champs)
        setStatut('saisie')
        return champs
      }
      setStatut(corps.erreur === 'limite' ? 'limite' : 'erreur')
    } catch {
      setStatut('erreur')
    }
    return {}
  }

  return { pret, statut, reference, erreurs, soumettre }
}
