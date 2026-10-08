import type { Access, Where } from 'payload'
import { type Compte, type Module, peutEnvoyerMedia, peutLire, peutModifier } from '../lib/permissions'

const compte = (user: unknown): Compte | null => (user ? (user as Compte) : null)

/**
 * Lecture d’un module : complète pour qui y a accès ; sinon `public` (lecture publique filtrée, ex. actualités
 * publiées) ou rien. Le site lit les contenus par l’API locale, qui ne passe pas par ces règles.
 */
export const lireModule =
  (module: Module, publique: Where | boolean = false): Access =>
  ({ req }) =>
    peutLire(compte(req.user), module) ? true : publique

export const modifierModule =
  (module: Module): Access =>
  ({ req }) =>
    peutModifier(compte(req.user), module)

/** Règles complètes d’une collection rattachée à un module (lecture, versions, création, modification, suppression). */
export function accesCollection(module: Module, publique: Where | boolean = false) {
  const lire = lireModule(module, publique)
  const modifier = modifierModule(module)
  return { read: lire, readVersions: lireModule(module), create: modifier, update: modifier, delete: modifier }
}

/** Règles d’un global rattaché à un module. */
export const accesGlobal = (module: Module) => ({ read: lireModule(module), update: modifierModule(module), readVersions: lireModule(module) })

/** Masque l’entrée du menu admin pour qui n’a pas accès au module. */
export const masquerSansAcces =
  (module: Module) =>
  ({ user }: { user: unknown }): boolean =>
    !peutLire(compte(user), module)

/** Médias : envoi possible dès qu’un module est en modification (image d’une actualité, portrait…). */
export const envoiMedia: Access = ({ req }) => peutEnvoyerMedia(compte(req.user))
