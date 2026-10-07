import type { CollectionConfig } from 'payload'
import { bloquerSuppressionParent, restaurerErreurValidation, validerRattachement } from '../hooks/postes'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'
import { PUBLISHED_POSTE } from '../lib/organigramme'
import { previewUrl } from '../lib/preview'
import { siteUrl } from '../lib/seo'

export const Postes: CollectionConfig = {
  slug: 'postes',
  typescript: { interface: 'Poste' },
  labels: { singular: 'Poste', plural: 'Organigramme' },
  admin: {
    useAsTitle: 'intitule',
    group: 'Contenus',
    defaultColumns: ['intitule', 'personneNom', 'parent', 'ordre', '_status'],
    listSearchableFields: ['intitule', 'personneNom'],
    description: 'Postes de l’organigramme, leurs titulaires et leurs rattachements. « Aperçu » montre la page Organisation avec les brouillons.',
    preview: (_doc, { locale }) =>
      process.env.PREVIEW_SECRET ? previewUrl(siteUrl(), `/${locale === 'en' ? 'en' : 'fr'}/organisation`, process.env.PREVIEW_SECRET) : null,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: ({ req }) => (req.user ? true : PUBLISHED_POSTE) },
  hooks: {
    beforeValidate: [validerRattachement],
    beforeDelete: [bloquerSuppressionParent],
    afterChange: [revalidateCollection],
    afterDelete: [revalidateCollectionDelete],
    afterError: [restaurerErreurValidation],
  },
  defaultSort: 'ordre',
  fields: [
    { name: 'intitule', label: 'Intitulé du poste', type: 'text', required: true, localized: true },
    { name: 'mission', label: 'Mission', type: 'textarea', localized: true, admin: { description: 'Une phrase courte.' } },
    {
      name: 'parent',
      label: 'Rattaché à',
      type: 'relationship',
      relationTo: 'postes',
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      admin: { description: 'Laisser vide pour le poste au sommet (une seule racine conseillée).' },
    },
    { name: 'ordre', label: 'Ordre', type: 'number', defaultValue: 0, admin: { description: 'Ordre parmi les postes rattachés au même parent : les plus petits d’abord.' } },
    { name: 'personneNom', label: 'Nom de la personne', type: 'text', admin: { description: 'Nom public, avec l’accord de la personne.' } },
    { name: 'personnePhoto', label: 'Portrait', type: 'upload', relationTo: 'medias' },
    { name: 'personneBio', label: 'Courte biographie', type: 'textarea', localized: true },
    { name: 'cle', type: 'text', unique: true, index: true, admin: { hidden: true } },
  ],
}
