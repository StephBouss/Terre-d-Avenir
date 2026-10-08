import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidate'

export const Diaporama: GlobalConfig = {
  slug: 'diaporama',
  typescript: { interface: 'Diaporama' },
  label: 'Diaporama d’accueil',
  admin: { group: 'Images' },
  access: { read: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'images',
      label: 'Images',
      type: 'upload',
      relationTo: 'medias',
      hasMany: true,
      required: true,
      minRows: 1,
      admin: {
        description: 'Les 3 premières images défilent en fond du Hero (la 3e sert aussi à la section Ancrage) ; les suivantes alimentent le collage de droite. Glisser pour réordonner.',
      },
    },
    {
      name: 'textes',
      label: 'Textes des diapositives',
      labels: { singular: 'Texte', plural: 'Textes' },
      type: 'array',
      maxRows: 3,
      admin: {
        description:
          'Le 1er texte s’affiche avec la 1re image, le 2e avec la 2e, le 3e avec la 3e. Entourer un mot d’astérisques (*mot*) le met en couleur. Diapositive sans texte : le titre et l’introduction de la page Accueil sont utilisés.',
      },
      fields: [
        { name: 'titre', label: 'Titre', type: 'text', localized: true, required: true },
        { name: 'texte', label: 'Texte', type: 'textarea', localized: true },
      ],
    },
  ],
}
