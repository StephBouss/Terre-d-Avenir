import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { startDatabase } from './lib/embedded-db'

const URL = 'http://localhost:3100/fr'

const run = (command: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(command, { shell: true, stdio: 'inherit' })
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

async function waitForServer(server: ChildProcess, timeoutMs = 120_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`next start s’est arrêté (code ${server.exitCode})`)
    try {
      if ((await fetch(URL)).ok) return
    } catch {
      // Le serveur n’écoute pas encore.
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Le serveur ne répond pas sur ${URL}`)
}

/**
 * Setup global Playwright : base embarquée, migrations, seed, puis `next start` sur 3100.
 * Le teardown arrête d’abord le serveur, puis la base, pour ne laisser ni erreur de connexion ni processus orphelin.
 */
export default async function globalSetup(): Promise<() => Promise<void>> {
  const pg = await startDatabase()
  let server: ChildProcess | undefined
  const teardown = async () => {
    if (server) await terminate(server)
    await pg.stop().catch(() => {})
  }
  try {
    await run('npm run migrate')
    await run('npm run seed')
    server = spawn('npx next start -p 3100', { shell: true, stdio: 'inherit' })
    await waitForServer(server)
  } catch (error) {
    await teardown()
    throw error
  }
  return teardown
}
