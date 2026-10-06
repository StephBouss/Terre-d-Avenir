import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  typescript: { interface: 'User' },
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: { useAsTitle: 'email', group: 'Administration' },
  auth: true,
  fields: [],
}
