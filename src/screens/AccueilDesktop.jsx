import { Link } from 'react-router-dom';
import SiteHeader from '@components/SiteHeader';
import SiteFooter from '@components/SiteFooter';
import HeroSlider from '@components/HeroSlider';
import ActionThemeCard from '@components/ActionThemeCard';
import NewsCard from '@components/NewsCard';
import SectionHeader from '@components/SectionHeader';
import GoldDivider from '@components/GoldDivider';
import Icon from '@global/Icon';
import Image from '@global/Image';
import { t } from '../lib/i18n';

export const displayName = 'Accueil — Terre d\'Avenir KOMO-KANGO';
export const screenSize = 'desktop';

export default function HomeScreen() {
  return (
    <div className="bg-background font-body w-full">
      <SiteHeader activePage="accueil" />

      {/* ─── HERO SLIDER ─── */}
      <HeroSlider />

      {/* ─── MISSION STRIP ─── */}
      <section className="bg-background border-b border-border">
        <div className="mission-strip max-w-[1280px] mx-auto px-6 py-6 flex items-center justify-between gap-4">
          {[
            { icon: 'map-pin', label: t('Komo-Kango, Gabon') },
            { icon: 'users', label: t('Habitants, diaspora et partenaires') },
            { icon: 'leaf', label: t('Solidarité & développement local') },
            { icon: 'globe', label: t('Ouverte sur le monde') },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <Icon i={item.icon} size={18} className="text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground font-body">{item.label}</span>
              {i < 3 && <div className="ml-auto w-px h-5 bg-border" style={{ marginLeft: 'auto' }} />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── ANCRAGE ─── */}
      <section className="bg-background py-24" id="ong">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="rounded-lg overflow-hidden">
              <Image
                ar="4:3"
                prompt="documentary photograph of green tropical forest landscape in Komo-Kango Gabon, village clearing visible, late afternoon light through canopy, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
                className="w-full"
              />
            </div>
            {/* Year badge */}
            <div className="absolute -bottom-5 -right-5 rounded-lg px-6 py-5" style={{ background: '#005C38' }}>
              <p className="text-2xl font-bold text-primary-foreground font-headings">2022</p>
              <p className="text-xs font-body text-primary-foreground" style={{ opacity: 0.75 }}>{t('Fondée au Komo-Kango')}</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <SectionHeader
              overline={t('Notre ancrage')}
              title={t('Une ONG ancrée dans son territoire')}
              subtitle={t('Terre d\'Avenir KOMO-KANGO agit depuis le Komo-Kango, territoire gabonais, pour renforcer la solidarité locale et construire des ponts avec la diaspora et les partenaires extérieurs.')}
              subtitleAlign="justify"
            />
            <ul className="flex flex-col gap-4 mt-2">
              {[
                t('Mobiliser les habitants et ressortissants autour de projets concrets'),
                t('Documenter et partager les initiatives du territoire'),
                t('Tisser des liens durables avec des partenaires engagés'),
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-foreground leading-relaxed font-body" style={{ textAlign: 'justify' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#E6BF58' }}>
                    <Icon i="check" size={11} style={{ color: '#17372C' }} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/ong" className="bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-md w-fit mt-2 font-body flex items-center gap-2">
              {t('L\'ONG en détail')} <Icon i="arrow-right" size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── MOT DE LA PRÉSIDENTE ─── */}
      <section className="py-24" id="mot-presidente" style={{ background: '#F7F8F4' }}>
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 gap-20 items-center">
          {/* Portrait */}
          <div className="flex justify-center order-last">
            <div className="relative">
              <div className="rounded-lg overflow-hidden" style={{ width: 360, height: 420, border: '3px solid #E6BF58' }}>
                <Image
                  ar="3:4"
                  prompt="portrait photograph of an African woman, natural outdoor setting in Gabon, warm diffused light, professional and approachable expression, green vegetation in background, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
                  alt="Illustration de portrait — visuel à valider avant publication"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 left-6 right-6 rounded-md px-4 py-3 text-center" style={{ background: '#003E2A' }}>
                <p className="text-xs font-body text-primary-foreground" style={{ opacity: 0.65 }}>
                  {t('Portrait à valider avant toute publication')}
                </p>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="flex flex-col gap-5">
            <div className="mb-1">
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
                }}
              >
                {t('Le mot de la présidente')}
              </span>
            </div>

            <blockquote style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, lineHeight: 1.65, color: '#17372C', textAlign: 'justify' }}>
              {t('"Notre démarche s\'appuie sur un ancrage local et une volonté d\'ouverture. Aux habitants, aux ressortissants établis ailleurs, aux acteurs économiques et aux organisations qui partagent cette attention aux communautés, nous souhaitons proposer un espace de rencontre et de coopération."')}
            </blockquote>

            <GoldDivider />

            <div>
              <p className="font-bold text-foreground font-body">{t('La Présidente')}</p>
              <p className="text-sm text-muted-foreground font-body">{t('Terre d\'Avenir KOMO-KANGO')}</p>
            </div>

            <Link to="/ong#equipe" className="text-sm font-bold text-primary flex items-center gap-2 font-body">
              {t('Lire le message complet')} <Icon i="arrow-right" size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── THÈMES D'ACTION ─── */}
      <section className="bg-background py-24" id="actions">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="section-heading-row flex items-end justify-between mb-12">
            <SectionHeader
              overline={t('Nos thèmes d\'action')}
              title={t('Quatre axes pour construire ensemble')}
            />
            <Link to="/actualites" className="text-sm font-bold text-primary flex items-center gap-1 font-body flex-shrink-0">
              {t('Tous les projets')} <Icon i="arrow-right" size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-5">
            <ActionThemeCard
              icon="graduation-cap"
              title={t('Jeunesse & opportunités')}
              description={t('Accompagner les jeunes du Komo-Kango vers de nouvelles perspectives éducatives et professionnelles.')}
            />
            <ActionThemeCard
              icon="heart-pulse"
              title={t('Santé & sensibilisation')}
              description={t('Promouvoir l\'accès aux soins et diffuser des informations de prévention adaptées aux réalités locales.')}
            />
            <ActionThemeCard
              icon="trophy"
              title={t('Sport & cohésion')}
              description={t('Utiliser le sport comme vecteur de lien social et de cohésion entre les membres de la communauté.')}
            />
            <ActionThemeCard
              icon="handshake"
              title={t('Solidarité & vie locale')}
              description={t('Soutenir les initiatives de solidarité et renforcer le tissu social du Komo-Kango.')}
            />
          </div>
        </div>
      </section>

      {/* ─── ACTUALITÉS ─── */}
      <section className="py-24" style={{ background: '#F7F8F4' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="section-heading-row flex items-end justify-between mb-12">
            <SectionHeader
              overline={t('Actualités')}
              title={t('Initiatives documentées')}
            />
            <Link to="/actualites" className="text-sm font-bold text-primary flex items-center gap-1 font-body flex-shrink-0">
              {t('Toutes les actualités')} <Icon i="arrow-right" size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <NewsCard
              slug="initiative-jeunesse-1"
              category={t('Jeunesse')}
              title={t('Titre de l\'initiative à documenter')}
              date={t('Date à confirmer')}
              imagePrompt="documentary photograph of young people in outdoor community activity in Gabon, natural forest setting, warm light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
            />
            <NewsCard
              slug="initiative-sante-1"
              category={t('Santé')}
              title={t('Titre de l\'initiative à documenter')}
              date={t('Date à confirmer')}
              imagePrompt="documentary photograph of a health outreach event in a Gabon village, people gathered, warm natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
            />
            <NewsCard
              slug="initiative-sport-1"
              category={t('Sport')}
              title={t('Titre de l\'initiative à documenter')}
              date={t('Date à confirmer')}
              imagePrompt="documentary photograph of a community sports gathering in Gabon, youth playing outdoors, tropical backdrop, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
            />
          </div>
        </div>
      </section>

      {/* ─── STATS BAND ─── */}
      <section className="py-16" style={{ background: '#003E2A' }}>
        <div className="home-stats max-w-[1280px] mx-auto px-6 grid grid-cols-4 gap-8">
          {[
            { value: '—', label: t('Membres actifs') },
            { value: '—', label: t('Demandes reçues') },
            { value: '4', label: t('Axes d\'action') },
            { value: '—', label: t('Projets documentés') },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1 py-4 border-r last:border-r-0" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <span className="font-headings font-bold text-primary-foreground" style={{ fontSize: 44, color: '#E6BF58', lineHeight: 1.1 }}>{stat.value}</span>
              <span className="text-sm font-body text-primary-foreground font-medium" style={{ opacity: 0.75 }}>{stat.label}</span>
              <span className="text-xs font-body" style={{ opacity: 0.4, color: '#fff' }}>{t('Données à connecter')}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA DOUBLE ─── */}
      <section className="py-24" style={{ background: '#005C38' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="home-cta-grid grid grid-cols-2 gap-0 rounded-xl overflow-hidden">
            {/* Adhérer */}
            <div className="flex flex-col gap-5 p-12" style={{ background: 'rgba(0,0,0,0.12)' }}>
              <span className="text-xs font-bold font-body uppercase" style={{ letterSpacing: '0.14em', color: '#E6BF58', background: 'rgba(230,191,88,0.14)', border: '1px solid rgba(230,191,88,0.4)', borderRadius: 4, padding: '3px 10px', display: 'inline-block', alignSelf: 'flex-start' }}>
                {t('Rejoindre l\'ONG')}
              </span>
              <h2 className="text-3xl font-bold text-primary-foreground font-headings" style={{ lineHeight: 1.2 }}>
                {t('Adhérer à Terre d\'Avenir KOMO-KANGO')}
              </h2>
              <p className="text-base text-primary-foreground font-body leading-relaxed" style={{ opacity: 0.8, textAlign: 'justify' }}>
                {t('Complétez votre demande d\'adhésion. Elle sera examinée selon les modalités définies par l\'ONG. L\'envoi ne vaut pas admission automatique.')}
              </p>
              <Link to="/ong#adhesion" className="font-bold text-sm px-6 py-3 rounded-md w-fit font-body flex items-center gap-2" style={{ background: '#E6BF58', color: '#17372C' }}>
                <Icon i="user-plus" size={16} />
                {t('Faire une demande d\'adhésion')}
              </Link>
            </div>

            {/* Partenariat */}
            <div className="flex flex-col gap-5 p-12" style={{ borderLeft: '1px solid rgba(255,255,255,0.12)' }}>
              <span className="text-xs font-bold font-body uppercase" style={{ letterSpacing: '0.14em', color: '#E6BF58', background: 'rgba(230,191,88,0.14)', border: '1px solid rgba(230,191,88,0.4)', borderRadius: 4, padding: '3px 10px', display: 'inline-block', alignSelf: 'flex-start' }}>
                {t('Coopérer')}
              </span>
              <h2 className="text-3xl font-bold text-primary-foreground font-headings" style={{ lineHeight: 1.2 }}>
                {t('Proposer un partenariat')}
              </h2>
              <p className="text-base text-primary-foreground font-body leading-relaxed" style={{ opacity: 0.8, textAlign: 'justify' }}>
                {t('Vous êtes une organisation, une entreprise ou une institution partageant cette attention aux communautés ? Entrons en contact.')}
              </p>
              <Link to="/contact" className="font-bold text-sm px-6 py-3 rounded-md w-fit font-body text-primary-foreground flex items-center gap-2" style={{ border: '1.5px solid rgba(255,255,255,0.5)' }}>
                <Icon i="mail" size={16} />
                {t('Nous contacter')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

