import type { ServerProps } from 'payload'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { formatSituation, type KpiState } from '@/lib/kpi/compute'
import { loadKpis } from '@/lib/kpi/load'
import { type Compte, estAdministrateur, MAX_COMPTES, type Module, peutLire } from '@/lib/permissions'
import './kpi-dashboard.css'

function Value({ state }: { state: KpiState }) {
  if (state.kind === 'value') return <strong className="kpi-value">{state.value}</strong>
  if (state.kind === 'unavailable') return <span className="kpi-muted">Indisponible</span>
  return <span className="kpi-muted">{state.note}</span>
}

function Row({ label, state, href, title }: { label: string; state: KpiState; href: string; title?: string }) {
  return (
    <li>
      <Link href={href} className="kpi-row" title={title}>
        <span>{label}</span>
        <Value state={state} />
      </Link>
    </li>
  )
}

const positif = (state: KpiState) => state.kind === 'value' && state.value > 0

const ICONES: Record<string, ReactNode> = {
  messages: <path d="M4 6h16v12H4z M4 7l8 6 8-6" />,
  actualites: <path d="M5 5h11v14H5z M16 9h3v8a2 2 0 0 1-2 2 M8 9h5 M8 12h5 M8 15h3" />,
  photos: <path d="M4 6h16v12H4z M4 15l4-4 4 4 3-3 5 5 M15 9.5h.01" />,
  alertes: <path d="M12 4l9 16H3z M12 10v4 M12 17h.01" />,
}

/** Grand chiffre lisible au premier coup d’œil ; « alerte » le colore en ambre tant qu’il reste quelque chose à faire. */
function Chiffre({ icone, label, aide, state, href, alerte = false }: { icone: string; label: string; aide: string; state: KpiState; href: string; alerte?: boolean }) {
  const ton = alerte ? (positif(state) ? 'kpi-chiffre--alerte' : 'kpi-chiffre--ok') : ''
  return (
    <Link href={href} className={`kpi-chiffre ${ton}`} data-kpi-chiffre={icone}>
      <span className="kpi-chiffre-icone" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {ICONES[icone]}
        </svg>
      </span>
      <span className="kpi-chiffre-nombre">{state.kind === 'value' ? state.value : '—'}</span>
      <span className="kpi-chiffre-label">{label}</span>
      <span className="kpi-chiffre-aide">{aide}</span>
    </Link>
  )
}

// Filtre « alt vide » : NULL ou chaîne vide (Payload enregistre l'un ou l'autre selon la saisie). Un alt blanc ou contenant [...] ne s'exprime pas en URL.
const SANS_ALT = 'where[and][0][provisoire][not_equals]=true&where[and][1][or][0][alt][exists]=false&where[and][1][or][1][alt][equals]='
const NON_TRAITES = 'where[traite][not_equals]=true'
const EMAIL_ECHEC = 'where[emailEtat][equals]=echec'
const SANS_ALT_NOTE = 'Le compte inclut aussi les textes alternatifs blancs ou contenant [...], que la liste filtrée ne peut pas isoler.'

