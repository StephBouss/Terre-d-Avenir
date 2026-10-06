import { describe, expect, it } from 'vitest'
import { buildSitemapEntries, pageMetadata } from '@/lib/seo'

describe('pageMetadata', () => {
  it('canonique, hreflang et Open Graph', () => {
    const meta = pageMetadata({ locale: 'en', path: '/contact', title: 'Contact — X', description: 'Desc' })
    expect(meta.title).toBe('Contact — X')
    expect(meta.description).toBe('Desc')
    expect(meta.alternates?.canonical).toBe('/en/contact')
    expect(meta.alternates?.languages).toEqual({ fr: '/fr/contact', en: '/en/contact', 'x-default': '/fr/contact' })
    expect(meta.openGraph).toMatchObject({ locale: 'en_GB', siteName: 'Terre d’Avenir KOMO-KANGO', url: '/en/contact' })
  })
  it('retire les astérisques d’emphase du titre', () => {
    expect(pageMetadata({ locale: 'fr', path: '/', title: 'A *b* c' }).title).toBe('A b c')
  })
})

describe('buildSitemapEntries', () => {
  it('une entrée par langue active, avec alternates hreflang et x-default', () => {
    const entries = buildSitemapEntries('https://site.org', ['/', '/contact'])
    expect(entries.map((e) => e.url)).toEqual(['https://site.org/fr', 'https://site.org/en', 'https://site.org/fr/contact', 'https://site.org/en/contact'])
    expect(entries[2].alternates?.languages).toEqual({
      fr: 'https://site.org/fr/contact',
      en: 'https://site.org/en/contact',
      'x-default': 'https://site.org/fr/contact',
    })
  })
})
