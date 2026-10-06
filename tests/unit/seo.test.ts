import { describe, expect, it } from 'vitest'
import { pageMetadata } from '@/lib/seo'

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
