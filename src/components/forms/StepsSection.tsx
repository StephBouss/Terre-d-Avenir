import { Reveal } from '@/components/motion/Reveal'
import { RevealGroup } from '@/components/motion/RevealGroup'
import SectionHeader from '@/components/ui/SectionHeader'
import type { Section } from '@/lib/sections'
import { isPlaceholder } from '@/lib/text'

export default function StepsSection({ section }: { section?: Section }) {
  const steps = (section?.items ?? []).filter((item) => !isPlaceholder(item.text))
  if (!section || steps.length === 0) return null
  return (
    <section className="py-20" style={{ background: '#F7F8F4' }}>
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-10">
        {section.heading && !isPlaceholder(section.heading) && (
          <Reveal>
            <SectionHeader title={section.heading} />
          </Reveal>
        )}
        <RevealGroup as="ol" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <li key={step.id ?? i} className="card-lift bg-background rounded-lg border border-border p-6 flex flex-col gap-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <span className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: '#E6BF58', color: '#003E2A' }} aria-hidden="true">
                {i + 1}
              </span>
              <p className="text-base text-foreground leading-relaxed">{step.text}</p>
            </li>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
