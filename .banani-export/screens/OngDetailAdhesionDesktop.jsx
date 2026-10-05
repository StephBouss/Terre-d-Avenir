import SiteHeader from '@components/SiteHeader';
import SiteFooter from '@components/SiteFooter';
import SectionHeader from '@components/SectionHeader';
import GoldDivider from '@components/GoldDivider';
import Icon from '@global/Icon';
import Image from '@global/Image';

export const displayName = 'L\'ONG & Adhésion — Terre d\'Avenir KOMO-KANGO';
export const screenSize = 'desktop';

export default function OngDetailScreen() {
  return (
    <div className="bg-background font-body w-full">
      <SiteHeader activePage="ong" />

      {/* ─── HERO BANNER ─── */}
      <section className="relative py-24 overflow-hidden" style={{ background: '#003E2A', minHeight: 480 }}>
        {/* BG photo */}
        <div className="absolute inset-0 z-0">
          <Image
            ar="21:9"
            prompt="documentary photograph of green tropical forest landscape in Komo-Kango Gabon, village clearing visible, late afternoon light through canopy, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
            className="w-full h-full object-cover"
            style={{ opacity: 0.45 }}
          />
        </div>
        {/* Overlay */}
        <div
          className="absolute inset-0 z-1"
          style={{ background: 'linear-gradient(105deg, #003E2Ae8 30%, #003E2Acc 55%, #003E2A99 100%)' }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-6">
          <span
            className="text-xs font-bold font-body uppercase"
            style={{
              letterSpacing: '0.14em',
              color: '#E6BF58',
              background: 'rgba(230,191,88,0.14)',
              border: '1px solid rgba(230,191,88,0.4)',
              borderRadius: 4,
              padding: '4px 12px',
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            {t('Qui sommes-nous')}
          </span>
          <h1 className="text-5xl font-bold text-primary-foreground font-headings mb-6" style={{ lineHeight: 1.1 }}>
            {t('Terre d\'Avenir KOMO-KANGO')}
          </h1>
          <p className="text-lg text-primary-foreground" style={{ opacity: 0.88, maxWidth: 700 }}>
            {t('Une ONG gabonaise ancrée au Komo-Kango pour la solidarité, le développement local et l\'amélioration de la qualité de vie des communautés.')}
          </p>
        </div>
      </section>

      {/* ─── MISSION & VALUES ─── */}
      <section className="bg-background py-24">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 gap-20 items-start">
          <div>
            <SectionHeader
              overline={t('Notre mission')}
              title={t('Ancrer l\'engagement local')}
            />
            <p className="text-base text-foreground leading-relaxed font-body mt-6 mb-6" style={{ textAlign: 'justify' }}>
              {t('Terre d\'Avenir KOMO-KANGO a pour mission de renforcer la solidarité au sein de la communauté du Komo-Kango et de créer des ponts durables entre les habitants, la diaspora et les partenaires externes. Nous croyons que le développement durable passe par une approche inclusive, documentée et participative.')}
            </p>
            <a className="text-sm font-bold text-primary flex items-center gap-2 font-body">
              {t('Lire la charte complète')} <Icon i="arrow-right" size={14} />
            </a>
          </div>
          <div className="bg-secondary rounded-lg p-8 flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-secondary-foreground font-headings">{t('Nos valeurs')}</h3>
            {[
              { icon: 'heart', label: t('Solidarité'), desc: t('Engagement collectif au service du bien commun') },
              { icon: 'target', label: t('Ancrage'), desc: t('Profond enracinement dans le territoire et ses réalités') },
              { icon: 'users', label: t('Participation'), desc: t('Implication active des habitants et ressortissants') },
              { icon: 'leaf', label: t('Durabilité'), desc: t('Actions pensées pour le long terme et l\'environnement') },
            ].map((v, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center rounded-full w-8 h-8" style={{ background: '#E6BF5820' }}>
                    <Icon i={v.icon} size={16} className="text-primary" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-secondary-foreground text-sm">{v.label}</p>
                  <p className="text-sm text-secondary-foreground" style={{ opacity: 0.75 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HISTORY & TIMELINE ─── */}
      <section className="bg-background py-24" style={{ background: '#F7F8F4' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHeader
            overline={t('Notre parcours')}
            title={t('Fondée en 2022 au Komo-Kango')}
          />
          <div className="grid grid-cols-2 gap-16 mt-12 items-start">
            <div>
              <div className="rounded-lg overflow-hidden">
                <Image
                  ar="4:3"
                  prompt="documentary photograph of green tropical forest landscape in Komo-Kango Gabon, village clearing visible, late afternoon light through canopy, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex flex-col gap-8">
              <div className="relative pl-8">
                <div className="absolute left-0 top-2 w-4 h-4 rounded-full" style={{ background: '#E6BF58' }} />
                <div className="absolute left-1.5 top-6 w-1 h-24" style={{ background: 'rgba(230,191,88,0.3)' }} />
                <div>
                  <p className="text-sm font-bold text-primary uppercase tracking-widest">{t('2022 — Fondation')}</p>
                  <p className="text-base text-foreground leading-relaxed mt-1">{t('Création de Terre d\'Avenir KOMO-KANGO au cœur du Komo-Kango, en réponse aux besoins identifiés par les habitants et ressortissants.')}</p>
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-2 w-4 h-4 rounded-full" style={{ background: '#E6BF5880' }} />
                <div className="absolute left-1.5 top-6 w-1 h-24" style={{ background: 'rgba(230,191,88,0.3)' }} />
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t('2023-2024 — Développement')}</p>
                  <p className="text-base text-foreground leading-relaxed mt-1">{t('Lancement progressif des quatre axes d\'action : jeunesse, santé, sport et solidarité. Mise en place des premiers projets pilotes.')}</p>
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-2 w-4 h-4 rounded-full" style={{ background: '#E6BF5880' }} />
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t('2025+ — Pérennisation')}</p>
                  <p className="text-base text-foreground leading-relaxed mt-1">{t('Consolidation des impacts, expansion des initiatives documentées et renforcement du réseau de partenaires.')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      <section className="bg-background py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHeader
            overline={t('Notre équipe')}
            title={t('Dirigée par une présidente engagée')}
          />
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg overflow-hidden mb-4" style={{ width: 240, height: 280, border: '3px solid #E6BF58' }}>
                <Image
                  ar="3:4"
                  prompt="portrait photograph of an African woman, natural outdoor setting in Gabon, warm diffused light, professional and approachable expression, green vegetation in background, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-foreground font-headings">{t('La Présidente')}</h3>
              <p className="text-sm text-muted-foreground font-body mt-1">{t('Terre d\'Avenir KOMO-KANGO')}</p>
              <p className="text-sm text-foreground leading-relaxed mt-3">{t('Portrait et bio à valider avant toute publication.')}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg overflow-hidden mb-4 w-48 h-48 bg-muted flex items-center justify-center">
                <Icon i="users" size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-headings">{t('Membres actifs')}</h3>
              <p className="text-sm text-muted-foreground font-body mt-1">{t('Données à connecter')}</p>
              <p className="text-sm text-foreground leading-relaxed mt-3">{t('Habitants du Komo-Kango, ressortissants et bénévoles engagés.')}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg overflow-hidden mb-4 w-48 h-48 bg-muted flex items-center justify-center">
                <Icon i="handshake" size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-headings">{t('Partenaires')}</h3>
              <p className="text-sm text-muted-foreground font-body mt-1">{t('À documenter')}</p>
              <p className="text-sm text-foreground leading-relaxed mt-3">{t('Organisations, institutions et partenaires engagés aux côtés de l\'ONG.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="bg-background max-w-[1280px] mx-auto px-6 py-6">
        <GoldDivider />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ADHÉSION — MULTI-STEP FORM                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* ─── ADHESION INTRO ─── */}
      <section className="bg-background py-20">
        <div className="max-w-[1280px] mx-auto px-6 text-center mb-12">
          <span
            className="text-xs font-bold font-body uppercase"
            style={{
              letterSpacing: '0.14em',
              color: '#005C38',
              background: '#E6BF5820',
              border: '1px solid #E6BF5850',
              borderRadius: 4,
              padding: '3px 10px',
              display: 'inline-block',
              marginBottom: 12,
            }}
          >
            {t('Rejoindre l\'ONG')}
          </span>
          <h2 className="text-4xl font-bold text-foreground font-headings mb-4" style={{ lineHeight: 1.15 }}>
            {t('Devenir membre de Terre d\'Avenir KOMO-KANGO')}
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto" style={{ lineHeight: 1.65 }}>
            {t('Rejoignez notre communauté d\'habitants, ressortissants et partenaires engagés pour la solidarité et le développement du Komo-Kango.')}
          </p>
        </div>

        {/* ─── ADHESION FORM — MULTI-STEP WIZARD ─── */}
        <div className="max-w-2xl mx-auto px-6">
          {/* Progress bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-foreground">{t('Étape 1 sur 3')}</span>
              <span className="text-sm text-muted-foreground">{t('33%')}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-primary rounded-full transition-all duration-500" />
            </div>
          </div>

          {/* STEP 1 — Informations personnelles */}
          <div className="bg-background border border-border rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-foreground font-headings mb-6">{t('Vos informations personnelles')}</h3>

            <div className="space-y-5">
              {/* Full name */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t('Nom complet *')}</label>
                <div className="border border-border rounded-md px-4 py-3 bg-input text-foreground placeholder:text-muted-foreground">
                  {t('Votre nom')}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t('Email *')}</label>
                <div className="border border-border rounded-md px-4 py-3 bg-input text-foreground">
                  {t('votre.email@example.com')}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t('Téléphone')}</label>
                <div className="border border-border rounded-md px-4 py-3 bg-input text-muted-foreground">
                  {t('+241 XX XX XX XX')}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t('Genre *')}</label>
                <div className="border border-border rounded-md px-4 py-3 bg-input text-foreground flex items-center justify-between">
                  {t('Sélectionner')}
                  <Icon i="chevron-down" size={16} className="text-muted-foreground" />
                </div>
              </div>

              {/* Birthdate */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t('Date de naissance')}</label>
                <div className="border border-border rounded-md px-4 py-3 bg-input text-muted-foreground">
                  {t('JJ/MM/AAAA')}
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <div />
              <a
                className="font-bold text-base px-8 py-3 rounded-md font-body text-primary-foreground flex items-center gap-2"
                style={{ background: '#005C38' }}
              >
                {t('Suivant')}
                <Icon i="arrow-right" size={16} />
              </a>
            </div>
          </div>

          {/* Info boxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary rounded-lg p-4 flex gap-3 items-start">
              <Icon i="info" size={18} className="text-secondary-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-secondary-foreground">{t('Données sécurisées')}</p>
                <p className="text-xs text-secondary-foreground mt-1" style={{ opacity: 0.75 }}>{t('Vos informations sont protégées et utilisées uniquement par l\'ONG.')}</p>
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-4 flex gap-3 items-start">
              <Icon i="clock" size={18} className="text-secondary-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-secondary-foreground">{t('Traitement rapide')}</p>
                <p className="text-xs text-secondary-foreground mt-1" style={{ opacity: 0.75 }}>{t('Vous recevrez une réponse dans un délai de 3 à 5 jours.')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CRITERIA ─── */}
      <section className="bg-background py-20" style={{ background: '#F7F8F4' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground font-headings mb-8">{t('Critères d\'adhésion')}</h2>
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: 'check-circle', title: t('Être résident ou ressortissant du Komo-Kango'), desc: t('Ou entretenir un lien fort avec le territoire et ses communautés.') },
              { icon: 'check-circle', title: t('Partager les valeurs de l\'ONG'), desc: t('Solidarité, ancrage local, participation inclusive et durabilité.') },
              { icon: 'check-circle', title: t('S\'engager à participer'), desc: t('Être disposé à contribuer aux actions et initiatives menées par l\'ONG.') },
              { icon: 'check-circle', title: t('Respecter la charte'), desc: t('Accepter les modalités d\'adhésion et le code de conduite de l\'ONG.') },
            ].map((item, i) => (
              <div key={i} className="bg-background rounded-lg p-6 border border-border">
                <div className="flex gap-3 items-start">
                  <Icon i={item.icon} size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className="bg-background py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground font-headings mb-8">{t('Avantages de l\'adhésion')}</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: 'users', title: t('Communauté'), desc: t('Accès au réseau de membres actifs et partenaires engagés.') },
              { icon: 'mail', title: t('Communications'), desc: t('Recevoir les actualités, appels à participation et mises à jour directes.') },
              { icon: 'vote', title: t('Voix participative'), desc: t('Contribuer aux décisions et orientations de l\'ONG.') },
              { icon: 'award', title: t('Reconnaissance'), desc: t('Être listé comme membre et contributeur de l\'initiative.') },
              { icon: 'book', title: t('Ressources'), desc: t('Accès à la documentation et aux compte-rendus des projets.') },
              { icon: 'heart', title: t('Impact'), desc: t('Contribution concrète au développement du Komo-Kango.') },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="flex items-center justify-center rounded-full w-12 h-12" style={{ background: '#E6BF5820' }}>
                  <Icon i={item.icon} size={22} className="text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

