import Icon from '@/components/ui/Icon'
import { isPlaceholder } from '@/lib/text'

type Item = { title?: string | null; text?: string | null; id?: string | null }

const ICONS = ['map-pin', 'users', 'leaf']

export default function MissionStrip({ items }: { items: Item[] }) {
  const visible = items.filter((item) => !isPlaceholder(item.title))
  if (visible.length === 0) return null
  return (
    <section className="bg-background border-b border-border">
      <div className="mission-strip max-w-[1280px] mx-auto px-6 py-6 flex items-center justify-between gap-4">
        {visible.map((item, i) => (
          <div key={item.id ?? i} className="flex items-center gap-3">
            <Icon i={ICONS[i % ICONS.length]} size={18} className="text-primary flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground font-body">{item.title}</span>
              {!isPlaceholder(item.text) && <span className="text-sm font-medium text-muted-foreground font-body">{item.text}</span>}
            </div>
            {i < visible.length - 1 && <div className="mission-sep ml-auto w-px h-5 bg-border" style={{ marginLeft: 'auto' }} />}
          </div>
        ))}
      </div>
    </section>
  )
}
