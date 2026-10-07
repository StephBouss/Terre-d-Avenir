import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Gallery from '@/components/media/Gallery'
import MediathequeHero from '@/components/media/MediathequeHero'
import { Cta } from '@/components/ui/Cta'
import { Paragraphs } from '@/components/ui/Paragraphs'
import { getAlbum } from '@/lib/content'
import { toGalleryItems } from '@/lib/gallery'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { SITE_NAME, pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const album = await getAlbum(slug, locale)
  if (!album) return {}
  const image = typeof album.cover === 'object' ? album.cover?.url : undefined
  return pageMetadata({ locale, path: `/mediatheque/albums/${slug}`, title: `${album.title} — ${SITE_NAME}`, description: album.description, image })
}

export default async function AlbumPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const album = await getAlbum(slug, locale)
  if (!album) notFound()
  const dict = getDictionary(locale)
  return (
    <>
      <MediathequeHero eyebrow={dict.nav.mediatheque} title={album.title} intro={album.dateLabel} image={album.cover} />
      <section className="bg-background py-16">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
          <Paragraphs text={album.description} />
          <Gallery items={toGalleryItems(album.photos ?? [])} labels={dict.gallery} />
          <div>
            <Cta locale={locale} href="/mediatheque" label={dict.albums.back} variant="outline" newTabLabel={dict.common.newTab} />
          </div>
        </div>
      </section>
    </>
  )
}
