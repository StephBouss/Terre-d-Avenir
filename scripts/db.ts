import { DB_PORT, startDatabase } from './lib/embedded-db'

const pg = await startDatabase()
console.log(`PostgreSQL embarqué prêt sur le port ${DB_PORT} (Ctrl+C pour arrêter)`)

const stop = async () => {
  await pg.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
