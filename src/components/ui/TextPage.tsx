import { notFound } from 'next/navigation'
import type { PageSlug } from '@/collections/Pages'
import { getPage } from '@/lib/content'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { resolveLocale } from '@/lib/page'
import type { NavKey } from '@/lib/routes'
import ContentSection from './ContentSection'
import CtaBand from './CtaBand'
import PageHero from './PageHero'

type Props = { slug: PageSlug; eyebrowKey: NavKey; params: Promise<{ locale: string }> }

/** Page composée : hero + sections alternées ; une section « fin » devient la bande d'appel finale. */
export default async function TextPage({ slug, eyebrowKey, params }: Props) {
  const locale = await resolveLocale(params)
  const dict = getDictionary(locale)
  const page = await getPage(slug, locale)
  if (!page) notFound()
  const sections = (page.sections ?? []).filter((s) => s.key !== 'fin')
  const fin = page.sections?.find((s) => s.key === 'fin')
  return (
    <>
      <PageHero eyebrow={dict.nav[eyebrowKey]} title={page.h1 ?? ''} intro={page.intro} image={page.heroImage} />
      {sections.map((section, i) => (
        <ContentSection key={section.id ?? section.key} locale={locale} section={section} tone={i % 2 === 0 ? 'white' : 'light'} newTabLabel={dict.common.newTab} />
      ))}
      <CtaBand locale={locale} title={fin?.heading} text={fin?.body} ctas={fin?.ctas} newTabLabel={dict.common.newTab} />
    </>
  )
}
