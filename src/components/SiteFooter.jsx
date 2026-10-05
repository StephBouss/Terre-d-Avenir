import { Link } from 'react-router-dom';
import Icon from '@global/Icon';
import fallbackLogo from '../assets/logo-terre-davenir.svg';
import { t } from '../lib/i18n';

export const displayName = 'Site Footer';
export const shortDescription = 'Pied de page vert profond avec liens, contact et mentions';

const LOGO_URL =
  '/brand/logo-clair.png';

const primaryLinks = [
  ["L'ONG", '/ong'],
  ['Le mot de la présidente', '/#mot-presidente'],
  ['Organisation', '/ong#equipe'],
  ['Projets & actions', '/#actions'],
  ['Actualités', '/actualites'],
  ['Médiathèque', '/mediatheque'],
];

const utilityLinks = [
  ['Adhérer', '/ong#adhesion'],
  ['Contact', '/contact'],
  ['Transparence', '/ong'],
  ['Confidentialité', '/contact'],
  ['Mentions légales', '/contact'],
];

export default function SiteFooter() {
  return (
    <footer className="bg-deep text-accent-foreground font-body">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-4 gap-12 footer-grid">
          <div>
            <Link to="/" className="inline-block mb-4" aria-label="Retour à l’accueil">
              <img
                src={LOGO_URL}
                alt="Terre d'Avenir KOMO-KANGO"
                className="h-16 w-auto object-contain"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackLogo;
                }}
              />
            </Link>
            <p className="text-sm text-accent-foreground opacity-80 leading-relaxed max-w-[280px]">
              {t('ONG ancrée au Komo-Kango, au Gabon. Solidarité, développement local et ouverture sur le monde.')}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wide">{t('Navigation')}</h2>
            <ul className="flex flex-col gap-2">
              {primaryLinks.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm opacity-80 hover:opacity-100">{t(label)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wide">{t('Liens utiles')}</h2>
            <ul className="flex flex-col gap-2">
              {utilityLinks.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm opacity-80 hover:opacity-100">{t(label)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wide">{t('Contact')}</h2>
            <ul className="flex flex-col gap-3 text-sm opacity-80">
              <li className="flex items-center gap-2"><Icon i="map-pin" size={15} /> {t('Komo-Kango, Gabon')}</li>
              <li>
                <a href="mailto:contact@terredavenir-komokango.org" className="underline break-all">
                  contact@terredavenir-komokango.org
                </a>
              </li>
            </ul>
            <div className="mt-5">
              <p className="text-xs opacity-50 mb-3">{t('Suivez-nous')}</p>
              <a
                href="https://www.facebook.com/profile.php?id=61573035845197"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-bold"
                style={{ background: '#1877F2', color: '#fff' }}
              >
                <span aria-hidden="true" className="font-bold">f</span>
                {t('Facebook')}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-6 flex items-center justify-between gap-5 footer-bottom" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <p className="text-xs opacity-60">{t(`© ${new Date().getFullYear()} Terre d'Avenir KOMO-KANGO`)}</p>
          <p className="text-xs opacity-50 text-right">{t('Informations à compléter et valider avant toute collecte de données.')}</p>
        </div>
      </div>
    </footer>
  );
}
