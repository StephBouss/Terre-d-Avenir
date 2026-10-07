import { describe, expect, it } from 'vitest'
import { isPublishedAlbum } from '@/lib/albums'

describe('album publié', () => {
  it('un album publié (peuplé) est reconnu', () => {
    expect(isPublishedAlbum({ id: 1, _status: 'published' } as never)).toBe(true)
  })
  it('un brouillon, un identifiant non peuplé ou une absence ne sont pas reconnus', () => {
    expect(isPublishedAlbum({ id: 1, _status: 'draft' } as never)).toBe(false)
    expect(isPublishedAlbum(3)).toBe(false)
    expect(isPublishedAlbum(null)).toBe(false)
    expect(isPublishedAlbum(undefined)).toBe(false)
  })
})
