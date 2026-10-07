import type { CollectionConfig } from 'payload'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const Medias: CollectionConfig = {
  slug: 'medias',
  typescript: { interface: 'Media' },
  labels: { singular: 'Photo', plural: 'Médiathèque' },
  admin: {
    useAsTitle: 'filename',
    group: 'Images',
    defaultColumns: ['filename', 'galerie', 'provisoire', 'droitsConfirmes', 'ordre'],
    listSearchableFields: ['filename', 'alt', 'caption', 'credit'],
  },
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
    { name: 'ordre', label: 'Ordre d’affichage dans la médiathèque', type: 'number', defaultValue: 0, admin: { description: 'Les plus petits nombres s’affichent en premier.' } },
    { name: 'source', label: 'Source', type: 'text' },
    { name: 'lieu', label: 'Lieu (si documenté)', type: 'text', localized: true },
    { name: 'datePrise', label: 'Date de prise de vue (si documentée)', type: 'date' },
    { name: 'droitsConfirmes', label: 'Droits de diffusion confirmés', type: 'checkbox', defaultValue: false, admin: { description: 'Renseigne le dossier ; ne remplace pas une preuve de droits.' } },
    { name: 'droitsNote', label: 'Précisions sur les droits', type: 'textarea', access: { read: ({ req }) => Boolean(req.user) } },
  ],
}