export default async function KpiDashboard({ payload, user }: ServerProps) {
  if (!user) return null
  // Chaque compte ne voit que les indicateurs des modules auxquels il a accès.
  const voit = (m: Module) => peutLire(user as Compte, m)
  const k = await loadKpis(payload)
  const ADMIN = payload.config.routes.admin
  const LIST = `${ADMIN}/collections`
  const routes = payload.config.admin.routes
  // Les comptes sont réservés à l’administrateur principal (3 comptes au plus, lui compris).
  const admin = estAdministrateur(user as Compte)
  const comptes = admin ? (await payload.count({ collection: 'users', overrideAccess: true })).totalDocs : 0
  const nom = (user as { nom?: string | null }).nom
  return (
    <section className="kpi-dashboard" aria-labelledby="kpi-title">
      <header className="kpi-banniere">
        <span className="kpi-banniere-surtitre">Terre d’Avenir KOMO-KANGO</span>
        <h2 id="kpi-title">Tableau de bord</h2>
        <p>
          {nom ? `Bonjour ${nom}. ` : ''}Situation au {formatSituation(new Date())} (heure de Libreville)
        </p>
        <nav className="kpi-banniere-actions" aria-label="Compte et utilisateurs">
          {admin && (
            <Link href={`${LIST}/users`} className="kpi-bouton" data-action="comptes">
              Gérer les comptes{' '}
              <span className="kpi-bouton-compteur" title="Comptes existants / maximum">
                {comptes} / {MAX_COMPTES}
              </span>
            </Link>
          )}
          {admin && comptes < MAX_COMPTES && (
            <Link href={`${LIST}/users/create`} className="kpi-bouton kpi-bouton--or" data-action="creer-compte">
              + Créer un compte
            </Link>
          )}
          <Link href={`${ADMIN}${routes?.account ?? '/account'}`} className="kpi-bouton" data-action="mon-compte">
            Mon compte
          </Link>
          <a href={`${ADMIN}${routes?.logout ?? '/logout'}`} className="kpi-bouton kpi-bouton--sortie" data-action="deconnexion">
            Se déconnecter
          </a>
        </nav>
      </header>

      <div className="kpi-chiffres">
        {voit('messages') && (
          <Chiffre icone="messages" label="Messages à traiter" aide="Adhésions et contacts non traités" state={k.messages.total} href={`${LIST}/messages?${NON_TRAITES}`} alerte />
        )}
        {voit('actualites') && (
          <Chiffre
            icone="actualites"
            label="Actualités publiées"
            aide="Visibles sur le site"
            state={k.actualites.publiees}
            href={`${LIST}/actualites?where[_status][equals]=published&where[archivee][not_equals]=true`}
          />
        )}
        {voit('mediatheque') && <Chiffre icone="photos" label="Photos" aide="Dans la bibliothèque de médias" state={k.medias.total} href={`${LIST}/medias`} />}
        {voit('mediatheque') && (
          <Chiffre
            icone="alertes"
            label="Photos provisoires"
            aide="À remplacer par des photos définitives"
            state={k.medias.provisoires}
            href={`${LIST}/medias?where[provisoire][equals]=true`}
            alerte
          />
        )}
      </div>

      <div className="kpi-grid">
        {voit('messages') && (
          <article className="kpi-card">
            <h3>Messages non traités</h3>
            <p className="kpi-muted kpi-help">Formulaires reçus, case « Traité » non cochée</p>
            <ul>
              <Row label="Total" state={k.messages.total} href={`${LIST}/messages?${NON_TRAITES}`} />
              <Row label="Adhésions" state={k.messages.adhesion} href={`${LIST}/messages?${NON_TRAITES}&where[type][equals]=adhesion`} />
              <Row label="Contact" state={k.messages.contact} href={`${LIST}/messages?${NON_TRAITES}&where[type][equals]=contact`} />
              <Row label="E-mails en échec" state={k.messages.emailsEchec} href={`${LIST}/messages?${EMAIL_ECHEC}`} />
            </ul>
          </article>
        )}
        {voit('actualites') && (
          <article className="kpi-card">
            <h3>Actualités</h3>
            <p className="kpi-muted kpi-help">État visible sur le site</p>
            <ul>
              <Row label="Publiées" state={k.actualites.publiees} href={`${LIST}/actualites?where[_status][equals]=published&where[archivee][not_equals]=true`} />
              <Row label="Brouillons" state={k.actualites.brouillons} href={`${LIST}/actualites?where[_status][equals]=draft&where[archivee][not_equals]=true`} />
              <Row label="Archivées" state={k.actualites.archivees} href={`${LIST}/actualites?where[archivee][equals]=true`} />
            </ul>
          </article>
        )}
        {(voit('pages') || voit('projets')) && (
          <article className="kpi-card">
            <h3>Pages et projets</h3>
            <ul>
              <Row label="Pages" state={k.pages} href={`${LIST}/pages`} />
              <Row label="Projets" state={k.projets} href={`${LIST}/projets`} />
              <li className="kpi-traductions">
                <div className="kpi-row">
                  <span>Traductions anglaises à revoir</span>
                  <Value state={k.traductions.total} />
                </div>
                <ul className="kpi-sub">
                  <Row label="Actualités" state={k.traductions.actualites} href={`${LIST}/actualites?locale=en`} />
                  <Row label="Pages" state={k.traductions.pages} href={`${LIST}/pages?locale=en`} />
                  <Row label="Projets" state={k.traductions.projets} href={`${LIST}/projets?locale=en`} />
                </ul>
              </li>
            </ul>
          </article>
        )}
        {voit('mediatheque') && (
          <article className="kpi-card">
            <h3>Photos</h3>
            <ul>
              <Row label="Total" state={k.medias.total} href={`${LIST}/medias`} />
              <Row label="Dans la médiathèque" state={k.medias.galerie} href={`${LIST}/medias?where[galerie][equals]=true`} />
            </ul>
          </article>
        )}
        {voit('mediatheque') && (
          <article className="kpi-card kpi-alert">
            <h3>Alertes photos</h3>
            <ul>
              <Row label="Provisoires à remplacer" state={k.medias.provisoires} href={`${LIST}/medias?where[provisoire][equals]=true`} />
              <Row label="Sans texte alternatif" state={k.medias.sansAlt} href={`${LIST}/medias?${SANS_ALT}`} title={SANS_ALT_NOTE} />
              <Row label="Droits non confirmés" state={k.medias.droitsNonConfirmes} href={`${LIST}/medias?where[droitsConfirmes][not_equals]=true`} />
            </ul>
          </article>
        )}
      </div>
    </section>
  )
}
