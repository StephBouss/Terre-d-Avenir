import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import path from 'node:path'

export const DB_PORT = 5433
export const DB_NAME = 'terredavenir'
const DATA_DIR = path.resolve('.data/postgres')

export async function startDatabase(): Promise<EmbeddedPostgres> {
  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: 'postgres',
    password: 'postgres',
    port: DB_PORT,
    persistent: true,
    onLog: () => {},
  })
  if (!existsSync(path.join(DATA_DIR, 'PG_VERSION'))) {
    await pg.initialise()
  }
  await pg.start()
  try {
    await pg.createDatabase(DB_NAME)
  } catch {
    // La base existe déjà : rien à faire.
  }
  return pg
}
