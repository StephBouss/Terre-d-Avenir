import type { CollectionConfig } from 'payload'

/** Champs remplis par le traitement du formulaire : visibles mais jamais modifiables depuis l’admin ou l’API REST. */
const fige = { readOnly: true } as const
const nonModifiable = { update: () => false }

export const Messages: CollectionConfig = {
  slug: 'messages',
  typescript: { interface: 'Message' },
  labels: { singular: 'Message reçu', plural: 'Messages reçus' },
  admin: {
    useAsTitle: 'reference',
    group: 'Formulaires',
    defaultColumns: ['reference', 'type', 'nom', 'emailEtat', 'traite', 'createdAt'],
    listSearchableFields: ['reference', 'nom'],
    description: 'Demandes d’adhésion et messages de contact envoyés depuis le site. Lecture réservée à l’admin.',
  },
  // Non traités d’abord (false < true), puis les plus récents.
  defaultSort: ['traite', '-createdAt'],
  access: {
    read: ({ req }) => Boolean(req.user),
    // Création uniquement par l’API locale du traitement de formulaire (overrideAccess), jamais par REST ou GraphQL.
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'reference', label: 'Référence', type: 'text', required: true, unique: true, index: true, admin: fige, access: nonModifiable },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Adhésion', value: 'adhesion' },
        { label: 'Contact', value: 'contact' },
      ],
      admin: fige,
      access: nonModifiable,
    },
    { name: 'nom', label: 'Nom', type: 'text', admin: fige, access: nonModifiable },
    { name: 'donnees', label: 'Données envoyées', type: 'json', required: true, admin: fige, access: nonModifiable },
    {
      name: 'locale',
      label: 'Langue',
      type: 'select',
      options: [
        { label: 'Français', value: 'fr' },
        { label: 'English', value: 'en' },
      ],
      admin: { ...fige, position: 'sidebar' },
      access: nonModifiable,
    },
    { name: 'noticeVersion', label: 'Version de la notice acceptée', type: 'text', admin: { ...fige, position: 'sidebar' }, access: nonModifiable },
    { name: 'cleIdempotence', label: 'Clé d’envoi', type: 'text', required: true, unique: true, index: true, admin: { ...fige, position: 'sidebar' }, access: nonModifiable },
    {
      name: 'emailEtat',
      label: 'État de l’e-mail',
      type: 'select',
      required: true,
      defaultValue: 'non_configure',
      options: [
        { label: 'Envoyé', value: 'envoye' },
        { label: 'Échec', value: 'echec' },
        { label: 'Non configuré', value: 'non_configure' },
      ],
      admin: { ...fige, position: 'sidebar' },
      access: nonModifiable,
    },
    { name: 'emailErreur', label: 'Erreur d’envoi', type: 'textarea', admin: { ...fige, position: 'sidebar' }, access: nonModifiable },
    {
      name: 'emailEnvoyeLe',
      label: 'E-mail envoyé le',
      type: 'date',
      admin: { ...fige, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
      access: nonModifiable,
    },
    { name: 'traite', label: 'Traité', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'notes', label: 'Notes internes', type: 'textarea', admin: { description: 'Visibles uniquement dans l’admin.' } },
  ],
}
