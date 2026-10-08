import type { PageSlug } from '@/collections/Pages'
import type { PROJET_ICONS } from '@/collections/Projets'

export type SeedImageKey = 'banner' | 'forest' | 'youth' | 'education' | 'sport' | 'health' | 'community' | 'solidarity'
export type SeedAlbumPhotoKey = `${'kafele' | 'tournoi' | 'rencontre' | 'bacheliers' | 'kango'}-${number}`
export type SeedCta = { label: string; href: string }
export type SeedItem = { title?: string; text?: string }
export type SeedSection = { key: string; eyebrow?: string; heading?: string; body?: string; items?: SeedItem[]; ctas?: SeedCta[] }
export type SeedPage = { slug: PageSlug; seoTitle: string; metaDescription: string; h1: string; intro?: string; sections: SeedSection[] }
export type SeedSource = { label: string; url: string }
export type SeedActualite = {
  slug: string
  order: number
  date?: string
  image?: SeedImageKey | SeedAlbumPhotoKey
  album?: string
  title: string
  category: string
  dateLabel: string
  excerpt: string
  body?: string
  source: SeedSource
}
export type SeedAlbum = {
  slug: string
  order: number
  date?: string
  cover: SeedAlbumPhotoKey
  photos: SeedAlbumPhotoKey[]
  title: string
  dateLabel: string
  description: string
}
export type SeedProjet = {
  slug: string
  order: number
  icon: (typeof PROJET_ICONS)[number]
  image?: SeedImageKey
  theme: string
  title: string
  summary: string
  body: string
  source: SeedSource
}
export type SeedReglages = { location: string; footerTagline: string }
/** Texte d’une diapositive du diaporama d’accueil (dans l’ordre des images). */
export type SeedDiapositive = { titre: string; texte: string }
export type LocaleContent = { pages: SeedPage[]; albums: SeedAlbum[]; actualites: SeedActualite[]; projets: SeedProjet[]; reglages: SeedReglages; diaporama: SeedDiapositive[] }
