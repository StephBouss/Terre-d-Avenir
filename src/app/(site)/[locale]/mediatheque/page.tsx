import { notFound } from 'next/navigation'
import AlbumCard from '@/components/media/AlbumCard'
import Gallery from '@/components/media/Gallery'
import MediathequeHero from '@/components/media/MediathequeHero'
import { RevealGroup } from '@/components/motion/RevealGroup'
import CtaBand from '@/components/ui/CtaBand'
import { Paragraphs } from '@/components/ui/Paragraphs'
import SectionHeader from '@/components/ui/SectionHeader'
import { getAlbums, getGalleryMedia, getPage } from '@/lib/content'
import { toGalleryItems } from '@/lib/gallery'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('mediatheque', '/mediatheque')

export default async function MediathequePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, medias, albums] = await Promise.all([getPage('mediatheque', locale), getGalleryMedia(locale), getAlbums(locale)])
  if (!page) notFound()
  const items = toGalleryItems(medias)
  const facebook = getSection(page, 'facebook')

  return (
    <>
      <MediathequeHero eyebrow={dict.nav.mediatheque} title={page.h1 ?? ''} intro={page.intro} image={page.heroImage} />
      <section className="bg-background py-16">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-12">
          {albums.length > 0 && (
            <div className="flex flex-col gap-8">
              <SectionHeader title={dict.albums.heading} />
              <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                  <AlbumCard key={album.id} locale={locale} album={album} labels={dict.albums} />
                ))}
              </RevealGroup>
            </div>
          )}
          {items.length > 0 ? (
            <div className="flex flex-col gap-8">
              {albums.length > 0 && <SectionHeader title={dict.albums.loosePhotos} />}
              <Gallery items={items} labels={dict.gallery} />
            </div>
          ) : (
            albums.length === 0 && <Paragraphs text={getSection(page, 'vide')?.body} />
          )}
        </div>
      </section>
      <CtaBand locale={locale} title={facebook?.heading} text={facebook?.body} ctas={facebook?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
