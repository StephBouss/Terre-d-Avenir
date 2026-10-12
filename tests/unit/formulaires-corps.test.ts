import { describe, expect, it } from 'vitest'
import { TAILLE_MAX, lireCorpsJson } from '@/lib/formulaires/corps'

const post = (body: BodyInit | null, headers: Record<string, string> = { 'content-type': 'application/json' }) =>
  new Request('http://localhost/api/formulaires/contact', { method: 'POST', body, headers, ...(body instanceof ReadableStream ? { duplex: 'half' } : {}) } as RequestInit)

function flux(morceaux: Uint8Array[]): ReadableStream<Uint8Array> {
  let i = 0
  return new ReadableStream({
    pull(controller) {
      if (i < morceaux.length) controller.enqueue(morceaux[i++])
      else controller.close()
    },
  })
}

describe('lecture du corps JSON', () => {
  it('JSON valide, paramètres de type de contenu tolérés', async () => {
    expect(await lireCorpsJson(post('{"a":1}', { 'content-type': 'Application/JSON; charset=utf-8' }))).toEqual({ ok: true, corps: { a: 1 } })
  })
  it('type de contenu strict : « text/plain;application/json » est refusé (415)', async () => {
    expect(await lireCorpsJson(post('{"a":1}', { 'content-type': 'text/plain;application/json' }))).toEqual({ ok: false, status: 415 })
    expect(await lireCorpsJson(post('{}', {}))).toEqual({ ok: false, status: 415 })
  })
  it('JSON mal formé : 400', async () => {
    expect(await lireCorpsJson(post('{oups'))).toEqual({ ok: false, status: 400 })
  })
  it('content-length trop grand : 413 sans lire le corps', async () => {
    const req = post('{}', { 'content-type': 'application/json', 'content-length': String(TAILLE_MAX + 1) })
    expect(await lireCorpsJson(req)).toEqual({ ok: false, status: 413 })
  })
  it('corps trop grand sans content-length (flux) : 413, lecture interrompue', async () => {
    let lus = 0
    const gros = new Uint8Array(TAILLE_MAX / 4)
    const source = new ReadableStream<Uint8Array>({
      pull(controller) {
        lus++
        controller.enqueue(gros)
        if (lus > 50) controller.close()
      },
    })
    const res = await lireCorpsJson(post(source))
    expect(res).toEqual({ ok: false, status: 413 })
    expect(lus).toBeLessThan(20)
  })
  it('corps juste à la limite accepté (flux)', async () => {
    const json = JSON.stringify({ m: 'x'.repeat(TAILLE_MAX - 8) })
    const octets = new TextEncoder().encode(json)
    expect(octets.length).toBe(TAILLE_MAX)
    const res = await lireCorpsJson(post(flux([octets.slice(0, 100), octets.slice(100)])))
    expect(res.ok).toBe(true)
  })
})
