import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import path from 'node:path'

export const DB_PORT = 5433
export const DB_NAME = 'terredavenir'
const DEFAULT_DATA_DIR = '.data/postgres'

export interface DatabaseOptions {
  port?: number
  /** Dossier des données, relatif au dossier courant ou absolu. */
  dataDir?: string
}

export async function startDatabase({
  port = DB_PORT,
  dataDir = DEFAULT_DATA_DIR,
}: DatabaseOptions = {}): Promise<EmbeddedPostgres> {
  const databaseDir = path.resolve(dataDir)
  const pg = new EmbeddedPostgres({
    databaseDir,
    user: 'postgres',
    password: 'postgres',
    port,
    persistent: true,
    onLog: () => {},
  })
  if (!existsSync(path.join(databaseDir, 'PG_VERSION'))) {
    await pg.initialise()
  }
  await pg.start()
  // createDatabase() laisse son client ouvert quand la base existe déjà : on gère la connexion nous-mêmes.
  const client = pg.getPgClient()
  await client.connect()
  try {
    await client.query(`CREATE DATABASE "${DB_NAME}"`)
  } catch {
    // La base existe déjà : rien à faire.
  } finally {
    await client.end()
  }
  return pg
}
