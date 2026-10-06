import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fr } from '@payloadcms/translations/languages/fr'
import sharp from 'sharp'
import { Actualites } from './collections/Actualites'
import { Medias } from './collections/Medias'
import { Pages } from './collections/Pages'
import { Projets } from './collections/Projets'
import { Users } from './collections/Users'
import { Reglages } from './globals/Reglages'
import { DEFAULT_LOCALE, LOCALES, NATIVE_NAMES } from './lib/i18n/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: { supportedLanguages: { fr }, fallbackLanguage: 'fr' },
  collections: [Pages, Actualites, Projets, Medias, Users],
  globals: [Reglages],
  localization: {
    locales: LOCALES.map((code) => ({ code, label: NATIVE_NAMES[code] })),
    defaultLocale: DEFAULT_LOCALE,
    fallback: false,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
})
