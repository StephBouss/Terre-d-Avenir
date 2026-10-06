import { emphasisParts } from '@/lib/text'

export function EmphasisText({ text }: { text: string }) {
  return (
    <>
      {emphasisParts(text).map((part, i) =>
        part.em ? (
          <span key={i} style={{ color: '#E6BF58' }}>
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}
