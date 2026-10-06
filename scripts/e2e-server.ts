import { spawn } from 'node:child_process'
import { startDatabase } from './lib/embedded-db'

const run = (command: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(command, { shell: true, stdio: 'inherit' })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${command} → code ${code}`))))
  })

const pg = await startDatabase()
await run('npm run migrate')
await run('npm run seed')
const server = spawn('npx next start -p 3100', { shell: true, stdio: 'inherit' })

const stop = async () => {
  server.kill()
  await pg.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
