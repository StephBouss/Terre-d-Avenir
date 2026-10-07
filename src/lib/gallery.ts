import type { GalleryItem } from '@/components/media/Gallery'
import type { Media } from '@/payload-types'
import { isPlaceholder } from './text'

export function toGalleryItems(medias: (number | Media | null | undefined)[]): GalleryItem[] {
  return medias
    .filter((m): m is Media => typeof m === 'object' && m !== null && Boolean(m.url))
    .map((m) => ({
      id: m.id,
      url: m.url!,
      alt: m.provisoire ? '' : (m.alt ?? ''),
      caption: isPlaceholder(m.caption) ? null : m.caption,
      width: m.width ?? 1600,
      height: m.height ?? 900,
    }))
}
