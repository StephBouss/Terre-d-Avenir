/**
 * Comptes et accès de l’admin : un compte administrateur (le premier créé) qui gère tout, plus au plus
 * MAX_COMPTES_SUPPLEMENTAIRES comptes limités, chacun avec un niveau d’accès par module.
 * Module pur (sans Payload) : utilisé par les règles d’accès, les hooks et les composants admin.
 */

export const MAX_COMPTES_SUPPLEMENTAIRES = 2
export const MAX_COMPTES = 1 + MAX_COMPTES_SUPPLEMENTAIRES

export const NIVEAUX = ['aucun', 'lecture', 'modification'] as const
export type Niveau = (typeof NIVEAUX)[number]

export const NIVEAUX_LIBELLES: Record<Niveau, string> = { aucun: 'Aucun accès', lecture: 'Lecture seule', modification: 'Modification' }

/** Modules de l’admin, dans l’ordre d’affichage du formulaire d’un compte. */
export const MODULES = [
  { cle: 'actualites', libelle: 'Actualités' },
  { cle: 'mediatheque', libelle: 'Médiathèque (photos et albums)' },
  { cle: 'diaporama', libelle: 'Diaporama d’accueil' },
  { cle: 'pages', libelle: 'Pages du site' },
  { cle: 'projets', libelle: 'Projets et actions' },
  { cle: 'organigramme', libelle: 'Organigramme' },
  { cle: 'messages', libelle: 'Messages reçus (formulaires)' },
  { cle: 'reglages', libelle: 'Réglages du site' },
] as const
export type Module = (typeof MODULES)[number]['cle']
export type Acces = Partial<Record<Module, Niveau | null>>

export const ROLES = ['administrateur', 'redaction', 'mediatheque', 'secretariat', 'personnalise'] as const
export type Role = (typeof ROLES)[number]

export const ROLES_LIBELLES: Record<Role, string> = {
  administrateur: 'Administrateur principal',
  redaction: 'Rédaction',
  mediatheque: 'Gestion des médias',
  secretariat: 'Secrétariat',
  personnalise: 'Personnalisé',
}

/** Accès pré-remplis quand on choisit un rôle type ; ils restent modifiables module par module. */
export const PREREGLAGES: Record<Exclude<Role, 'administrateur' | 'personnalise'>, Record<Module, Niveau>> = {
  redaction: {
    actualites: 'modification',
    mediatheque: 'modification',
    diaporama: 'modification',
    pages: 'modification',
    projets: 'modification',
    organigramme: 'lecture',
    messages: 'aucun',
    reglages: 'aucun',
  },
  mediatheque: {
    actualites: 'lecture',
    mediatheque: 'modification',
    diaporama: 'modification',
    pages: 'aucun',
    projets: 'aucun',
    organigramme: 'aucun',
    messages: 'aucun',
    reglages: 'aucun',
  },
  secretariat: {
    actualites: 'lecture',
    mediatheque: 'aucun',
    diaporama: 'aucun',
    pages: 'aucun',
    projets: 'aucun',
    organigramme: 'modification',
    messages: 'modification',
    reglages: 'aucun',
  },
}

export type Compte = { id?: number | string; role?: Role | null; acces?: Acces | null }

export const estAdministrateur = (compte?: Compte | null): boolean => compte?.role === 'administrateur'

/** Niveau effectif d’un compte sur un module : tout pour l’administrateur, rien sans compte ni réglage. */
export function niveau(compte: Compte | null | undefined, module: Module): Niveau {
  if (!compte) return 'aucun'
  if (estAdministrateur(compte)) return 'modification'
  return compte.acces?.[module] ?? 'aucun'
}

export const peutLire = (compte: Compte | null | undefined, module: Module): boolean => niveau(compte, module) !== 'aucun'
export const peutModifier = (compte: Compte | null | undefined, module: Module): boolean => niveau(compte, module) === 'modification'

/** Envoi de fichiers dans la médiathèque : utile à tout module en modification (image d’une actualité, portrait…). */
export const peutEnvoyerMedia = (compte: Compte | null | undefined): boolean => MODULES.some((m) => peutModifier(compte, m.cle))
