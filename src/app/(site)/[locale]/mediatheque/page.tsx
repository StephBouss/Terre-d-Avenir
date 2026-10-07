import { notFound } from 'next/navigation'
import Gallery, { type GalleryItem } from '@/components/media/Gallery'
import MediathequeHero from '@/components/media/MediathequeHero'
import CtaBand from '@/components/ui/CtaBand'
import { Paragraphs } from '@/components/ui/Paragraphs'
import { getGalleryMedia, getPage } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'

export const generateMetadata = metadataFor('mediatheque', '/mediatheque')

export default async function MediathequePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, medias] = await Promise.all([getPage('mediatheque', locale), getGalleryMedia(locale)])
  if (!page) notFound()
  const items: GalleryItem[] = medias
    .filter((m) => m.url)
    .map((m) => ({
      id: m.id,
      url: m.url!,
      alt: m.provisoire ? '' : (m.alt ?? ''),
      caption: isPlaceholder(m.caption) ? null : m.caption,
      width: m.width ?? 1600,
      height: m.height ?? 900,
    }))
  const facebook = getSection(page, 'facebook')

  return (
    <>
      <MediathequeHero eyebrow={dict.nav.mediatheque} title={page.h1 ?? ''} intro={page.intro} image={page.heroImage} />
      <section className="bg-background py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          {items.length > 0 ? <Gallery items={items} labels={dict.gallery} /> : <Paragraphs text={getSection(page, 'vide')?.body} />}
        </div>
      </section>
      <CtaBand locale={locale} title={facebook?.heading} text={facebook?.body} ctas={facebook?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
