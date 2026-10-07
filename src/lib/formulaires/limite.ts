export const LIMITE_ENVOIS = 5
export const FENETRE_MS = 10 * 60 * 1000

/**
 * Limite de débit en mémoire (un seul processus) : au plus `limite` envois enregistrés par clé (IP) sur une fenêtre glissante.
 * Garde-fou anti-spam, pas une sécurité : l’IP vient d’en-têtes que le client peut fournir.
 */
export class LimiteurDebit {
  private readonly envois = new Map<string, number[]>()
  private readonly limite: number
  private readonly fenetreMs: number
  private dernierePurge = 0

  constructor(limite = LIMITE_ENVOIS, fenetreMs = FENETRE_MS) {
    this.limite = limite
    this.fenetreMs = fenetreMs
  }

  private recents(cle: string, maintenant: number): number[] {
    const liste = (this.envois.get(cle) ?? []).filter((t) => maintenant - t < this.fenetreMs)
    if (liste.length > 0) this.envois.set(cle, liste)
    else this.envois.delete(cle)
    return liste
  }

  /** Nombre de clés suivies. */
  get taille(): number {
    return this.envois.size
  }

  autorise(cle: string, maintenant: number): boolean {
    return this.recents(cle, maintenant).length < this.limite
  }

  enregistre(cle: string, maintenant: number): void {
    this.envois.set(cle, [...this.recents(cle, maintenant), maintenant])
    this.purger(maintenant)
  }

  /** Vérifie la limite et occupe un créneau dans la foulée, de façon synchrone : des requêtes concurrentes ne peuvent pas la dépasser. */
  reserve(cle: string, maintenant: number): boolean {
    if (!this.autorise(cle, maintenant)) return false
    this.enregistre(cle, maintenant)
    return true
  }

  /** Libère un créneau réservé par `reserve` (validation refusée, clé déjà connue, enregistrement impossible). */
  annule(cle: string, maintenant: number): void {
    const liste = this.recents(cle, maintenant)
    const i = liste.lastIndexOf(maintenant)
    if (i < 0) return
    liste.splice(i, 1)
    if (liste.length > 0) this.envois.set(cle, liste)
    else this.envois.delete(cle)
  }

  /** Balaie les clés expirées, au plus une fois par fenêtre. */
  private purger(maintenant: number): void {
    if (maintenant - this.dernierePurge < this.fenetreMs) return
    this.dernierePurge = maintenant
    for (const k of [...this.envois.keys()]) this.recents(k, maintenant)
  }
}

// Partagé entre les routes adhésion et contact (chaque Route Handler a son propre bundle).
const global = globalThis as typeof globalThis & { __limiteurFormulaires?: LimiteurDebit }
export const LIMITEUR: LimiteurDebit = (global.__limiteurFormulaires ??= new LimiteurDebit())

/** Clé unique du plafond global, tous visiteurs confondus (borne le spam même si l’IP est falsifiée). */
export const CLE_GLOBALE = '*'
export const PLAFOND_GLOBAL = (() => {
  const n = Number.parseInt(process.env.FORMULAIRES_PLAFOND_GLOBAL ?? '', 10)
  return Number.isInteger(n) && n > 0 ? n : 30
})()
const globaux = globalThis as typeof globalThis & { __limiteurGlobalFormulaires?: LimiteurDebit }
export const LIMITEUR_GLOBAL: LimiteurDebit = (globaux.__limiteurGlobalFormulaires ??= new LimiteurDebit(PLAFOND_GLOBAL, FENETRE_MS))
