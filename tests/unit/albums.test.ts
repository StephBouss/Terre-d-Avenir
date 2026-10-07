import { describe, expect, it } from 'vitest'
import { toGalleryItems } from '@/lib/gallery'

const media = (over: Record<string, unknown>) => ({ id: 1, url: '/media/a.jpg', alt: 'Texte', caption: null, width: 800, height: 600, provisoire: false, ...over }) as never

describe('photos d’une galerie', () => {
  it('ignore les identifiants non peuplés et les médias sans URL', () => {
    expect(toGalleryItems([3, null, undefined, media({ url: null })])).toEqual([])
  })
  it('texte alternatif réel, décoratif si provisoire, légende brouillon masquée', () => {
    expect(toGalleryItems([media({ alt: 'Élèves', caption: '[à compléter]' }), media({ id: 2, provisoire: true, alt: 'X' })])).toEqual([
      { id: 1, url: '/media/a.jpg', alt: 'Élèves', caption: null, width: 800, height: 600 },
      { id: 2, url: '/media/a.jpg', alt: '', caption: null, width: 800, height: 600 },
    ])
  })
})
