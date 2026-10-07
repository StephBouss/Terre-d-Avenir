import { MediaImage } from '@/components/ui/MediaImage'
import type { PosteNoeud } from '@/lib/organigramme'
import { isPlaceholder } from '@/lib/text'
import type { Media } from '@/payload-types'

type Props = { titre: string; noeuds: PosteNoeud[]; labels: { vide: string; liste: string } }

const visible = (v?: string | null) => (v && !isPlaceholder(v) ? v : null)

/** Portrait rond ; alt du média (vide si l’image est provisoire, règle de MediaImage), ou décoratif dans le schéma. */
function Portrait({ media, taille, decoratif }: { media: number | Media | null | undefined; taille: number; decoratif: boolean }) {
  if (!media || typeof media === 'number' || !media.url) return null
  return (
    <div className="relative rounded-full overflow-hidden flex-shrink-0 bg-light" style={{ width: taille, height: taille }}>
      <MediaImage media={media} fill decorative={decoratif} sizes={`${taille}px`} className="object-cover" />
    </div>
  )
}

function CarteArbre({ noeud }: { noeud: PosteNoeud }) {
  const p = noeud.poste
  return (
    <div className="w-[150px] rounded-lg border border-border bg-background p-3 flex flex-col items-center text-center gap-2" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <Portrait media={p.personnePhoto} taille={72} decoratif />
      <p className="text-sm font-bold text-foreground leading-snug">{p.intitule}</p>
      {visible(p.personneNom) && <p className="text-sm font-semibold text-primary">{p.personneNom}</p>}
      {visible(p.mission) && <p className="text-xs text-muted-foreground leading-relaxed">{p.mission}</p>}
      {visible(p.personneBio) && <p className="text-xs text-muted-foreground leading-relaxed">{p.personneBio}</p>}
    </div>
  )
}

function BrancheArbre({ noeuds }: { noeuds: PosteNoeud[] }) {
  return (
    <>
      {noeuds.map((n) => (
        <li key={n.poste.id} data-poste={n.poste.id} data-parent={n.parentId ?? ''}>
          <CarteArbre noeud={n} />
          {n.enfants.length > 0 && (
            <ul>
              <BrancheArbre noeuds={n.enfants} />
            </ul>
          )}
        </li>
      ))}
    </>
  )
}

function BrancheListe({ noeuds }: { noeuds: PosteNoeud[] }) {
  return (
    <>
      {noeuds.map((n) => {
        const p = n.poste
        return (
          <li key={p.id} data-poste={p.id} data-parent={n.parentId ?? ''} className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <Portrait media={p.personnePhoto} taille={56} decoratif={false} />
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-foreground font-headings">{p.intitule}</h3>
                {visible(p.personneNom) && <p className="text-sm font-semibold text-primary">{p.personneNom}</p>}
                {visible(p.mission) && <p className="text-sm text-muted-foreground leading-relaxed">{p.mission}</p>}
                {visible(p.personneBio) && <p className="text-sm text-muted-foreground leading-relaxed">{p.personneBio}</p>}
              </div>
            </div>
            {n.enfants.length > 0 && (
              <ul className="ml-4 pl-4 border-l-2 border-border flex flex-col gap-4">
                <BrancheListe noeuds={n.enfants} />
              </ul>
            )}
          </li>
        )
      })}
    </>
  )
}

/**
 * Organigramme : schéma en arbre (décoratif, aria-hidden, à partir de 1280 px) et liste imbriquée accessible,
 * construits à partir du même arbre (mêmes rattachements, même ordre). La liste est toujours dans le DOM :
 * visible sous 1280 px, masquée visuellement au-delà mais lue par les lecteurs d’écran.
 */
export default function Organigramme({ titre, noeuds, labels }: Props) {
  return (
    <section className="bg-background py-20" aria-labelledby="organigramme-titre">
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
        <h2 id="organigramme-titre" className="text-4xl font-bold text-foreground font-headings" style={{ lineHeight: 1.15 }}>
          {titre}
        </h2>
        {noeuds.length === 0 ? (
          <p className="text-lg text-muted-foreground">{labels.vide}</p>
        ) : (
          <>
            <div data-vue="arbre" aria-hidden="true" className="hidden xl:block overflow-x-auto pb-2">
              <ul className="org-arbre">
                <BrancheArbre noeuds={noeuds} />
              </ul>
            </div>
            <ul data-vue="liste" aria-label={labels.liste} className="flex flex-col gap-6 xl:sr-only">
              <BrancheListe noeuds={noeuds} />
            </ul>
          </>
        )}
      </div>
    </section>
  )
}
