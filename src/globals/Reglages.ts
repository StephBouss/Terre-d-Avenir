import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidate'

export const Reglages: GlobalConfig = {
  slug: 'reglages',
  typescript: { interface: 'Reglage' },
  label: 'Réglages du site',
  access: { read: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'facebookUrl', label: 'Page Facebook', type: 'text', required: true },
    { name: 'location', label: 'Localisation affichée', type: 'text', localized: true },
    { name: 'footerTagline', label: 'Texte du pied de page', type: 'textarea', localized: true },
    { name: 'heroImages', label: 'Images du diaporama d’accueil', type: 'upload', relationTo: 'medias', hasMany: true },
  ],
}
