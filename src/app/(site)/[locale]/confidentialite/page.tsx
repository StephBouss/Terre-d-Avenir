import TextPage from '@/components/ui/TextPage'
import { metadataFor, type LocaleParams } from '@/lib/page'

export const generateMetadata = metadataFor('confidentialite', '/confidentialite')

export default function ConfidentialitePage({ params }: LocaleParams) {
  return <TextPage slug="confidentialite" eyebrowKey="confidentialite" imageIndex={0} params={params} />
}
