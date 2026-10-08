import { APIError, type Access, type CollectionBeforeChangeHook, type CollectionConfig, type FieldAccess, type PayloadRequest } from 'payload'
import {
  MAX_COMPTES,
  MAX_COMPTES_SUPPLEMENTAIRES,
  MODULES,
  NIVEAUX,
  NIVEAUX_LIBELLES,
  PREREGLAGES,
  ROLES,
  ROLES_LIBELLES,
  type Compte,
  estAdministrateur,
} from '../lib/permissions'

async function nombreComptes(req: PayloadRequest): Promise<number> {
  const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
  return totalDocs
}

const compte = (user: unknown): Compte | null => (user ? (user as Compte) : null)

/**
 * Création : le tout premier compte (parcours « premier utilisateur » de Payload, qui devient l’administrateur),
 * puis uniquement par l’administrateur, dans la limite de MAX_COMPTES comptes au total.
 */
export const creationCompte: Access = async ({ req }) => {
  const total = await nombreComptes(req)
  return total === 0 || (estAdministrateur(compte(req.user)) && total < MAX_COMPTES)
}

/** Lecture et modification : l’administrateur voit tous les comptes ; un compte limité ne voit que le sien. */
export const lectureCompte: Access = ({ req }) => {
  const u = compte(req.user)
  if (!u) return false
  return estAdministrateur(u) ? true : { id: { equals: u.id } }
}

/** Suppression : par l’administrateur seul, jamais son propre compte (il reste donc toujours un administrateur). */
export const suppressionCompte: Access = ({ req, id }) => {
  const u = compte(req.user)
  return estAdministrateur(u) && String(id) !== String(u?.id)
}

/** Rôle et accès : réglés par l’administrateur seul (un compte limité ne peut pas s’attribuer de droits). */
const reglageAdmin: FieldAccess = ({ req }) => estAdministrateur(compte(req.user))

/**
 * Garde-fous indépendants des droits (valent aussi pour l’API locale et le seed) :
 * le premier compte est l’administrateur, il n’y en a qu’un, il ne peut pas être rétrogradé, et 3 comptes au plus.
 */
export const regleRoles: CollectionBeforeChangeHook = async ({ data, operation, originalDoc, req, context }) => {
  // Seed uniquement (API locale) : désigne le compte SEED_ADMIN_EMAIL comme administrateur, après avoir rétrogradé les autres.
  if (context?.designerAdministrateur) return data
  if (operation === 'create') {
    const total = await nombreComptes(req)
    if (total >= MAX_COMPTES) throw new APIError(`Limite atteinte : l’administrateur et ${MAX_COMPTES_SUPPLEMENTAIRES} comptes au plus.`, 400, null, true)
    if (total === 0) return { ...data, role: 'administrateur' }
    if (data.role === 'administrateur') throw new APIError('Il ne peut y avoir qu’un administrateur principal.', 400, null, true)
    const role = (data.role ?? 'redaction') as keyof typeof PREREGLAGES
    // Sans accès précisés (création par l’API : tous à « aucun » par défaut), on applique ceux du rôle type.
    const aucunAcces = MODULES.every((m) => !data.acces?.[m.cle] || data.acces[m.cle] === 'aucun')
    return { ...data, role, acces: aucunAcces && PREREGLAGES[role] ? PREREGLAGES[role] : data.acces }
  }
  if (originalDoc?.role === 'administrateur') return { ...data, role: 'administrateur' }
  if (data.role === 'administrateur') throw new APIError('Il ne peut y avoir qu’un administrateur principal.', 400, null, true)
  return data
}

export const Users: CollectionConfig = {
  slug: 'users',
  typescript: { interface: 'User' },
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: {
    useAsTitle: 'email',
    group: 'Administration',
    defaultColumns: ['email', 'nom', 'role'],
    description: `L’administrateur principal peut créer jusqu’à ${MAX_COMPTES_SUPPLEMENTAIRES} comptes supplémentaires et choisir, module par module, ce que chacun peut voir ou modifier.`,
  },
  auth: true,
  access: { create: creationCompte, read: lectureCompte, update: lectureCompte, delete: suppressionCompte },
  hooks: { beforeChange: [regleRoles] },
  fields: [
    { name: 'nom', label: 'Nom', type: 'text' },
    {
      name: 'role',
      label: 'Rôle',
      type: 'select',
      required: true,
      defaultValue: 'redaction',
      options: ROLES.map((value) => ({ value, label: ROLES_LIBELLES[value] })),
      access: { create: reglageAdmin, update: reglageAdmin },
      admin: {
        description: 'Choisir un rôle type pré-remplit les accès ci-dessous, qui restent modifiables. « Administrateur principal » est réservé au premier compte.',
        components: { Field: '/components/admin/ChampRole' },
      },
    },
    {
      name: 'acces',
      label: 'Accès par module',
      type: 'group',
      access: { create: reglageAdmin, update: reglageAdmin },
      admin: {
        condition: (data) => data?.role !== 'administrateur',
        description: 'Aucun accès : le module n’apparaît pas. Lecture seule : consultation sans modification. Modification : création, modification, publication et suppression.',
      },
      fields: MODULES.map((m) => ({
        name: m.cle,
        label: m.libelle,
        type: 'select' as const,
        required: true,
        defaultValue: 'aucun',
        options: NIVEAUX.map((value) => ({ value, label: NIVEAUX_LIBELLES[value] })),
      })),
    },
  ],
}
