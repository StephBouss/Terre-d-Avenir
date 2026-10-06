import { describe, expect, it } from 'vitest'
import { VISIBLE_ACTUALITE, isVisibleActualite } from '@/lib/actualites'

describe('visibilité d’une actualité', () => {
  it('publiée et non archivée : visible', () => {
    expect(isVisibleActualite({ _status: 'published', archivee: false })).toBe(true)
    expect(isVisibleActualite({ _status: 'published', archivee: null })).toBe(true)
  })
  it('brouillon : invisible', () => {
    expect(isVisibleActualite({ _status: 'draft', archivee: false })).toBe(false)
  })
  it('archivée : invisible même publiée', () => {
    expect(isVisibleActualite({ _status: 'published', archivee: true })).toBe(false)
  })
  it('le filtre Payload exprime la même règle', () => {
    expect(VISIBLE_ACTUALITE).toEqual({ and: [{ _status: { equals: 'published' } }, { archivee: { not_equals: true } }] })
  })
})
