import Icon from './Icon'

/** Composition typographique sans visage (Textes v1.3, PAGE-02 : pas de portrait non autorisé). */
export default function QuoteMark({ size = 64 }: { size?: number }) {
  return (
    <div
      className="w-full aspect-square max-w-[360px] rounded-lg flex items-center justify-center"
      style={{ background: '#003E2A', border: '3px solid #E6BF58' }}
      aria-hidden="true"
    >
      <Icon i="quote" size={size} style={{ color: '#E6BF58' }} />
    </div>
  )
}
