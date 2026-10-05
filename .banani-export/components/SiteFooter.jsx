export const displayName = 'Site Footer';
export const shortDescription = 'Pied de page vert profond avec liens, contact et mentions';

export default function SiteFooter() {
  return (
    <footer className="bg-deep text-accent-foreground font-body">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-4 gap-12">
          {/* Bloc identité */}
          <div className="col-span-1">
            <div className="mb-4">
              <img
                src="/brand/logo-clair.png"
                alt="Terre d'Avenir KOMO-KANGO"
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-accent-foreground opacity-80 leading-relaxed">
              {t("ONG ancrée au Komo-Kango, au Gabon. Solidarité, développement local et ouverture sur le monde.")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wide">{t("Navigation")}</h4>
            <ul className="flex flex-col gap-2">
              {[t("L'ONG"), t("Le mot de la présidente"), t("Organisation"), t("Projets & actions"), t("Actualités"), t("Partenariats")].map((item, i) => (
                <li key={i}><a className="text-sm opacity-80">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <h4 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wide">{t("Liens utiles")}</h4>
            <ul className="flex flex-col gap-2">
              {[t("Adhérer"), t("Contact"), t("Transparence"), t("Confidentialité"), t("Mentions légales"), t("Page 404")].map((item, i) => (
                <li key={i}><a className="text-sm opacity-80">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wide">{t("Contact")}</h4>
            <ul className="flex flex-col gap-3 text-sm opacity-80">
              <li>{t("Komo-Kango, Gabon")}</li>
              <li><a className="underline">{t("contact@terredavenir-komokango.org")}</a></li>
            </ul>
            <div className="mt-5">
              <p className="text-xs opacity-50 mb-3">{t("Suivez-nous")}</p>
              <a
                href="https://www.facebook.com/profile.php?id=61573035845197"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-bold"
                style={{ background: '#1877F2', color: '#fff' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
                {t("Facebook")}
              </a>
            </div>
            <div className="mt-4">
              <p className="text-xs opacity-60">{t("© 2025 Terre d'Avenir KOMO-KANGO")}</p>
            </div>
          </div>
        </div>

        {/* Séparateur doré */}
        <div className="border-t mt-12 pt-6 flex items-center justify-between" style={{ borderColor: '#E6BF5840' }}>
          <p className="text-xs opacity-50">{t("Informations à compléter et valider avant toute collecte de données.")}</p>
          <div className="flex gap-4 text-xs opacity-60">
            <a>{t("Confidentialité")}</a>
            <a>{t("Mentions légales")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

