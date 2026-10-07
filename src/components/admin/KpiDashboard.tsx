import type { ServerProps } from 'payload'
import Link from 'next/link'
import { NO_SOURCE, formatSituation, type KpiState } from '@/lib/kpi/compute'
import { loadKpis } from '@/lib/kpi/load'
import './kpi-dashboard.css'

const LIST = '/admin/collections'

function Value({ state }: { state: KpiState }) {
  if (state.kind === 'value') return <strong className="kpi-value">{state.value}</strong>
  if (state.kind === 'unavailable') return <span className="kpi-muted">Indisponible</span>
  return <span className="kpi-muted">{state.note}</span>
}

function Row({ label, state, href }: { label: string; state: KpiState; href: string }) {
  return (
    <li>
      <Link href={href} className="kpi-row">
        <span>{label}</span>
        <Value state={state} />
      </Link>
    </li>
  )
}

export default async function KpiDashboard({ payload }: ServerProps) {
  const k = await loadKpis(payload)
  return (
    <section className="kpi-dashboard" aria-labelledby="kpi-title">
      <header className="kpi-header">
        <h2 id="kpi-title">Indicateurs</h2>
        <p>Situation au {formatSituation(new Date())} (heure de Libreville)</p>
      </header>
      <div className="kpi-grid">
        <article className="kpi-card">
          <h3>Actualités</h3>
          <ul>
            <Row label="Publiées" state={k.actualites.publiees} href={`${LIST}/actualites?where[_status][equals]=published&where[archivee][not_equals]=true`} />
            <Row label="Brouillons" state={k.actualites.brouillons} href={`${LIST}/actualites?where[_status][equals]=draft`} />
            <Row label="Archivées" state={k.actualites.archivees} href={`${LIST}/actualites?where[archivee][equals]=true`} />
          </ul>
        </article>
        <article className="kpi-card">
          <h3>Pages et projets</h3>
          <ul>
            <Row label="Pages" state={k.pages} href={`${LIST}/pages`} />
            <Row label="Projets" state={k.projets} href={`${LIST}/projets`} />
            <Row label="Traductions anglaises à revoir" state={k.traductions} href={`${LIST}/actualites?locale=en`} />
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
            <Row label="Sans texte alternatif" state={k.medias.sansAlt} href={`${LIST}/medias?where[provisoire][not_equals]=true&where[alt][exists]=false`} />
            <Row label="Droits non confirmés" state={k.medias.droitsNonConfirmes} href={`${LIST}/medias?where[droitsConfirmes][not_equals]=true`} />
          </ul>
        </article>
        {NO_SOURCE.map((c) => (
          <article key={c.id} className="kpi-card kpi-disabled">
            <h3>{c.title}</h3>
            <p className="kpi-muted">{c.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
