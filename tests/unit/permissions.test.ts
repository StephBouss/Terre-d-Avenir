import { describe, expect, it } from 'vitest'
import { MAX_COMPTES, MODULES, PREREGLAGES, niveau, peutEnvoyerMedia, peutLire, peutModifier } from '@/lib/permissions'

const admin = { id: 1, role: 'administrateur' as const }
const redaction = { id: 2, role: 'redaction' as const, acces: PREREGLAGES.redaction }
const vide = { id: 3, role: 'personnalise' as const, acces: {} }

describe('permissions', () => {
  it('3 comptes au plus : l’administrateur et 2 comptes limités', () => {
    expect(MAX_COMPTES).toBe(3)
  })

  it('l’administrateur a tous les accès, quel que soit son réglage', () => {
    for (const m of MODULES) expect(niveau({ ...admin, acces: { [m.cle]: 'aucun' } }, m.cle)).toBe('modification')
  })

  it('sans compte ou sans réglage : aucun accès', () => {
    expect(niveau(null, 'actualites')).toBe('aucun')
    expect(peutLire(vide, 'messages')).toBe(false)
    expect(peutEnvoyerMedia(vide)).toBe(false)
  })

  it('un compte limité suit son niveau par module', () => {
    expect(peutModifier(redaction, 'actualites')).toBe(true)
    expect(peutLire(redaction, 'organigramme')).toBe(true)
    expect(peutModifier(redaction, 'organigramme')).toBe(false)
    expect(peutLire(redaction, 'messages')).toBe(false)
    expect(peutLire(redaction, 'reglages')).toBe(false)
  })

  it('envoi de photos : dès qu’un module est en modification', () => {
    expect(peutEnvoyerMedia(redaction)).toBe(true)
    expect(peutEnvoyerMedia({ role: 'personnalise', acces: { messages: 'modification' } })).toBe(true)
    expect(peutEnvoyerMedia({ role: 'personnalise', acces: { messages: 'lecture' } })).toBe(false)
  })

  it('chaque rôle type règle tous les modules', () => {
    for (const reglage of Object.values(PREREGLAGES)) expect(Object.keys(reglage).sort()).toEqual(MODULES.map((m) => m.cle).sort())
  })
})
