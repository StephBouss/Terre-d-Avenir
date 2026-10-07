import type { ServerProps } from 'payload'
import Link from 'next/link'
import { formatSituation, type KpiState } from '@/lib/kpi/compute'
import { loadKpis } from '@/lib/kpi/load'
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

// Filtre « alt vide » : NULL ou chaîne vide (Payload enregistre l'un ou l'autre selon la saisie). Un alt blanc ou contenant [...] ne s'exprime pas en URL.
const SANS_ALT = 'where[and][0][provisoire][not_equals]=true&where[and][1][or][0][alt][exists]=false&where[and][1][or][1][alt][equals]='
const NON_TRAITES = 'where[traite][not_equals]=true'
const EMAIL_ECHEC = 'where[emailEtat][equals]=echec'
const SANS_ALT_NOTE = 'Le compte inclut aussi les textes alternatifs blancs ou contenant [...], que la liste filtrée ne peut pas isoler.'

export default async function KpiDashboard({ payload, user }: ServerProps) {
  if (!user) return null
  const k = await loadKpis(payload)
  const LIST = `${payload.config.routes.admin}/collections`
  return (
    <section className="kpi-dashboard" aria-labelledby="kpi-title">
      <header className="kpi-header">
        <h2 id="kpi-title">Indicateurs</h2>
        <p>Situation au {formatSituation(new Date())} (heure de Libreville)</p>
      </header>
      <div className="kpi-grid">
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
        <article className="kpi-card">
          <h3>Actualités</h3>
          <p className="kpi-muted kpi-help">État visible sur le site</p>
          <ul>
            <Row label="Publiées" state={k.actualites.publiees} href={`${LIST}/actualites?where[_status][equals]=published&where[archivee][not_equals]=true`} />
            <Row label="Brouillons" state={k.actualites.brouillons} href={`${LIST}/actualites?where[_status][equals]=draft&where[archivee][not_equals]=true`} />
            <Row label="Archivées" state={k.actualites.archivees} href={`${LIST}/actualites?where[archivee][equals]=true`} />
          </ul>
        </article>
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
        <article className="kpi-card">
          <h3>Photos</h3>
          <ul>
            <Row label="Total" state={k.medias.total} href={`${LIST}/medias`} />
            <Row label="Dans la médiathèque" state={k.medias.galerie} href={`${LIST}/medias?where[galerie][equals]=true`} />
          </ul>
        </article>
        <article className="kpi-card kpi-alert">
          <h3>Alertes photos</h3>
          <ul>
            <Row label="Provisoires à remplacer" state={k.medias.provisoires} href={`${LIST}/medias?where[provisoire][equals]=true`} />
            <Row label="Sans texte alternatif" state={k.medias.sansAlt} href={`${LIST}/medias?${SANS_ALT}`} title={SANS_ALT_NOTE} />
            <Row label="Droits non confirmés" state={k.medias.droitsNonConfirmes} href={`${LIST}/medias?where[droitsConfirmes][not_equals]=true`} />
          </ul>
        </article>
      </div>
    </section>
  )
}
