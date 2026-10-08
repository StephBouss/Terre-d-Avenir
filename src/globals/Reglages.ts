import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidate'

export const Reglages: GlobalConfig = {
  slug: 'reglages',
  typescript: { interface: 'Reglage' },
  label: 'Réglages du site',
  admin: { group: 'Site' },
  access: { read: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'facebookUrl', label: 'Page Facebook', type: 'text', required: true },
    { name: 'location', label: 'Localisation affichée', type: 'text', localized: true },
    { name: 'footerTagline', label: 'Texte du pied de page', type: 'textarea', localized: true },
    {
      name: 'portraitPresidente',
      label: 'Portrait de la Présidente',
      type: 'upload',
      relationTo: 'medias',
      admin: { description: 'Affiché avec le mot de la présidente (page dédiée et accueil). Sans portrait, un guillemet décoratif le remplace. Le portrait de l’organigramme se règle dans la fiche du poste.' },
    },
    {
      type: 'collapsible',
      label: 'Formulaires : adresses de réception',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'emailAdhesions',
          label: 'E-mail de réception des demandes d’adhésion',
          type: 'email',
          admin: { description: 'Laisser vide pour ne pas envoyer d’e-mail : les demandes restent dans « Messages reçus ». L’envoi exige aussi le SMTP (voir README).' },
        },
        {
          name: 'emailContact',
          label: 'E-mail de réception des messages de contact',
          type: 'email',
          admin: { description: 'Laisser vide pour ne pas envoyer d’e-mail : les messages restent dans « Messages reçus ». L’envoi exige aussi le SMTP (voir README).' },
        },
      ],
    },
  ],
}
