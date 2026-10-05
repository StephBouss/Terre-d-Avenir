import Image from 'next/image'
import type { Media } from '@/payload-types'

type Props = {
  media?: Media | number | null
  className?: string
  sizes?: string
  eager?: boolean
  fill?: boolean
  decorative?: boolean
}

export function MediaImage({ media, className = '', sizes = '100vw', eager = false, fill = false, decorative = false }: Props) {
  if (!media || typeof media === 'number' || !media.url) {
    return <div className={`media-fallback ${className}`} aria-hidden="true" />
  }
  const alt = decorative || media.provisoire ? '' : (media.alt ?? '')
  const loading = eager ? 'eager' : 'lazy'
  const fetchPriority = eager ? 'high' : undefined
  if (fill) {
    return <Image src={media.url} alt={alt} fill sizes={sizes} loading={loading} fetchPriority={fetchPriority} className={className} />
  }
  return (
    <Image
      src={media.url}
      alt={alt}
      width={media.width ?? 1600}
      height={media.height ?? 900}
      sizes={sizes}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
    />
  )
}
