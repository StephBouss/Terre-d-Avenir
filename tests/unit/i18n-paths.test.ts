import { describe, expect, it } from 'vitest'
import { alternates, isActivePath, isExternal, localizedHref, stripLocale, switchLocale } from '@/lib/i18n/paths'

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
})
