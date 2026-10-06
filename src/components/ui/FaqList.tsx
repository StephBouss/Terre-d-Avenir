import { Reveal } from '@/components/motion/Reveal'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'
import Icon from './Icon'
import { Paragraphs } from './Paragraphs'

export default function FaqList({ section, headingLevel = 2 }: { section?: Section; headingLevel?: 2 | 3 }) {
  const items = (section?.items ?? []).filter((item) => !isPlaceholder(item.title) && !isPlaceholder(item.text))
  if (items.length === 0) return null
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <Reveal className="flex flex-col gap-6">
      {section?.heading && !isPlaceholder(section.heading) && <Heading className="text-3xl font-bold text-foreground font-headings">{section.heading}</Heading>}
      <div className="border-t border-border">
        {items.map((item, i) => (
          <details key={item.id ?? i} className="group border-b border-border py-5">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-lg font-bold text-foreground font-headings">
              {item.title}
              <Icon i="chevron-down" size={20} className="text-primary flex-shrink-0 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="pt-3">
              <Paragraphs text={item.text} className="text-base text-muted-foreground leading-relaxed" />
            </div>
          </details>
        ))}
      </div>
    </Reveal>
  )
}
