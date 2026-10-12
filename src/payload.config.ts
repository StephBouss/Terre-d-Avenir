import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { fr } from '@payloadcms/translations/languages/fr'
import sharp from 'sharp'
import { Actualites } from './collections/Actualites'
import { Medias } from './collections/Medias'
import { Albums } from './collections/Albums'
import { Messages } from './collections/Messages'
import { Pages } from './collections/Pages'
import { Projets } from './collections/Projets'
import { Postes } from './collections/Postes'
import { Users } from './collections/Users'
import { Diaporama } from './globals/Diaporama'
import { Reglages } from './globals/Reglages'
import { urlBaseDeDonnees } from './lib/base-de-donnees'
import { emailAdapter } from './lib/email/adaptateur'
import { configS3, stockageS3Actif } from './lib/stockage'
import { DEFAULT_LOCALE, LOCALES, NATIVE_NAMES } from './lib/i18n/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      beforeDashboard: ['/components/admin/KpiDashboard'],
      // Après chaque validation : page suivante (liste ou tableau de bord) avec un bandeau de confirmation.
      providers: ['/components/admin/RedirectionApresEnregistrement'],
    },
  },
  i18n: { supportedLanguages: { fr }, fallbackLanguage: 'fr' },
  collections: [Pages, Actualites, Projets, Postes, Medias, Albums, Messages, Users],
  globals: [Reglages, Diaporama],
  localization: {
    locales: LOCALES.map((code) => ({ code, label: NATIVE_NAMES[code] })),
    defaultLocale: DEFAULT_LOCALE,
    fallback: false,
  },
  editor: lexicalEditor(),
  email: emailAdapter(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: urlBaseDeDonnees() },
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  upload: { limits: { fileSize: 20_000_000 } }, // 20 Mo par photo (PRD BO-10)
  sharp,
  plugins: [
    // En ligne, le disque n'est pas conservé : les photos vont dans le stockage S3 (Neon Object Storage) dès qu'il est
    // configuré. En local, sans S3_*, elles restent dans le dossier media/. Le schéma est identique partout (alwaysInsertFields).
    // Les photos restent servies par /api/medias/file/… : le bucket peut rester privé.
    s3Storage({
      enabled: stockageS3Actif(),
      alwaysInsertFields: true,
      collections: { medias: true },
      ...configS3(),
    }),
  ],
})
