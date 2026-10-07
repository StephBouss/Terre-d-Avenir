import TextPage from '@/components/ui/TextPage'
import { metadataFor, type LocaleParams } from '@/lib/page'

export const generateMetadata = metadataFor('partenariats', '/partenariats')

export default function PartenariatsPage({ params }: LocaleParams) {
  return <TextPage slug="partenariats" eyebrowKey="partenariats" params={params} />
}
