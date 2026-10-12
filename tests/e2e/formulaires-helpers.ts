import { randomUUID } from 'node:crypto'
import { expect, type APIRequestContext } from '@playwright/test'

export type MessageApi = {
  id: number
  reference: string
  type: 'adhesion' | 'contact'
  nom: string
  locale: 'fr' | 'en'
  noticeVersion: string | null
  donnees: Record<string, unknown>
  emailEtat: 'envoye' | 'echec' | 'non_configure'
  emailErreur: string | null
  emailEnvoyeLe: string | null
  traite: boolean
}

/** IP fictive propre à un test : chaque test a son propre quota de 5 envois. */
export function ipAleatoire(): string {
  const n = () => Math.floor(Math.random() * 254) + 1
  return `10.${n()}.${n()}.${n()}`
}

export function envoyerFormulaire(request: APIRequestContext, type: 'adhesion' | 'contact', donnees: Record<string, unknown>, options: { ip?: string; referer?: string } = {}) {
  return request.post(`/api/formulaires/${type}`, {
    data: { cle: randomUUID(), ...donnees },
    headers: { 'X-Forwarded-For': options.ip ?? ipAleatoire(), ...(options.referer ? { Referer: options.referer } : {}) },
  })
}

export async function lireMessage(request: APIRequestContext, token: string, reference: string): Promise<MessageApi | undefined> {
  const res = await request.get(`/api/messages?where[reference][equals]=${encodeURIComponent(reference)}&depth=0`, { headers: { Authorization: `JWT ${token}` } })
  expect(res.ok(), await res.text()).toBe(true)
  return ((await res.json()).docs as MessageApi[])[0]
}

/** Supprime les messages de test d’une spec (préfixe propre à la spec, dans le nom). */
export async function purgerMessages(request: APIRequestContext, token: string, prefixe: string): Promise<void> {
  const headers = { Authorization: `JWT ${token}` }
  const res = await request.get(`/api/messages?where[nom][like]=${encodeURIComponent(prefixe)}&limit=200&depth=0`, { headers })
  expect(res.ok(), await res.text()).toBe(true)
  for (const doc of (await res.json()).docs as { id: number }[]) await request.delete(`/api/messages/${doc.id}`, { headers })
}
