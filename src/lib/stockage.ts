// Stockage des photos en ligne : un service compatible S3 (aujourd'hui Neon Object Storage ; demain OVH Object Storage
// ou un autre, sans changer le code). Sans ces variables, les photos restent dans le dossier media/ (développement local).
// Noms en S3_* : Vercel réserve AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY et AWS_REGION à son propre usage.
// Même liste dans scripts/verifier-env.mjs.
export const VARIABLES_S3 = ['S3_BUCKET', 'S3_ENDPOINT', 'S3_REGION', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const

type Env = Record<string, string | undefined>

export function stockageS3Actif(env: Env = process.env): boolean {
  return VARIABLES_S3.every((nom) => env[nom]?.trim())
}

/** Réglages du client S3. Les identifiants sont passés explicitement : sur Vercel, le SDK AWS lirait sinon ceux de la plateforme. */
export function configS3(env: Env = process.env) {
  return {
    bucket: env.S3_BUCKET?.trim() ?? '',
    config: {
      endpoint: env.S3_ENDPOINT?.trim(),
      region: env.S3_REGION?.trim(),
      credentials: { accessKeyId: env.S3_ACCESS_KEY_ID?.trim() ?? '', secretAccessKey: env.S3_SECRET_ACCESS_KEY?.trim() ?? '' },
      // Neon (comme la plupart des services S3 hors AWS) n'accepte que les adresses « endpoint/bucket/clé ».
      forcePathStyle: true,
      // Pas de sommes de contrôle ajoutées d'office par les SDK AWS récents, refusées par certains services compatibles S3.
      requestChecksumCalculation: 'WHEN_REQUIRED' as const,
      responseChecksumValidation: 'WHEN_REQUIRED' as const,
    },
  }
}
