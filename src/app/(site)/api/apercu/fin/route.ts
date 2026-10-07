import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { isSafePreviewPath } from '@/lib/preview'

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') ?? '/fr'
  ;(await draftMode()).disable()
  redirect(isSafePreviewPath(path) ? path : '/fr')
}
