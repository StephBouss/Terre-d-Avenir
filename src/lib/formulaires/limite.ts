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

  autorise(cle: string, maintenant: number): boolean {
    return this.recents(cle, maintenant).length < this.limite
  }

  enregistre(cle: string, maintenant: number): void {
    this.envois.set(cle, [...this.recents(cle, maintenant), maintenant])
    if (this.envois.size > 10_000) for (const k of [...this.envois.keys()]) this.recents(k, maintenant)
  }
}

// Partagé entre les routes adhésion et contact (chaque Route Handler a son propre bundle).
const global = globalThis as typeof globalThis & { __limiteurFormulaires?: LimiteurDebit }
export const LIMITEUR: LimiteurDebit = (global.__limiteurFormulaires ??= new LimiteurDebit())
