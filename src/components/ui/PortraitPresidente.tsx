import type { Media } from '@/payload-types'
import Icon from './Icon'
import { MediaImage } from './MediaImage'
import QuoteMark from './QuoteMark'

/** Portrait de la Présidente (réglages du site), avec un guillemet en médaillon ; sans portrait, le guillemet seul. */
export default function PortraitPresidente({ portrait }: { portrait?: Media | number | null }) {
  if (!portrait || typeof portrait === 'number' || !portrait.url) return <QuoteMark />
  return (
    <figure data-portrait-presidente className="relative w-full max-w-[360px] aspect-square">
      <div className="relative w-full h-full rounded-lg overflow-hidden" style={{ border: '3px solid #E6BF58', background: '#003E2A' }}>
        <MediaImage media={portrait} fill sizes="(min-width: 1024px) 360px, 90vw" className="object-cover" />
      </div>
      <div
        className="absolute -bottom-5 right-3 sm:-right-5 w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: '#003E2A', border: '3px solid #E6BF58' }}
        aria-hidden="true"
      >
        <Icon i="quote" size={26} style={{ color: '#E6BF58' }} />
      </div>
    </figure>
  )
}
