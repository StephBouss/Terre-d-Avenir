import type { CollectionConfig } from 'payload'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const Albums: CollectionConfig = {
  slug: 'albums',
  typescript: { interface: 'Album' },
  labels: { singular: 'Album', plural: 'Albums' },
  admin: { useAsTitle: 'title', group: 'Images', defaultColumns: ['title', '_status', 'dateLabel', 'order'] },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }) },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] },
  defaultSort: 'order',
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { description: 'Adresse de l’album : /mediatheque/albums/<slug>' } },
    { name: 'order', label: 'Ordre', type: 'number', required: true, defaultValue: 0 },
    { name: 'date', label: 'Date (tri, facultatif)', type: 'date' },
    { name: 'dateLabel', label: 'Date affichée', type: 'text', localized: true },
    { name: 'description', label: 'Description', type: 'textarea', localized: true },
    { name: 'cover', label: 'Photo de couverture', type: 'upload', relationTo: 'medias' },
    { name: 'photos', label: 'Photos', type: 'upload', relationTo: 'medias', hasMany: true, required: true, minRows: 1, admin: { description: 'Glisser pour réordonner.' } },
  ],
}
