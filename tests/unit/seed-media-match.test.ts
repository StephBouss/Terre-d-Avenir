import { describe, expect, it } from 'vitest'
import { isSeedMediaFilename } from '@/seed/media-match'

describe('isSeedMediaFilename', () => {
  it.each(['banner.jpg', 'banner-1.jpg', 'banner-12.jpg'])('accepte %s', (name) => {
    expect(isSeedMediaFilename(name, 'banner', '.jpg')).toBe(true)
  })
  it.each(['transport-2024.jpg', 'mental-health-day.jpg', 'banner-old.jpg', 'my-banner-1.jpg', 'banner-1.png', 'banner-1.jpg.bak'])('refuse %s', (name) => {
    expect(isSeedMediaFilename(name, 'banner', '.jpg')).toBe(false)
  })
  it('refuse les clés génériques dans un nom étranger', () => {
    expect(isSeedMediaFilename('transport-2024.jpg', 'sport', '.jpg')).toBe(false)
    expect(isSeedMediaFilename('mental-health-day.jpg', 'health', '.jpg')).toBe(false)
  })
  it('refuse un nom vide', () => {
    expect(isSeedMediaFilename(null, 'banner', '.jpg')).toBe(false)
  })
})
