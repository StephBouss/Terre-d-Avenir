import { afterEach, describe, expect, it, vi } from 'vitest'
import { verifierEnv, VARIABLES_BASE as VARIABLES_SCRIPT, VARIABLES_S3 as VARIABLES_S3_SCRIPT } from '../../scripts/verifier-env.mjs'
import { urlBaseDeDonnees, VARIABLES_BASE } from '@/lib/base-de-donnees'
import { siteUrl } from '@/lib/seo'
import { configS3, stockageS3Actif, VARIABLES_S3 } from '@/lib/stockage'

const SECRET = 'x'.repeat(32)
const NEON = 'postgresql://u:p@ep-abc.eu-central-1.aws.neon.tech/neondb?sslmode=require'
const S3 = {
  S3_BUCKET: 'medias',
  S3_ENDPOINT: 'https://br-x.storage.c-7.eu-central-1.aws.neon.tech',
  S3_REGION: 'eu-central-1',
  S3_ACCESS_KEY_ID: 'nak_live_x',
  S3_SECRET_ACCESS_KEY: 'nsk_live_x',
}
const VERCEL_PRET = { VERCEL: '1', PAYLOAD_SECRET: SECRET, DATABASE_URL: NEON, ...S3 }

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
  it('stockage des photos exigé sur Vercel ; facultatif en local, mais jamais à moitié réglé', () => {
    expect(verifierEnv({ ...VERCEL_PRET, S3_SECRET_ACCESS_KEY: '' }).join()).toMatch(/Stockage des photos incomplet : définir S3_SECRET_ACCESS_KEY/)
    const local = { PAYLOAD_SECRET: SECRET, DATABASE_URI: 'postgres://u:p@localhost:5433/db' }
    expect(verifierEnv(local)).toEqual([])
    expect(verifierEnv({ ...local, S3_BUCKET: 'medias' }).join()).toMatch(/S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY/)
    expect(verifierEnv({ ...VERCEL_PRET, S3_ENDPOINT: 'br-x.storage.neon.tech' }).join()).toMatch(/S3_ENDPOINT doit être une adresse https/)
  })
  it('n’affiche jamais la valeur des secrets', () => {
    const messages = verifierEnv({ ...VERCEL_PRET, PAYLOAD_SECRET: 'secret-court', DATABASE_URL: 'mysql://motdepasse@x' }).join()
    expect(messages).not.toContain('secret-court')
    expect(messages).not.toContain('motdepasse')
  })
})

describe('stockage S3 (Neon Object Storage)', () => {
  it('actif seulement quand les cinq variables sont présentes ; même liste que le script', () => {
    expect(stockageS3Actif(S3)).toBe(true)
    expect(stockageS3Actif({ ...S3, S3_REGION: ' ' })).toBe(false)
    expect(stockageS3Actif({})).toBe(false)
    expect(VARIABLES_S3_SCRIPT).toEqual([...VARIABLES_S3])
  })
  it('identifiants explicites et adresses « endpoint/bucket/clé »', () => {
    const { bucket, config } = configS3(S3)
    expect(bucket).toBe('medias')
    expect(config).toMatchObject({
      endpoint: S3.S3_ENDPOINT,
      region: 'eu-central-1',
      forcePathStyle: true,
      credentials: { accessKeyId: 'nak_live_x', secretAccessKey: 'nsk_live_x' },
    })
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
