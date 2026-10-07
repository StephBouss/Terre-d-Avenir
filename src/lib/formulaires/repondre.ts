import { getPayload } from 'payload'
import config from '@payload-config'
import { ipDepuisEntetes, localeDepuisReferer } from './entetes'
import { LIMITEUR } from './limite'
import type { ReponseFormulaire, TypeFormulaire } from './schema'
import { traiterEnvoi } from './traitement'

const TAILLE_MAX = 20_000

const repondre = (corps: ReponseFormulaire, status: number) => Response.json(corps, { status, headers: { 'Cache-Control': 'no-store' } })

/** POST /api/formulaires/{type} : JSON uniquement (un formulaire tiers ne peut pas poster ici sans requête CORS préalable). */
export async function repondreFormulaire(type: TypeFormulaire, request: Request): Promise<Response> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) return repondre({ ok: false, erreur: 'requete' }, 415)
  const texte = await request.text()
  if (texte.length > TAILLE_MAX) return repondre({ ok: false, erreur: 'requete' }, 413)
  let corps: unknown
  try {
    corps = JSON.parse(texte)
  } catch {
    return repondre({ ok: false, erreur: 'requete' }, 400)
  }
  const payload = await getPayload({ config })
  try {
    const sortie = await traiterEnvoi({
      type,
      corps,
      ip: ipDepuisEntetes(request.headers),
      locale: localeDepuisReferer(request.headers.get('referer')),
      payload,
      limiteur: LIMITEUR,
    })
    return repondre(sortie.corps, sortie.status)
  } catch (error) {
    payload.logger.error({ err: error }, `Formulaire ${type} : enregistrement impossible`)
    return repondre({ ok: false, erreur: 'serveur' }, 500)
  }
}
