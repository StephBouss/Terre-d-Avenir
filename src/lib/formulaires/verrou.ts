// Messages dont la notification est en cours d’envoi. Sur globalThis : chaque route a son propre bundle.
const global = globalThis as typeof globalThis & { __notificationsEnCours?: Set<string> }
export const notificationsEnCours: Set<string> = (global.__notificationsEnCours ??= new Set<string>())
