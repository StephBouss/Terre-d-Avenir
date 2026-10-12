import type { CollectionConfig } from 'payload'
import { accesCollection, masquerSansAcces } from '../access/modules'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const PROJET_ICONS = ['graduation-cap', 'heart-pulse', 'trophy', 'handshake'] as const

export const Projets: CollectionConfig = {
  slug: 'projets',
  typescript: { interface: 'Projet' },
  labels: { singular: 'Projet', plural: 'Projets & actions' },
  admin: { hidden: masquerSansAcces('projets'), useAsTitle: 'theme', group: 'Contenus', defaultColumns: ['theme', 'title', 'order'] },
  access: accesCollection('projets'),
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] },
  defaultSort: 'order',
  fields: [
    { name: 'theme', label: 'Thème', type: 'text', required: true, localized: true },
    { name: 'title', label: 'Titre', type: 'text', localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'order', label: 'Ordre', type: 'number', required: true, defaultValue: 0 },
    { name: 'icon', label: 'Icône', type: 'select', options: PROJET_ICONS.map((value) => ({ label: value, value })) },
    { name: 'summary', label: 'Résumé (accueil)', type: 'textarea', localized: true },
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
  ],
}
