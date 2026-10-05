type Props = { overline?: string | null; title: string; subtitle?: string | null; centered?: boolean }

export default function SectionHeader({ overline, title, subtitle, centered = false }: Props) {
  return (
    <div className={`flex flex-col gap-3 ${centered ? 'items-center text-center' : ''}`}>
      {overline && (
        <span
          className="text-xs font-bold font-body uppercase"
          style={{
            letterSpacing: '0.14em',
            color: '#005C38',
            background: '#E6BF5820',
            border: '1px solid #E6BF5850',
            borderRadius: 4,
            padding: '3px 10px',
            display: 'inline-block',
            alignSelf: centered ? 'center' : 'flex-start',
          }}
        >
          {overline}
        </span>
      )}
      <h2 className="text-4xl font-bold text-foreground font-headings" style={{ lineHeight: 1.15 }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-muted-foreground leading-relaxed font-body" style={{ maxWidth: 560 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
