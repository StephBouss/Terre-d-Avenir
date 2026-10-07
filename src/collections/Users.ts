import type { Access, CollectionConfig, PayloadRequest } from 'payload'

async function nombreComptes(req: PayloadRequest): Promise<number> {
  const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
  return totalDocs
}

/**
 * Création : uniquement tant qu’aucun compte n’existe. Le parcours « premier utilisateur » de Payload
 * (registerFirstUser) crée de toute façon le compte avec overrideAccess et refuse dès qu’un compte existe.
 * Le seed et l’e2e passent par l’API locale, qui contourne l’accès.
 */
export const creationCompte: Access = async ({ req }) => (await nombreComptes(req)) === 0

/** Suppression : jamais sans connexion, jamais le dernier compte. */
export const suppressionCompte: Access = async ({ req }) => Boolean(req.user) && (await nombreComptes(req)) > 1

export const Users: CollectionConfig = {
  slug: 'users',
  typescript: { interface: 'User' },
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: { useAsTitle: 'email', group: 'Administration' },
  auth: true,
  access: { create: creationCompte, delete: suppressionCompte },
  fields: [],
}
