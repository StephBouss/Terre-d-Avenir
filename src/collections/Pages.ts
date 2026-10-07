import type { CollectionConfig } from 'payload'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const PAGE_SLUGS = [
  'accueil',
  'ong',
  'mot-de-la-presidente',
  'organisation',
  'projets',
  'actualites',
  'adhesion',
  'mediatheque',
  'partenariats',
  'transparence',
  'contact',
  'confidentialite',
  'mentions-legales',
] as const
export type PageSlug = (typeof PAGE_SLUGS)[number]

const EMPTY_HINT = 'Laisser vide tant que le texte n’est pas validé : un champ vide est masqué sur le site.'

export const Pages: CollectionConfig = {
  slug: 'pages',
  typescript: { interface: 'Page' },
  labels: { singular: 'Page', plural: 'Pages' },
  admin: { useAsTitle: 'slug', group: 'Contenus', defaultColumns: ['slug', 'h1', 'updatedAt'] },
  access: { read: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] },
  fields: [
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: PAGE_SLUGS.map((value) => ({ label: value, value })),
    },
    { name: 'seoTitle', label: 'Titre SEO', type: 'text', localized: true },
    { name: 'metaDescription', label: 'Méta-description', type: 'textarea', localized: true },
    {
      name: 'h1',
      label: 'Titre principal (H1)',
      type: 'text',
      localized: true,
      admin: { description: 'Entourer un passage de *astérisques* pour le mettre en doré.' },
    },
    { name: 'intro', label: 'Introduction', type: 'textarea', localized: true, admin: { description: EMPTY_HINT } },
    {
      name: 'heroImage',
      label: 'Image d’en-tête',
      type: 'upload',
      relationTo: 'medias',
      admin: { description: 'Photo affichée en haut de la page. Vide : fond vert de la charte. (Sans effet sur l’accueil, qui utilise le diaporama.)' },
    },
    {
      name: 'sections',
      type: 'array',
      localized: true,
      admin: { initCollapsed: true },
      fields: [
        { name: 'key', label: 'Clé technique', type: 'text', required: true, admin: { description: 'Ne pas modifier : utilisée par la mise en page.' } },
        { name: 'eyebrow', label: 'Surtitre', type: 'text' },
        { name: 'heading', label: 'Titre', type: 'text' },
        { name: 'body', label: 'Texte', type: 'textarea', admin: { description: `Paragraphes séparés par une ligne vide. ${EMPTY_HINT}` } },
        {
          name: 'items',
          label: 'Éléments',
          type: 'array',
          fields: [
            { name: 'title', label: 'Titre', type: 'text' },
            { name: 'text', label: 'Texte', type: 'textarea' },
          ],
        },
        {
          name: 'ctas',
          label: 'Boutons',
          type: 'array',
          fields: [
            { name: 'label', label: 'Libellé', type: 'text', required: true },
            { name: 'href', label: 'Lien', type: 'text', required: true, admin: { description: 'Chemin interne sans langue (ex. /adhesion) ou URL complète.' } },
          ],
        },
      ],
    },
  ],
}
