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
  ],
}
