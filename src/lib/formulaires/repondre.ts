import { erreurSansDonnees } from './erreur'
import { getPayload } from 'payload'
import config from '@payload-config'
import { lireCorpsJson } from './corps'
import { ipDepuisEntetes, localeDepuisReferer } from './entetes'
import { LIMITEUR, LIMITEUR_GLOBAL } from './limite'
import type { ReponseFormulaire, TypeFormulaire } from './schema'
import { traiterEnvoi } from './traitement'

const repondre = (corps: ReponseFormulaire, status: number) => Response.json(corps, { status, headers: { 'Cache-Control': 'no-store' } })

/** POST /api/formulaires/{type} : JSON uniquement (un formulaire tiers ne peut pas poster ici sans requête CORS préalable). */
export async function repondreFormulaire(type: TypeFormulaire, request: Request): Promise<Response> {
  const lecture = await lireCorpsJson(request)
  if (!lecture.ok) return repondre({ ok: false, erreur: 'requete' }, lecture.status)
  const corps = lecture.corps
  const payload = await getPayload({ config })
  try {
    const sortie = await traiterEnvoi({
      type,
      corps,
      ip: ipDepuisEntetes(request.headers),
      locale: localeDepuisReferer(request.headers.get('referer')),
      payload,
      limiteur: LIMITEUR,
      limiteurGlobal: LIMITEUR_GLOBAL,
    })
    return repondre(sortie.corps, sortie.status)
  } catch (error) {
    payload.logger.error({ err: erreurSansDonnees(error) }, `Formulaire ${type} : enregistrement impossible`)
    return repondre({ ok: false, erreur: 'serveur' }, 500)
  }
}
