import { notFound } from 'next/navigation'
import MissionStrip from '@/components/home/MissionStrip'
import ParticiperSection from '@/components/home/ParticiperSection'
import ThemesSection from '@/components/home/ThemesSection'
import OngHero from '@/components/ong/OngHero'
import ContentSection from '@/components/ui/ContentSection'
import { getPage, getProjets, getReglages } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('ong', '/ong')

export default async function OngPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const [page, projets, reglages] = await Promise.all([getPage('ong', locale), getProjets(locale), getReglages(locale)])
  if (!page) notFound()
  const section = (key: string) => getSection(page, key)
  return (
    <>
      <OngHero eyebrow={dict.nav.ong} title={page.h1 ?? ''} intro={page.intro} image={reglages.heroImages?.[2]} />
      <MissionStrip items={section('reperes')?.items ?? []} />
      <ContentSection locale={locale} section={section('ancrage')} newTabLabel={dict.common.newTab} />
      <ThemesSection locale={locale} section={section('engagements')} projets={projets} overline={dict.nav.projets} linkLabel={dict.common.learnMore} newTabLabel={dict.common.newTab} />
      <ContentSection locale={locale} section={section('demarche')} tone="light" newTabLabel={dict.common.newTab} />
      <ParticiperSection locale={locale} section={section('participer')} newTabLabel={dict.common.newTab} />
    </>
  )
}
