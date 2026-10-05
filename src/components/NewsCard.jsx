import { Link } from 'react-router-dom';
import Image from '@global/Image';
import Icon from '@global/Icon';
import { t } from '../lib/i18n';

export const displayName = 'News Card';
export const shortDescription = 'Carte actualité : photo, catégorie, titre, date, lien';

export default function NewsCard({
  category = t('Actualité'),
  title = t('Titre à documenter'),
  date = t('Date à confirmer'),
  imagePrompt = 'community activity outdoors in Gabon forest setting, warm natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  slug = 'initiative-jeunesse-1',
}) {
  return (
    <article className="bg-background rounded-lg border border-border overflow-hidden flex flex-col" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="overflow-hidden" style={{ height: 196 }}>
        <Image ar="16:9" prompt={imagePrompt} className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <span className="text-xs font-bold text-primary uppercase tracking-widest font-body">{category}</span>
        <h3 className="text-base font-bold text-foreground leading-snug font-headings">{title}</h3>
        <p className="text-sm text-muted-foreground font-body">{date}</p>
        <div className="flex items-center justify-between mt-3">
          <Link to={`/actualites/${slug}`} className="text-sm font-bold text-primary flex items-center gap-1">
            {t('Lire l\'article')} <Icon i="arrow-right" size={13} />
          </Link>
          <a
            href="https://www.facebook.com/profile.php?id=61573035845197"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-body font-medium"
            style={{ color: '#1877F2' }}
            title="Voir sur Facebook"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
            {t('Voir sur Facebook')}
          </a>
        </div>
      </div>
    </article>
  );
}

