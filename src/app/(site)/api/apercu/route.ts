import { timingSafeEqual } from 'node:crypto'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isSafePreviewPath } from '@/lib/preview'

function sameSecret(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? ''
  const secret = url.searchParams.get('secret') ?? ''
  const expected = process.env.PREVIEW_SECRET
  if (!expected || !sameSecret(secret, expected) || !isSafePreviewPath(path)) return new Response('Non autorisé', { status: 401 })

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Non autorisé', { status: 401 })

  ;(await draftMode()).enable()
  redirect(path)
}
