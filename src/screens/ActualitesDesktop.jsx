import { Link } from 'react-router-dom';
import SiteHeader from '@components/SiteHeader';
import SiteFooter from '@components/SiteFooter';
import NewsCard from '@components/NewsCard';
import Icon from '@global/Icon';
import Image from '@global/Image';
import { t } from '../lib/i18n';
import { articles } from '../data/articles';

export const displayName = 'Actualités — Terre d\'Avenir KOMO-KANGO';
export const screenSize = 'desktop';

export default function ActualitesScreen() {
  return (
    <div className="bg-background font-body w-full">
      <SiteHeader activePage="actualites" />

      {/* ─── HERO BANNER — like homepage slider ─── */}
      <section className="relative flex items-center overflow-hidden py-16 md:py-20" style={{ background: '#003E2A', minHeight: 520 }}>
        {/* Background image with animation */}
        <div className="absolute inset-0 z-0">
          <Image
            ar="21:9"
            prompt="wide documentary photograph of Gabon village life at the edge of a forest, children and adults in community space, soft diffused daylight, green canopy above, no text no typography no watermarks, palette: deep forest green, warm gold light, earthy tones"
            alt=""
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover"
            style={{ opacity: 0.55 }}
          />
        </div>

        {/* Gradient overlay — similar to HeroSlider */}
        <div
          className="absolute inset-0 z-1"
          style={{
            background: 'linear-gradient(105deg, #003E2Aea 28%, #003E2Acc 52%, #003E2A99 100%)',
          }}
        />

        {/* Content — left side visible, right side blurred */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 h-full">
          <div className="flex min-h-[360px] items-center justify-between gap-8 md:min-h-[420px] md:gap-16">
            
            {/* LEFT — Text (visible) */}
            <div style={{ maxWidth: 620, flex: '1 1 auto' }}>
              <span
                className="text-xs font-bold font-body uppercase hero-line-1"
                style={{
                  letterSpacing: '0.14em',
                  color: '#E6BF58',
                  background: 'rgba(230,191,88,0.14)',
                  border: '1px solid rgba(230,191,88,0.4)',
                  borderRadius: 4,
                  padding: '4px 12px',
                  display: 'inline-block',
                  marginBottom: 16,
                  animation: 'slideUp 0.65s cubic-bezier(.22,1,.36,1) 0.15s both',
                }}
              >
                {t('Actualités')}
              </span>
              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground font-headings hero-line-2" 
                style={{ 
                  lineHeight: 1.1,
                  marginBottom: 20,
                  animation: 'slideUp 0.65s cubic-bezier(.22,1,.36,1) 0.32s both',
                }}
              >
                {t('Toutes les initiatives documentées')}
              </h1>
              <p 
                className="text-lg text-primary-foreground font-body hero-line-3" 
                style={{ 
                  opacity: 0.9,
                  lineHeight: 1.65,
                  maxWidth: 500,
                  animation: 'slideUp 0.65s cubic-bezier(.22,1,.36,1) 0.48s both',
                }}
              >
                {t('Découvrez les projets et actions menées par Terre d\'Avenir KOMO-KANGO dans le Komo-Kango et au-delà.')}
              </p>
            </div>

            {/* RIGHT — Icon (faded/blurred effect) */}
            <div 
              className="hidden flex-shrink-0 hero-line-4 md:block" 
              style={{
                animation: 'slideUp 0.65s cubic-bezier(.22,1,.36,1) 0.62s both',
              }}
            >
              <Icon i="bookmark" size={64} style={{ color: '#E6BF58', opacity: 0.15 }} />
            </div>
          </div>
        </div>

        {/* CSS for animation */}
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(26px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes heroBgFade {
            0%   { opacity: 0.2; }
            50%  { opacity: 0.35; }
            100% { opacity: 0.2; }
          }
        `}</style>
      </section>

      {/* ─── ARTICLES GRID ─── */}
      <section className="bg-background py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="sr-only">{t('Liste des initiatives')}</h2>
          <div className="grid grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard
                key={article.id}
                slug={article.slug}
                category={article.category}
                title={article.title}
                date={article.date}
                imagePrompt={article.imagePrompt}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-24" style={{ background: '#F7F8F4' }}>
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <div className="mb-6">
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
              {t('Vous engager')}
            </span>
          </div>
          <h2 className="text-4xl font-bold text-foreground font-headings mb-4" style={{ lineHeight: 1.15 }}>
            {t('Rejoindre Terre d\'Avenir KOMO-KANGO')}
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto mb-8" style={{ lineHeight: 1.65 }}>
            {t('Vous souhaitez soutenir les initiatives documentées ou vous engager aux côtés de l\'ONG ? Complétez votre demande d\'adhésion ou proposez une coopération.')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/ong#adhesion"
              className="font-bold text-base px-8 py-3 rounded-md font-body flex items-center gap-2"
              style={{ background: '#005C38', color: '#ffffff' }}
            >
              <Icon i="user-plus" size={17} />
              {t('Adhérer')}
            </Link>
            <Link
              to="/contact"
              className="font-bold text-base px-8 py-3 rounded-md font-body flex items-center gap-2"
              style={{ border: '1.5px solid #005C38', color: '#005C38' }}
            >
              {t('Proposer un partenariat')}
              <Icon i="arrow-right" size={17} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

