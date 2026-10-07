import { nomPays } from './pays'
import type { Interet } from './schema'

/** Libellés français des champs, dans l’ordre d’affichage (admin et e-mail de notification). */
export const LIBELLES_CHAMPS: Record<string, string> = {
  nom: 'Nom',
  prenoms: 'Prénom(s)',
  prenom: 'Prénom',
  telephone: 'Téléphone',
  email: 'E-mail',
  pays: 'Pays de résidence',
  ville: 'Ville',
  organisation: 'Organisation',
  interets: 'Centres d’intérêt',
  motivation: 'Motivation',
  message: 'Message',
}

export const LIBELLES_INTERETS: Record<Interet, string> = {
  jeunesse: 'Jeunesse',
  sante: 'Santé et sensibilisation',
  sport: 'Sport',
  solidarite: 'Solidarité et vie locale',
  autre: 'Autre contribution',
}

function valeurLisible(champ: string, valeur: unknown): string {
  if (valeur === null || valeur === undefined) return ''
  if (champ === 'pays' && typeof valeur === 'string') return `${nomPays(valeur, 'fr')} (${valeur})`
  if (champ === 'interets' && Array.isArray(valeur)) return valeur.map((i) => LIBELLES_INTERETS[i as Interet] ?? String(i)).join(', ')
  return String(valeur)
}

/** Données d’un message en lignes « libellé : valeur » ; champs inconnus et valeurs vides omis. */
export function lignesLisibles(donnees: unknown): { libelle: string; valeur: string }[] {
  if (!donnees || typeof donnees !== 'object' || Array.isArray(donnees)) return []
  const d = donnees as Record<string, unknown>
  return Object.keys(LIBELLES_CHAMPS)
    .filter((champ) => champ in d)
    .map((champ) => ({ libelle: LIBELLES_CHAMPS[champ], valeur: valeurLisible(champ, d[champ]) }))
    .filter((ligne) => ligne.valeur !== '')
}
