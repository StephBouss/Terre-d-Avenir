import nextVitals from 'eslint-config-next/core-web-vitals'

export default [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      '.banani-export/**',
      'src/app/(payload)/**',
      'src/migrations/**',
      'src/payload-types.ts',
      'playwright-report/**',
      'test-results/**',
    ],
  },
]
