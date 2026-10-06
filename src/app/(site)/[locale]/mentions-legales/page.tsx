import TextPage from '@/components/ui/TextPage'
import { metadataFor, type LocaleParams } from '@/lib/page'

export const generateMetadata = metadataFor('mentions-legales', '/mentions-legales')

export default function MentionsLegalesPage({ params }: LocaleParams) {
  return <TextPage slug="mentions-legales" eyebrowKey="mentions" imageIndex={0} params={params} />
}
