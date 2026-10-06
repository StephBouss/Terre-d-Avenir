import Image from 'next/image'
import Link from 'next/link'
import FacebookIcon from '@/components/ui/FacebookIcon'
import Icon from '@/components/ui/Icon'
import type { Reglage } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { localizedHref } from '@/lib/i18n/paths'
import { FOOTER_PRIMARY, FOOTER_UTILITY } from '@/lib/routes'
import { isPlaceholder } from '@/lib/text'

type Props = { locale: Locale; dict: Dictionary; reglages: Reglage | null }

export default function SiteFooter({ locale, dict, reglages }: Props) {
  const columns = [
    { title: dict.footer.navigation, links: FOOTER_PRIMARY },
    { title: dict.footer.useful, links: FOOTER_UTILITY },
  ]
  return (
    <footer className="bg-deep text-accent-foreground font-body">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-4 gap-12 footer-grid">
          <div>
            <Link href={localizedHref(locale, '/')} className="inline-block mb-4" aria-label={dict.header.home}>
              <Image src="/brand/logo-clair.png" alt="" width={1774} height={887} sizes="140px" className="h-16 w-auto object-contain" />
            </Link>
            {!isPlaceholder(reglages?.footerTagline) && (
              <p className="text-sm text-accent-foreground opacity-80 leading-relaxed max-w-[280px]">{reglages?.footerTagline}</p>
            )}
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wide">{column.title}</h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.key}>
                    <Link href={localizedHref(locale, link.href)} className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                      {dict.nav[link.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wide">{dict.footer.contact}</h2>
            {!isPlaceholder(reglages?.location) && (
              <p className="flex items-center gap-2 text-sm opacity-80">
                <Icon i="map-pin" size={15} /> {reglages?.location}
              </p>
            )}
            {reglages?.facebookUrl && (
              <div className="mt-5">
                <p className="text-xs opacity-60 mb-3">{dict.footer.follow}</p>
                <a
                  href={reglages.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-arrow inline-flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-bold"
                  style={{ background: '#1670E0', color: '#fff' }}
                >
                  <FacebookIcon size={16} color="#fff" />
                  {dict.footer.facebook}
                  <span className="sr-only"> {dict.common.newTab}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="border-t mt-12 pt-6 flex items-center justify-between gap-5 footer-bottom" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <p className="text-xs opacity-60">{dict.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
