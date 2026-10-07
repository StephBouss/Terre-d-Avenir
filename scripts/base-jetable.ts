import pg from 'pg'

/** Base jetable du serveur de dev (5433), pour tester up/down/up d’une migration sans toucher à `terredavenir`. */
const NOM = 'terredavenir_jetable'
export const URI_JETABLE = `postgres://postgres:postgres@127.0.0.1:5433/${NOM}`

const action = process.argv[2]
const client = new pg.Client({ connectionString: 'postgres://postgres:postgres@127.0.0.1:5433/postgres' })
await client.connect()
try {
  if (action === 'creer') {
    await client.query(`DROP DATABASE IF EXISTS "${NOM}" WITH (FORCE)`)
    await client.query(`CREATE DATABASE "${NOM}"`)
    console.log(`Base ${NOM} créée : DATABASE_URI=${URI_JETABLE}`)
  } else if (action === 'supprimer') {
    await client.query(`DROP DATABASE IF EXISTS "${NOM}" WITH (FORCE)`)
    console.log(`Base ${NOM} supprimée.`)
  } else {
    console.error('Usage : npx tsx scripts/base-jetable.ts creer|supprimer')
    process.exitCode = 1
  }
} finally {
  await client.end()
}
