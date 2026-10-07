import { describe, expect, it } from 'vitest'
import { erreurSansDonnees } from '@/lib/formulaires/erreur'

describe('erreurSansDonnees', () => {
  it('ne fuit ni le message ni la pile', () => {
    const cause = Object.assign(new Error('insert ... params: Awa,Mba,awa@example.org'), { code: '23505' })
    const erreur = Object.assign(new Error('Failed query: insert into messages params: Awa Mba awa@example.org', { cause }), { name: 'DrizzleQueryError' })
    const sortie = erreurSansDonnees(erreur)
    expect(sortie).toEqual({ name: 'DrizzleQueryError', causeCode: '23505' })
    const json = JSON.stringify(sortie)
    expect(json).not.toContain('Mba')
    expect(json).not.toContain('awa@example.org')
  })
  it('garde le code et supporte les valeurs non-erreur', () => {
    expect(erreurSansDonnees(Object.assign(new Error('x'), { code: 'ECONNREFUSED' }))).toEqual({ name: 'Error', code: 'ECONNREFUSED' })
    expect(erreurSansDonnees('params: Mba')).toEqual({ name: 'Error' })
    expect(erreurSansDonnees(null)).toEqual({ name: 'Error' })
  })
})
