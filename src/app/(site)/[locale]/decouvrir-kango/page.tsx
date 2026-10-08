import { notFound } from 'next/navigation'
import Gallery from '@/components/media/Gallery'
import CtaBand from '@/components/ui/CtaBand'
import PageHero from '@/components/ui/PageHero'
import SectionHeader from '@/components/ui/SectionHeader'
import { getAlbum, getPage } from '@/lib/content'
import { toGalleryItems } from '@/lib/gallery'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { KANGO_ALBUM } from '@/lib/kango'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'

export const generateMetadata = metadataFor('decouvrir-kango', '/decouvrir-kango')

/** Découvrir Kango (tourisme) : présentation de la ville et photos de l’album « kango ». */
export default async function DecouvrirKangoPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, album] = await Promise.all([getPage('decouvrir-kango', locale), getAlbum(KANGO_ALBUM, locale)])
  if (!page) notFound()
  const galerie = getSection(page, 'galerie')
  const items = toGalleryItems(album?.photos ?? [])
  const fin = getSection(page, 'fin')
  return (
    <>
      <PageHero eyebrow={dict.nav.kango} title={page.h1 ?? ''} intro={page.intro} image={page.heroImage} />
      {items.length > 0 && (
        <section className="bg-background py-20">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
            {!isPlaceholder(galerie?.heading) && <SectionHeader title={galerie!.heading!} />}
            <Gallery items={items} labels={dict.gallery} />
          </div>
        </section>
      )}
      <CtaBand locale={locale} title={fin?.heading} text={fin?.body} ctas={fin?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
