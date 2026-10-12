import { isPlaceholder } from './text'

export type Diapositive = { titre: string; texte?: string | null }

/** Nombre d’images de fond qui défilent dans le Hero (voir HeroSlider et globals.css). */
export const NOMBRE_DIAPOSITIVES = 3

/**
 * Texte de chaque diapositive, dans l’ordre des images. Sans aucun texte saisi : une seule diapositive (titre et
 * introduction de la page Accueil), affichée sans défilement. Sinon une par image, la page Accueil comblant les manques.
 */
export function diapositives(textes: Diapositive[] | null | undefined, repli: Diapositive): Diapositive[] {
  const saisis = (textes ?? []).slice(0, NOMBRE_DIAPOSITIVES).map((t) => (isPlaceholder(t.titre) ? null : t))
  if (!saisis.some(Boolean)) return [repli]
  return Array.from({ length: NOMBRE_DIAPOSITIVES }, (_, i) => {
    const t = saisis[i]
    return t ? { titre: t.titre, texte: t.texte } : repli
  })
}
