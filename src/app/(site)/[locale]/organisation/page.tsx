import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PreviewBanner from '@/components/layout/PreviewBanner'
import Organigramme from '@/components/organisation/Organigramme'
import ContentSection from '@/components/ui/ContentSection'
import FaqList from '@/components/ui/FaqList'
import PageHero from '@/components/ui/PageHero'
import { getPage, getPostes, isPreviewing } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { construireArbre } from '@/lib/organigramme'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'

const metadataPublique = metadataFor('organisation', '/organisation')

/** En aperçu, la page montre des brouillons : elle ne doit être indexée par aucun moteur. */
export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  const metadata = await metadataPublique(props)
  return (await isPreviewing()) ? { ...metadata, robots: { index: false, follow: false } } : metadata
}

export default async function OrganisationPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const preview = await isPreviewing()
  const [page, postes] = await Promise.all([getPage('organisation', locale), getPostes(locale, preview)])
  if (!page) notFound()
  // La section « organigramme » (texte) est remplacée par le composant : seul son intitulé est repris.
  const intitule = getSection(page, 'organigramme')?.heading
  return (
    <>
      {preview && (
        <PreviewBanner label={dict.preview.banner} exitLabel={dict.preview.exit} exitHref={`/api/apercu/fin?path=${encodeURIComponent(`/${locale}/organisation`)}`} />
      )}
      <PageHero eyebrow={dict.nav.organisation} title={page.h1 ?? ''} intro={page.intro} image={page.heroImage} />
      <Organigramme titre={intitule && !isPlaceholder(intitule) ? intitule : dict.organigramme.titre} noeuds={construireArbre(postes)} labels={dict.organigramme} />
      <ContentSection locale={locale} section={getSection(page, 'demarche')} tone="light" newTabLabel={dict.common.newTab} />
      <section className="bg-background py-20">
        <div className="max-w-[880px] mx-auto px-6">
          <FaqList section={getSection(page, 'faq')} />
        </div>
      </section>
    </>
  )
}
