'use client'

import { useConfig } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import './redirection-apres-enregistrement.css'

type Confirmation = { titre: string; detail: string; cle: number }

type Libelle = string | Record<string, string> | undefined
const texte = (l: Libelle, repli: string) => (typeof l === 'string' ? l : (l?.fr ?? Object.values(l ?? {})[0] ?? repli))

/**
 * Après toute validation réussie d’un formulaire de l’admin (création, modification, publication, brouillon),
 * renvoie vers la page suivante : la liste de la collection, ou le tableau de bord pour les réglages et « Mon compte ».
 * Un bandeau y confirme l’action. Les enregistrements faits depuis un tiroir (ex. ajout d’une photo pendant la
 * rédaction d’une page) ne déclenchent rien : la requête doit viser le document de la page affichée.
 */
export default function RedirectionApresEnregistrement({ children }: { children?: ReactNode }) {
  const { config } = useConfig()
  const router = useRouter()
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)

  useEffect(() => {
    const fetchOriginal = window.fetch
    window.fetch = async (input, init) => {
      const page = window.location.pathname
      const reponse = await fetchOriginal(input, init)
      try {
        const methode = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
        if (reponse.ok && (methode === 'POST' || methode === 'PATCH')) {
          const url = new URL(typeof input === 'string' || input instanceof URL ? input.toString() : input.url, window.location.origin)
          const cible = destination(page, url, methode, config)
          if (cible) {
            const json = (await reponse.clone().json().catch(() => ({}))) as { doc?: Record<string, unknown>; result?: Record<string, unknown> }
            const doc = json.doc ?? json.result ?? (json as Record<string, unknown>)
            const action = cible.brouillons
              ? doc?._status === 'published'
                ? 'Publication effectuée'
                : 'Brouillon enregistré'
              : cible.creation
                ? 'Création enregistrée'
                : 'Modifications enregistrées'
            const nom = cible.titreChamp && doc?.[cible.titreChamp] ? String(doc[cible.titreChamp]) : ''
            // Laisse Payload finir son propre traitement (message, redirection vers le nouveau document) avant de partir.
            window.setTimeout(() => {
              setConfirmation({ titre: action, detail: nom ? `${cible.libelle} : « ${nom} »` : cible.libelle, cle: Date.now() })
              router.push(cible.href)
            }, 600)
          }
        }
      } catch {
        // La redirection est un confort : une erreur ici ne doit jamais casser l’enregistrement.
      }
      return reponse
    }
    return () => {
      window.fetch = fetchOriginal
    }
  }, [router, config])

  useEffect(() => {
    if (!confirmation) return
    const t = window.setTimeout(() => setConfirmation(null), 7000)
    return () => window.clearTimeout(t)
  }, [confirmation])

  return (
    <>
      {children}
      {confirmation && (
        <div key={confirmation.cle} className="ta-confirmation" role="status" data-confirmation>
          <span className="ta-confirmation-icone" aria-hidden="true">
            ✓
          </span>
          <span className="ta-confirmation-texte">
            <strong>{confirmation.titre}</strong>
            <span>{confirmation.detail}</span>
          </span>
          <button type="button" className="ta-confirmation-fermer" aria-label="Fermer" onClick={() => setConfirmation(null)}>
            ×
          </button>
        </div>
      )}
    </>
  )
}

type ConfigClient = ReturnType<typeof useConfig>['config']

/** Page suivante pour une requête d’enregistrement, si elle porte sur le document affiché ; sinon null. */
function destination(page: string, url: URL, methode: string, config: ConfigClient) {
  const admin = config.routes.admin
  const api = config.routes.api
  if (!page.startsWith(admin) || !url.pathname.startsWith(`${api}/`)) return null
  const vue = page.slice(admin.length).split('/').filter(Boolean)
  const requete = url.pathname.slice(api.length).split('/').filter(Boolean)
  if (requete[0]?.startsWith('payload-')) return null

  // Réglages globaux : POST /api/globals/<slug> depuis /admin/globals/<slug>.
  if (vue[0] === 'globals' && vue.length === 2 && requete[0] === 'globals' && requete[1] === vue[1] && requete.length === 2) {
    const g = config.globals.find((x) => x.slug === vue[1])
    return { href: admin, libelle: texte(g?.label as Libelle, vue[1]), titreChamp: undefined, creation: false, brouillons: false }
  }

  // Mon compte : PATCH /api/<collection des comptes>/<id> depuis /admin/account.
  if (vue.length === 1 && vue[0] === 'account' && requete.length === 2 && requete[0] === config.admin.user && methode === 'PATCH') {
    return { href: admin, libelle: 'Mon compte', titreChamp: undefined, creation: false, brouillons: false }
  }

  // Documents : POST /api/<slug> (création) ou PATCH /api/<slug>/<id> (modification) depuis la page du document.
  if (vue[0] !== 'collections' || vue.length !== 3 || requete[0] !== vue[1]) return null
  const creation = vue[2] === 'create'
  const correspond = creation ? requete.length === 1 && methode === 'POST' : requete.length === 2 && requete[1] === vue[2]
  if (!correspond) return null
  const c = config.collections.find((x) => x.slug === vue[1])
  const libelle = texte(c?.labels?.singular as Libelle, vue[1])
  const brouillons = Boolean(c?.versions && typeof c.versions === 'object' && c.versions.drafts)
  return { href: `${admin}/collections/${vue[1]}`, libelle, titreChamp: c?.admin?.useAsTitle, creation, brouillons }
}
