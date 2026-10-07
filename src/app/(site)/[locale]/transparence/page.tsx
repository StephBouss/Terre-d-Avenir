import TextPage from '@/components/ui/TextPage'
import { metadataFor, type LocaleParams } from '@/lib/page'

export const generateMetadata = metadataFor('transparence', '/transparence')

export default function TransparencePage({ params }: LocaleParams) {
  return <TextPage slug="transparence" eyebrowKey="transparence" params={params} />
}
