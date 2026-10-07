import { describe, expect, it } from 'vitest'
import { isSafePreviewPath, previewUrl } from '@/lib/preview'

describe('URL d’aperçu', () => {
  it('construit l’URL avec le chemin et le secret encodés', () => {
    expect(previewUrl('https://site.org', '/fr/actualites/a b', 's&1')).toBe(
      'https://site.org/api/apercu?path=%2Ffr%2Factualites%2Fa%20b&secret=s%261',
    )
  })
  it('n’accepte que des chemins internes localisés', () => {
    expect(isSafePreviewPath('/fr/actualites/x')).toBe(true)
    expect(isSafePreviewPath('/en/actualites/x')).toBe(true)
    expect(isSafePreviewPath('https://evil.com')).toBe(false)
    expect(isSafePreviewPath('//evil.com')).toBe(false)
    expect(isSafePreviewPath('/es/actualites/x')).toBe(false)
    expect(isSafePreviewPath('/fr/../admin')).toBe(false)
  })
})
