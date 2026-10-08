import { notFound } from 'next/navigation'
import AncrageSection from '@/components/home/AncrageSection'
import HeroSlider from '@/components/home/HeroSlider'
import MissionStrip from '@/components/home/MissionStrip'
import MotTeaser from '@/components/home/MotTeaser'
import NewsSection from '@/components/home/NewsSection'
import ParticiperSection from '@/components/home/ParticiperSection'
import ThemesSection from '@/components/home/ThemesSection'
import CtaBand from '@/components/ui/CtaBand'
import { getActualites, getDiaporama, getPage, getProjets } from '@/lib/content'
import { diapositives } from '@/lib/diaporama'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('accueil', '/')

export default async function HomePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, projets, actualites, { images, textes }] = await Promise.all([
    getPage('accueil', locale),
    getProjets(locale),
    getActualites(locale),
    getDiaporama(locale),
  ])
  if (!page) notFound()
  const section = (key: string) => getSection(page, key)
  const transparence = section('transparence')
  const newTab = dict.common.newTab

  return (
    <>
      <HeroSlider
        locale={locale}
        slides={diapositives(textes, { titre: page.h1 ?? '', texte: page.intro })}
        section={section('hero')}
        images={images}
        newTabLabel={newTab}
        pauseLabel={dict.hero.pause}
        playLabel={dict.hero.play}
      />
      <MissionStrip items={section('hero')?.items ?? []} />
      <AncrageSection locale={locale} section={section('ancrage')} image={images[2]} linkLabel={dict.nav.ong} newTabLabel={newTab} />
      <MotTeaser locale={locale} section={section('mot')} newTabLabel={newTab} />
      <ThemesSection locale={locale} section={section('engagements')} projets={projets} overline={dict.nav.projets} linkLabel={dict.common.learnMore} newTabLabel={newTab} />
      <NewsSection
        locale={locale}
        section={section('actualites')}
        actualites={actualites.slice(0, 3)}
        overline={dict.nav.actualites}
        labels={{ readArticle: dict.common.readArticle, newTab }}
      />
      <ParticiperSection locale={locale} section={section('participer')} newTabLabel={newTab} />
      <CtaBand locale={locale} title={transparence?.heading} text={transparence?.body} ctas={transparence?.ctas} newTabLabel={newTab} />
    </>
  )
}
