// Vérification lancée en tête de « vercel-build » : un réglage manquant fait échouer le déploiement avec un message
// clair, au lieu de mettre en ligne un site qui répond « This page couldn't load » (erreur 500).
// Aucune valeur secrète n'est affichée : seulement le nom des variables.
import { pathToFileURL } from 'node:url'

export const VARIABLES_BASE = ['DATABASE_URI', 'DATABASE_URL', 'POSTGRES_URL'] // même liste que src/lib/base-de-donnees.ts

/** Liste des problèmes bloquants pour l'environnement donné ; vide si tout est prêt. */
export function verifierEnv(env) {
  const erreurs = []
  const secret = env.PAYLOAD_SECRET ?? ''
  if (!secret) erreurs.push('PAYLOAD_SECRET est absent : Payload refuse de démarrer sans clé secrète (« missing secret key »).')
  else if (secret.length < 32) erreurs.push('PAYLOAD_SECRET est trop court : au moins 32 caractères aléatoires.')

  const nomBase = VARIABLES_BASE.find((nom) => env[nom])
  if (!nomBase) erreurs.push(`Aucune base de données : définir ${VARIABLES_BASE.join(' ou ')} (adresse postgres://…).`)
  else if (!/^postgres(ql)?:\/\//.test(env[nomBase])) erreurs.push(`${nomBase} n'est pas une adresse PostgreSQL (elle doit commencer par postgres:// ou postgresql://).`)
  else if (env.VERCEL && /@(localhost|127\.0\.0\.1)[:/]/.test(env[nomBase])) erreurs.push(`${nomBase} pointe vers localhost : en ligne, il faut la base hébergée (Neon).`)

  // Sur Vercel, le disque n'est pas conservé : sans Blob, les photos envoyées disparaissent et celles du seed manquent.
  if (env.VERCEL && !env.BLOB_READ_WRITE_TOKEN) erreurs.push('BLOB_READ_WRITE_TOKEN est absent : créer un Blob store dans Vercel > Storage et le relier au projet.')
  return erreurs
}

// Lancé en ligne de commande (pas importé par les tests).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const erreurs = verifierEnv(process.env)
  if (erreurs.length) {
    console.error('\nDéploiement arrêté : réglages manquants dans Vercel > Settings > Environment Variables.\n')
    for (const e of erreurs) console.error(`  ✗ ${e}`)
    console.error('\nAprès correction, relancer le déploiement (Deployments > … > Redeploy).\n')
    process.exit(1)
  }
  console.log('Variables d’environnement : OK')
}
