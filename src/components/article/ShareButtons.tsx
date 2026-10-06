'use client'
import { useEffect, useRef, useState } from 'react'
import FacebookIcon from '@/components/ui/FacebookIcon'
import Icon from '@/components/ui/Icon'

type Props = { url: string; labels: { newTab: string; share: string; copyLink: string; linkCopied: string } }

export default function ShareButtons({ url, labels }: Props) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-bold text-foreground">{labels.share}</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-arrow inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold"
        style={{ background: '#1670E0', color: '#fff' }}
      >
        <FacebookIcon size={15} color="#fff" /> Facebook<span className="sr-only">{` ${labels.newTab}`}</span>
      </a>
      <button type="button" onClick={copy} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold border border-border text-foreground">
        <Icon i="link-2" size={15} /> {labels.copyLink}
      </button>
      <span role="status" className="text-sm text-primary font-medium">
        {copied ? labels.linkCopied : ''}
      </span>
    </div>
  )
}
