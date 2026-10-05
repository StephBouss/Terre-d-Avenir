import { paragraphs } from '@/lib/text'

export function Paragraphs({ text, className = 'text-lg text-muted-foreground leading-relaxed' }: { text?: string | null; className?: string }) {
  const list = paragraphs(text)
  if (list.length === 0) return null
  return (
    <div className="flex flex-col gap-4">
      {list.map((p, i) => (
        <p key={i} className={`whitespace-pre-line font-body ${className}`}>
          {p}
        </p>
      ))}
    </div>
  )
}
