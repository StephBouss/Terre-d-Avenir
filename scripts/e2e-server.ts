import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { startDatabase } from './lib/embedded-db'
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../tests/e2e/admin-credentials'

const SERVER_URL = 'http://localhost:3100/fr'
// Base dédiée aux tests : ne touche jamais à la base de développement (5433, .data/postgres).
const E2E_DB_PORT = 5434
const E2E_DATA_DIR = '.data/postgres-e2e'
const E2E_ENV = {
  ...process.env,
  DATABASE_URI: `postgres://postgres:postgres@127.0.0.1:${E2E_DB_PORT}/terredavenir`,
  SEED_ADMIN_EMAIL: ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD: ADMIN_PASSWORD,
}

const run = (command: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(command, { shell: true, stdio: 'inherit', env: E2E_ENV })
    child.on('error', reject)
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${command} → code ${code}`))))
  })

/** Arrête le processus et ses enfants (sous Windows, `shell: true` laisse sinon `next` orphelin), puis attend sa fin. */
async function terminate(child: ChildProcess, timeoutMs = 15_000): Promise<void> {
  if (child.exitCode !== null || child.pid === undefined) return
  const exited = new Promise<void>((resolve) => child.once('exit', () => resolve()))
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'])
  else child.kill('SIGTERM')
  await Promise.race([exited, new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))])
}

/** Arrête une instance e2e restée active (run précédent interrompu) : uniquement le dossier e2e, jamais la base de dev. */
function stopStaleDatabase(): void {
  if (process.platform !== 'win32') return
  if (!existsSync(path.join(E2E_DATA_DIR, 'postmaster.pid'))) return
  const pgCtl = path.resolve('node_modules/@embedded-postgres/windows-x64/native/bin/pg_ctl.exe')
  if (existsSync(pgCtl)) spawnSync(pgCtl, ['stop', '-D', path.resolve(E2E_DATA_DIR), '-m', 'fast'], { stdio: 'ignore' })
}

async function waitForServer(server: ChildProcess, timeoutMs = 120_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`next start s’est arrêté (code ${server.exitCode})`)
    try {
      if ((await fetch(SERVER_URL)).ok) return
    } catch {
      // Le serveur n’écoute pas encore.
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Le serveur ne répond pas sur ${SERVER_URL}`)
}

/**
 * Setup global Playwright : base embarquée dédiée (5434), migrations, seed, puis `next start` sur 3100.
 * Le teardown arrête d’abord le serveur, puis la base, pour ne laisser ni erreur de connexion ni processus orphelin.
 */
export default async function globalSetup(): Promise<() => Promise<void>> {
  stopStaleDatabase()
  const pg = await startDatabase({ port: E2E_DB_PORT, dataDir: E2E_DATA_DIR })
  let server: ChildProcess | undefined
  const teardown = async () => {
    if (server) await terminate(server)
    await pg.stop().catch(() => {})
  }
  try {
    await run('npm run migrate')
    await run('npm run seed')
    server = spawn('npx next start -p 3100', { shell: true, stdio: 'inherit', env: E2E_ENV })
    await waitForServer(server)
  } catch (error) {
    await teardown()
    throw error
  }
  return teardown
}
