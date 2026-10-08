'use client'
import Image from 'next/image'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { RevealGroup } from '@/components/motion/RevealGroup'
import Icon from '@/components/ui/Icon'

export type GalleryItem = { id: string | number; url: string; alt: string; caption?: string | null; width: number; height: number }
type Labels = { open: string; dialog: string; close: string; previous: string; next: string }

export default function Gallery({ items, labels }: { items: GalleryItem[]; labels: Labels }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState<number | null>(null)

  // <dialog> modal natif : piège le focus, ferme avec Échap et rend le focus au déclencheur.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (index !== null && !dialog.open) dialog.showModal()
    if (index === null && dialog.open) dialog.close()
  }, [index])

  const go = (delta: number) => setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length))
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') go(1)
    if (event.key === 'ArrowLeft') go(-1)
  }
  const current = index === null ? null : items[index]

  return (
    <>
      <RevealGroup as="ul" className="galerie-grille grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={item.url}
              onClick={(event) => {
                event.preventDefault()
                setIndex(i)
              }}
              aria-label={item.alt ? `${labels.open} : ${item.alt}` : labels.open}
              className="card-lift card-media block w-full rounded-lg overflow-hidden border border-border bg-light"
            >
              <Image src={item.url} alt="" width={item.width} height={item.height} sizes="(min-width: 1024px) 300px, 50vw" className="w-full aspect-square object-cover" />
            </a>
          </li>
        ))}
      </RevealGroup>

      <dialog
        ref={dialogRef}
        aria-label={labels.dialog}
        onClose={() => setIndex(null)}
        onKeyDown={onKeyDown}
        className="lightbox m-auto w-[min(96vw,1100px)] max-h-[92vh] bg-transparent p-0 text-primary-foreground"
      >
        {current && (
          <figure className="flex flex-col gap-3">
            <Image src={current.url} alt={current.alt} width={current.width} height={current.height} sizes="96vw" className="w-full max-h-[80vh] object-contain rounded-lg" />
            {current.caption && <figcaption className="text-center text-sm opacity-90">{current.caption}</figcaption>}
          </figure>
        )}
        <div className="mt-4 flex items-center justify-center gap-3">
          {items.length > 1 && (
            <button type="button" onClick={() => go(-1)} aria-label={labels.previous} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#E6BF58', color: '#003E2A' }}>
              <Icon i="chevron-left" size={22} />
            </button>
          )}
          <button type="button" onClick={() => setIndex(null)} aria-label={labels.close} className="w-11 h-11 rounded-full flex items-center justify-center bg-background text-foreground">
            <Icon i="x" size={22} />
          </button>
          {items.length > 1 && (
            <button type="button" onClick={() => go(1)} aria-label={labels.next} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#E6BF58', color: '#003E2A' }}>
              <Icon i="chevron-right" size={22} />
            </button>
          )}
        </div>
      </dialog>
    </>
  )
}
