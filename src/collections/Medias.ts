import type { CollectionConfig } from 'payload'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const Medias: CollectionConfig = {
  slug: 'medias',
  typescript: { interface: 'Media' },
  labels: { singular: 'Média', plural: 'Médias' },
  admin: { useAsTitle: 'filename', defaultColumns: ['filename', 'galerie', 'provisoire'] },
  access: { read: () => true },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'card', width: 800 },
      { name: 'hero', width: 1920 },
    ],
  },
  fields: [
    { name: 'alt', label: 'Texte alternatif', type: 'text', localized: true, admin: { description: 'Décrit l’image. Laisser vide si elle est décorative.' } },
    { name: 'caption', label: 'Légende', type: 'text', localized: true },
    { name: 'credit', label: 'Crédit', type: 'text' },
    { name: 'galerie', label: 'Afficher dans la médiathèque', type: 'checkbox', defaultValue: false },
    { name: 'provisoire', label: 'Image provisoire (à remplacer)', type: 'checkbox', defaultValue: false, admin: { description: 'Une image provisoire est toujours affichée comme décorative.' } },
  ],
}
