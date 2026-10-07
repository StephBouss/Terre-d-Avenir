import { notFound } from 'next/navigation'
import ContentSection from '@/components/ui/ContentSection'
import FaqList from '@/components/ui/FaqList'
import PageHero from '@/components/ui/PageHero'
import { getPage } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { metadataFor, resolveLocale, type LocaleParams } from '@/lib/page'
import { getSection } from '@/lib/sections'

export const generateMetadata = metadataFor('organisation', '/organisation')

export default async function OrganisationPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const page = await getPage('organisation', locale)
  if (!page) notFound()
  return (
    <>
      <PageHero eyebrow={dict.nav.organisation} title={page.h1 ?? ''} intro={page.intro} image={page.heroImage} />
      <ContentSection locale={locale} section={getSection(page, 'organigramme')} newTabLabel={dict.common.newTab} />
      <ContentSection locale={locale} section={getSection(page, 'demarche')} tone="light" newTabLabel={dict.common.newTab} />
      <section className="bg-background py-20">
        <div className="max-w-[880px] mx-auto px-6">
          <FaqList section={getSection(page, 'faq')} />
        </div>
      </section>
    </>
  )
}
