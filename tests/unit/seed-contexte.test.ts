import { describe, expect, it } from 'vitest'
import { seedContext } from '@/seed/upsert'

describe('seedContext', () => {
  it('un objet neuf à chaque écriture : le stockage S3 y laisse des marqueurs qui bloqueraient les envois suivants', () => {
    const premier = seedContext()
    premier.skipCloudStorage = true
    premier._payloadCloudStorage = { file: 'photo-1' }
    expect(seedContext()).toEqual({ disableRevalidate: true })
    expect(seedContext()).not.toBe(seedContext())
  })
})
