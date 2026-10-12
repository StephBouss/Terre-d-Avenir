import { afterEach, describe, expect, it, vi } from 'vitest'
import { verifierEnv, VARIABLES_BASE as VARIABLES_SCRIPT } from '../../scripts/verifier-env.mjs'
import { urlBaseDeDonnees, VARIABLES_BASE } from '@/lib/base-de-donnees'
import { siteUrl } from '@/lib/seo'

const SECRET = 'x'.repeat(32)
const NEON = 'postgresql://u:p@ep-abc.eu-central-1.aws.neon.tech/neondb?sslmode=require'
const VERCEL_PRET = { VERCEL: '1', PAYLOAD_SECRET: SECRET, DATABASE_URL: NEON, BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_x' }

describe('urlBaseDeDonnees', () => {
  it('DATABASE_URI d’abord, puis les noms créés par l’intégration Neon de Vercel', () => {
    expect(urlBaseDeDonnees({ DATABASE_URI: 'postgres://a', DATABASE_URL: 'postgres://b' })).toBe('postgres://a')
    expect(urlBaseDeDonnees({ DATABASE_URL: 'postgres://b', POSTGRES_URL: 'postgres://c' })).toBe('postgres://b')
    expect(urlBaseDeDonnees({ POSTGRES_URL: 'postgres://c' })).toBe('postgres://c')
    expect(urlBaseDeDonnees({})).toBe('')
  })
  it('même liste que le script de vérification', () => {
    expect(VARIABLES_SCRIPT).toEqual([...VARIABLES_BASE])
  })
})

describe('verifierEnv (avant le déploiement Vercel)', () => {
  it('rien à signaler quand tout est réglé', () => {
    expect(verifierEnv(VERCEL_PRET)).toEqual([])
  })
  it('clé secrète absente ou trop courte', () => {
    expect(verifierEnv({ ...VERCEL_PRET, PAYLOAD_SECRET: '' }).join()).toMatch(/PAYLOAD_SECRET est absent/)
    expect(verifierEnv({ ...VERCEL_PRET, PAYLOAD_SECRET: 'court' }).join()).toMatch(/trop court/)
  })
  it('base absente, mal formée ou locale', () => {
    expect(verifierEnv({ ...VERCEL_PRET, DATABASE_URL: '' }).join()).toMatch(/Aucune base de données/)
    expect(verifierEnv({ ...VERCEL_PRET, DATABASE_URL: 'mysql://x' }).join()).toMatch(/pas une adresse PostgreSQL/)
    expect(verifierEnv({ ...VERCEL_PRET, DATABASE_URL: 'postgres://u:p@localhost:5433/db' }).join()).toMatch(/localhost/)
  })
  it('Blob exigé sur Vercel seulement', () => {
    expect(verifierEnv({ ...VERCEL_PRET, BLOB_READ_WRITE_TOKEN: '' }).join()).toMatch(/BLOB_READ_WRITE_TOKEN/)
    expect(verifierEnv({ PAYLOAD_SECRET: SECRET, DATABASE_URI: 'postgres://u:p@localhost:5433/db' })).toEqual([])
  })
  it('n’affiche jamais la valeur des secrets', () => {
    const messages = verifierEnv({ ...VERCEL_PRET, PAYLOAD_SECRET: 'secret-court', DATABASE_URL: 'mysql://motdepasse@x' }).join()
    expect(messages).not.toContain('secret-court')
    expect(messages).not.toContain('motdepasse')
  })
})

describe('siteUrl', () => {
  afterEach(() => vi.unstubAllEnvs())
  it('NEXT_PUBLIC_SITE_URL, sinon l’adresse de production Vercel, sinon localhost', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    expect(siteUrl()).toBe('http://localhost:3000')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'terre-d-avenir.vercel.app')
    expect(siteUrl()).toBe('https://terre-d-avenir.vercel.app')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://terredavenir.org')
    expect(siteUrl()).toBe('https://terredavenir.org')
  })
})
