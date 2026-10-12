import { repondreFormulaire } from '@/lib/formulaires/repondre'

export async function POST(request: Request): Promise<Response> {
  return repondreFormulaire('contact', request)
}
