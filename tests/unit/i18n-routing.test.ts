import { describe, expect, it } from 'vitest'
import { decideRoute } from '@/lib/i18n/routing'

describe('decideRoute', () => {
  it('redirige la racine vers la langue par défaut', () => {
    expect(decideRoute('/')).toEqual({ action: 'redirect', location: '/fr' })
  })
  it('laisse passer les langues actives', () => {
    expect(decideRoute('/fr')).toEqual({ action: 'next' })
    expect(decideRoute('/en/contact')).toEqual({ action: 'next' })
  })
  it('préfixe les anciens chemins sans langue', () => {
    expect(decideRoute('/contact')).toEqual({ action: 'redirect', location: '/fr/contact' })
    expect(decideRoute('/ong')).toEqual({ action: 'redirect', location: '/fr/ong' })
  })
  it('réécrit une langue prévue vers la page « langue indisponible »', () => {
    expect(decideRoute('/es/contact')).toEqual({ action: 'rewrite', location: '/fr/langue-indisponible?lang=es' })
    expect(decideRoute('/zh-Hans')).toEqual({ action: 'rewrite', location: '/fr/langue-indisponible?lang=zh-Hans' })
  })
  it('ignore l’admin, l’API, les assets et les fichiers', () => {
    for (const p of ['/admin', '/admin/collections/pages', '/api/pages', '/_next/static/a.js', '/favicon.ico', '/sitemap.xml', '/robots.txt', '/brand/logo-couleur.png']) {
      expect(decideRoute(p)).toEqual({ action: 'next' })
    }
  })
})
