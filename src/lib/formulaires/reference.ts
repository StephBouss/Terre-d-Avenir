import { randomInt } from 'node:crypto'
import type { TypeFormulaire } from './schema'

/** Sans I, O, 0 ni 1 : lisible au téléphone. 32⁶ ≈ 10⁹ combinaisons, tirées par un générateur cryptographique. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const PREFIXES: Record<TypeFormulaire, string> = { adhesion: 'ADH', contact: 'CT' }
export const REFERENCE = /^(ADH|CT)-[A-HJ-NP-Z2-9]{6}$/

export function genererReference(type: TypeFormulaire): string {
  let suite = ''
  for (let i = 0; i < 6; i++) suite += ALPHABET[randomInt(ALPHABET.length)]
  return `${PREFIXES[type]}-${suite}`
}
