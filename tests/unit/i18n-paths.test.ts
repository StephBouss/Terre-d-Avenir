import { describe, expect, it } from 'vitest'
import { alternates, isActivePath, isExternal, isFacebookUrl, localizedHref, opensInNewTab, stripLocale, switchLocale } from '@/lib/i18n/paths'

describe('chemins localisés', () => {
  it('préfixe les chemins internes', () => {
    expect(localizedHref('fr', '/')).toBe('/fr')
    expect(localizedHref('en', '/contact#partenariat')).toBe('/en/contact#partenariat')
    expect(localizedHref('fr', '/actualites/un-jeune-un-permis')).toBe('/fr/actualites/un-jeune-un-permis')
  })
  it('laisse intacts les liens externes et les ancres', () => {
    expect(localizedHref('fr', 'https://www.facebook.com/x')).toBe('https://www.facebook.com/x')
    expect(localizedHref('fr', 'mailto:a@b.c')).toBe('mailto:a@b.c')
    expect(localizedHref('fr', '#partenariat')).toBe('#partenariat')
    expect(isExternal('https://gabonofficiel.com')).toBe(true)
    expect(isExternal('/contact')).toBe(false)
  })
  it('retire la langue d’un chemin', () => {
    expect(stripLocale('/en/contact')).toBe('/contact')
    expect(stripLocale('/fr')).toBe('/')
    expect(stripLocale('/fr/')).toBe('/')
  })
  it('change de langue en gardant la page', () => {
    expect(switchLocale('/fr/actualites/un-jeune-un-permis', 'en')).toBe('/en/actualites/un-jeune-un-permis')
    expect(switchLocale('/fr', 'en')).toBe('/en')
    expect(switchLocale('/en/contact', 'fr')).toBe('/fr/contact')
  })
  it('construit les alternates hreflang', () => {
    expect(alternates('/contact')).toEqual({ fr: '/fr/contact', en: '/en/contact', 'x-default': '/fr/contact' })
    expect(alternates('/')).toEqual({ fr: '/fr', en: '/en', 'x-default': '/fr' })
  })
  it('détecte la rubrique active', () => {
    expect(isActivePath('/actualites/un-jeune-un-permis', '/actualites')).toBe(true)
    expect(isActivePath('/actualites', '/actualites')).toBe(true)
    expect(isActivePath('/ong', '/organisation')).toBe(false)
    expect(isActivePath('/', '/ong')).toBe(false)
  })
  it('opensInNewTab ne concerne que http(s)', () => {
    expect(opensInNewTab('https://a.org')).toBe(true)
    expect(opensInNewTab('http://a.org')).toBe(true)
    expect(opensInNewTab('mailto:a@b.org')).toBe(false)
    expect(opensInNewTab('tel:+237600000000')).toBe(false)
    expect(opensInNewTab('/contact')).toBe(false)
    expect(opensInNewTab('#haut')).toBe(false)
  })
  it('isFacebookUrl vérifie le nom d’hôte', () => {
    expect(isFacebookUrl('https://facebook.com/x')).toBe(true)
    expect(isFacebookUrl('https://www.facebook.com/x')).toBe(true)
    expect(isFacebookUrl('https://m.facebook.com/x')).toBe(true)
    expect(isFacebookUrl('https://evil.com/facebook.com')).toBe(false)
    expect(isFacebookUrl('https://notfacebook.com/')).toBe(false)
    expect(isFacebookUrl('/facebook.com')).toBe(false)
    expect(isFacebookUrl('not a url')).toBe(false)
  })
})
