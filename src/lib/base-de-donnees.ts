// Adresse de la base PostgreSQL. DATABASE_URI est le nom du projet ; DATABASE_URL et POSTGRES_URL sont ceux
// que l'intégration Neon de Vercel crée d'elle-même : la base branchée depuis Vercel fonctionne sans recopier l'adresse.
// Même liste dans scripts/verifier-env.mjs.
export const VARIABLES_BASE = ['DATABASE_URI', 'DATABASE_URL', 'POSTGRES_URL'] as const

export function urlBaseDeDonnees(env: Record<string, string | undefined> = process.env): string {
  for (const nom of VARIABLES_BASE) if (env[nom]) return env[nom]!
  return ''
}
