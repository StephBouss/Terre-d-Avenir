import Link from 'next/link'
import { MediaImage } from '@/components/ui/MediaImage'
import type { Locale } from '@/lib/i18n/config'
import { localizedHref } from '@/lib/i18n/paths'
import { isPlaceholder } from '@/lib/text'
import type { Album } from '@/payload-types'

type Props = { locale: Locale; album: Album; labels: { photos: string; photo: string } }

export default function AlbumCard({ locale, album, labels }: Props) {
  const count = album.photos?.length ?? 0
  const photosLabel = `${count} ${count > 1 ? labels.photos : labels.photo}`
  return (
    <Link
      href={localizedHref(locale, `/mediatheque/albums/${album.slug}`)}
      className="card-lift bg-background rounded-lg border border-border overflow-hidden flex flex-col"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div className="card-media" style={{ height: 196 }}>
        <MediaImage media={album.cover ?? album.photos?.[0]} decorative sizes="(min-width: 1024px) 400px, 100vw" className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex flex-col gap-1">
        <h3 className="text-base font-bold text-foreground leading-snug font-headings">
          <span className="title-underline">{album.title}</span>
        </h3>
        <p className="text-sm text-muted-foreground font-body">
          {!isPlaceholder(album.dateLabel) && <>{album.dateLabel} · </>}
          {photosLabel}
        </p>
      </div>
    </Link>
  )
}
