import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '@global/Icon';
import fallbackLogo from '../assets/logo-terre-davenir.svg';
import { t } from '../lib/i18n';

export const displayName = 'Site Header';
export const shortDescription = 'En-tête public du site avec logo, navigation et bouton Adhérer';

const LOGO_URL =
  '/brand/logo-couleur.png';

const navItems = [
  { label: "L'ONG", key: 'ong', to: '/ong' },
  { label: 'Mot de la présidente', key: 'mot', to: '/#mot-presidente' },
  { label: 'Organisation', key: 'organisation', to: '/ong#equipe' },
  { label: 'Projets & actions', key: 'projets', to: '/#actions' },
  { label: 'Actualités', key: 'actualites', to: '/actualites' },
  { label: 'Médiathèque', key: 'mediatheque', to: '/mediatheque' },
  { label: 'Contact', key: 'contact', to: '/contact' },
];

export default function SiteHeader({ activePage = 'accueil' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header className="site-header bg-background border-b border-border w-full">
      <div className="site-header-inner max-w-[1280px] mx-auto px-6 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0" aria-label="Terre d’Avenir — Accueil">
          <img
            src={LOGO_URL}
            alt="Terre d'Avenir KOMO-KANGO"
            className="site-logo h-14 w-auto object-contain"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackLogo;
            }}
          />
        </Link>

        <nav className="desktop-navigation items-center" aria-label="Navigation principale">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`px-3 py-2 text-sm font-body font-medium transition-colors ${
                activePage === item.key
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>

        <div className="desktop-actions items-center gap-3">
          <div className="flex items-center border border-border rounded-md overflow-hidden text-xs font-body" aria-label="Langue">
            <button type="button" className="px-3 py-1.5 bg-primary text-primary-foreground font-bold" aria-pressed="true">
              FR
            </button>
            <button type="button" className="px-3 py-1.5 text-muted-foreground" aria-pressed="false" title="Version anglaise à venir">
              EN
            </button>
          </div>
          <Link
            to="/ong#adhesion"
            className="text-sm font-bold px-5 py-2.5 rounded-md font-body transition-transform hover:-translate-y-0.5"
            style={{ background: '#E6BF58', color: '#003E2A' }}
          >
            {t('Adhérer')}
          </Link>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          <Icon i={isOpen ? 'x' : 'menu'} size={25} />
        </button>
      </div>

      <div id="mobile-navigation" className={`mobile-navigation ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
        <nav aria-label="Navigation mobile">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={activePage === item.key ? 'is-active' : ''}
            >
              {t(item.label)}
              <Icon i="arrow-up-right" size={17} />
            </Link>
          ))}
        </nav>
        <div className="mobile-navigation-footer">
          <Link to="/ong#adhesion" className="mobile-join-button">
            <Icon i="user-plus" size={18} />
            {t("Faire une demande d'adhésion")}
          </Link>
          <p>Komo-Kango, Gabon</p>
        </div>
      </div>
    </header>
  );
}
