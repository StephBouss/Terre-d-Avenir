export const displayName = 'Site Header';
export const shortDescription = 'En-tête public du site avec logo, navigation et bouton Adhérer';

export default function SiteHeader({ activePage = 'accueil' }) {
  const navItems = [
    { label: t("L'ONG"), key: 'ong' },
    { label: t('Mot de la présidente'), key: 'mot' },
    { label: t('Organisation'), key: 'organisation' },
    { label: t('Projets & actions'), key: 'projets' },
    { label: t('Actualités'), key: 'actualites' },
    { label: t('Médiathèque'), key: 'mediatheque' },
    { label: t('Contact'), key: 'contact' },
  ];

  return (
    <header className="bg-background border-b border-border w-full">
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <a className="flex items-center gap-3 flex-shrink-0">
          <img
            src="/brand/logo-couleur.png"
            alt="Terre d'Avenir KOMO-KANGO"
            className="h-14 w-auto object-contain"
            style={{ maxWidth: 180 }}
          />
        </a>

        {/* Nav */}
        <nav className="flex items-center gap-0">
          {navItems.map((item) => (
            <a
              key={item.key}
              className={`px-3 py-2 text-sm font-body font-medium ${
                activePage === item.key
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-foreground'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA + Langue */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-md overflow-hidden text-xs font-body">
            <span className="px-3 py-1.5 bg-primary text-primary-foreground font-bold">FR</span>
            <span className="px-3 py-1.5 text-muted-foreground">EN</span>
          </div>
          {/* Bouton Adhérer : fond doré, texte vert foncé */}
          <a
            className="text-sm font-bold px-5 py-2.5 rounded-md font-body"
            style={{ background: '#E6BF58', color: '#003E2A' }}
          >
            {t('Adhérer')}
          </a>
        </div>
      </div>
    </header>
  );
}

