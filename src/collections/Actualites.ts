import type { CollectionConfig } from 'payload'
import { VISIBLE_ACTUALITE } from '../lib/actualites'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const Actualites: CollectionConfig = {
  slug: 'actualites',
  typescript: { interface: 'Actualite' },
  labels: { singular: 'Actualité', plural: 'Actualités' },
  admin: {
    useAsTitle: 'title',
    group: 'Contenus',
    defaultColumns: ['title', '_status', 'archivee', 'dateLabel', 'updatedAt'],
    listSearchableFields: ['title', 'excerpt'],
  },
  versions: { drafts: true, maxPerDoc: 50 },
  access: { read: ({ req }) => (req.user ? true : VISIBLE_ACTUALITE) },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] },
  defaultSort: 'order',
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'order', label: 'Ordre', type: 'number', required: true, defaultValue: 0 },
    { name: 'category', label: 'Catégorie', type: 'text', localized: true },
    { name: 'dateLabel', label: 'Date affichée', type: 'text', localized: true, admin: { description: 'Ex. « 8 août 2026 » ou « Initiative publiée ».' } },
    { name: 'date', label: 'Date (tri, facultatif)', type: 'date' },
    { name: 'excerpt', label: 'Résumé', type: 'textarea', localized: true },
    { name: 'body', label: 'Texte', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'medias' },
    {
      name: 'source',
      type: 'group',
      fields: [
        { name: 'label', label: 'Libellé du lien', type: 'text', localized: true },
        { name: 'url', label: 'URL', type: 'text' },
      ],
    },
    {
      name: 'archivee',
      label: 'Archivée',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Retire l’actualité du site sans la supprimer. Prend effet après « Publier les modifications ».' },
    },
  ],
}
