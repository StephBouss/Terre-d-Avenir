import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  typescript: { interface: 'User' },
  admin: { useAsTitle: 'email' },
  auth: true,
  fields: [],
}
