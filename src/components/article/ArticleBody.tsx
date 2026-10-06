import { Reveal } from '@/components/motion/Reveal'
import FacebookIcon from '@/components/ui/FacebookIcon'
import { Paragraphs } from '@/components/ui/Paragraphs'
import { isFacebookUrl, opensInNewTab } from '@/lib/i18n/paths'
import { isPlaceholder } from '@/lib/text'
import ShareButtons from './ShareButtons'

type Props = {
  lead?: string | null
  body?: string | null
  meta: { label: string; value: string }[]
  source?: { label?: string | null; url?: string | null } | null
  newTabLabel: string
  share: { url: string; labels: { newTab: string; share: string; copyLink: string; linkCopied: string } }
}

export default function ArticleBody({ lead, body, meta, source, newTabLabel, share }: Props) {
  const showSource = !!source && !isPlaceholder(source.url) && !isPlaceholder(source.label)
  return (
    <section className="bg-background py-20">
      <div className="max-w-4xl mx-auto px-6">
        <Reveal className="mb-16 flex flex-col gap-6">
          {!isPlaceholder(lead) && <p className="text-xl text-foreground leading-relaxed font-body">{lead}</p>}
          <Paragraphs text={body} />
        </Reveal>
        {(meta.length > 0 || showSource) && (
          <div className="border-t border-border pt-12 mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {meta.map((m) => (
                <div key={m.label}>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{m.label}</p>
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                </div>
              ))}
              {showSource && (
                <div>
                  <a
                    href={source!.url!}
                    {...(opensInNewTab(source!.url!) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="btn-arrow inline-flex items-center gap-2 text-lg font-bold"
                    style={{ color: '#1670E0' }}
                  >
                    {isFacebookUrl(source!.url!) && <FacebookIcon size={18} />}
                    {source!.label}
                    {opensInNewTab(source!.url!) && <span className="sr-only">{` ${newTabLabel}`}</span>}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-12 pt-12 border-t border-border">
          <ShareButtons url={share.url} labels={share.labels} />
        </div>
      </div>
    </section>
  )
}
