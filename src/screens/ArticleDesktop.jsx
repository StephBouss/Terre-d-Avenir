import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '@components/SiteHeader';
import SiteFooter from '@components/SiteFooter';
import Icon from '@global/Icon';
import Image from '@global/Image';
import { t } from '../lib/i18n';
import { articles, getArticleBySlug } from '../data/articles';

export const displayName = 'Article détail — Terre d\'Avenir KOMO-KANGO';
export const screenSize = 'desktop';

export default function ArticleScreen() {
  const { slug } = useParams();
  const article = getArticleBySlug(slug) || articles[0];
  const relatedArticles = articles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="bg-background font-body w-full">
      <SiteHeader activePage="actualites" />

      {/* ─── ARTICLE HERO ─── */}
      <section className="article-hero relative min-h-[460px] w-full md:min-h-[560px]">
        <Image
          ar="21:9"
          prompt={article.imagePrompt}
          alt=""
          loading="eager"
          fetchPriority="high"
          className="w-full h-full object-cover absolute inset-0"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,62,42,0.3) 0%, rgba(0,62,42,0.8) 100%)',
          }}
        />
        {/* Content */}
        <div className="relative z-10 flex min-h-[460px] flex-col justify-end p-6 md:min-h-[560px] md:p-12">
          <div className="max-w-4xl">
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
              {article.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground font-headings mb-4" style={{ lineHeight: 1.15 }}>
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-primary-foreground">
              <span className="text-base font-body" style={{ opacity: 0.8 }}>{article.date}</span>
              <a
                href="https://www.facebook.com/profile.php?id=61573035845197"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-body font-medium"
                style={{ color: '#1877F2', opacity: 0.95 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
                {t('Voir sur Facebook')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ARTICLE CONTENT ─── */}
      <section className="bg-background py-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Article body */}
          <article className="max-w-none mb-16" style={{ fontFamily: 'var(--font-body)' }}>
            <h2 className="text-3xl font-bold text-foreground font-headings mb-6" style={{ lineHeight: 1.2 }}>
              {t('Le contexte')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6" style={{ textAlign: 'justify' }}>
              {t('Description du contexte de cette initiative. Expliquez les défis locaux, les opportunités identifiées et les raisons pour lesquelles cette action a été lancée. Vous pouvez inclure des détails sur la communauté concernée, les partenaires impliqués et les objectifs visés.')}
            </p>

            <h2 className="text-3xl font-bold text-foreground font-headings mt-10 mb-6" style={{ lineHeight: 1.2 }}>
              {t('Déroulement de l\'initiative')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4" style={{ textAlign: 'justify' }}>
              {t('Décrivez comment l\'initiative s\'est déroulée. Incluez les étapes clés, les activités menées, les personnes impliquées et les méthodes utilisées. Mettez en évidence les moments importants et les décisions prises au cours du projet.')}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6" style={{ textAlign: 'justify' }}>
              {t('Continuez avec des détails supplémentaires sur la mise en œuvre, les défis rencontrés et la façon dont ils ont été surmontés.')}
            </p>

            {/* Image in article */}
            <div className="my-12 rounded-lg overflow-hidden">
              <Image
                ar="16:9"
                prompt="documentary photograph of a community activity in Gabon with diverse participants, natural outdoor setting, warm afternoon light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
                className="w-full object-cover"
              />
            </div>

            <h2 className="text-3xl font-bold text-foreground font-headings mt-10 mb-6" style={{ lineHeight: 1.2 }}>
              {t('Résultats et impact')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6" style={{ textAlign: 'justify' }}>
              {t('Présentez les résultats concrets de l\'initiative. Combien de personnes ont été touchées ? Quels changements ont été observés ? Incluez des chiffres, des témoignages ou des observations qualitatives qui montrent l\'impact réel du projet sur la communauté.')}
            </p>

            <h2 className="text-3xl font-bold text-foreground font-headings mt-10 mb-6" style={{ lineHeight: 1.2 }}>
              {t('Perspectives futures')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed" style={{ textAlign: 'justify' }}>
              {t('Discutez des plans futurs. Comment cette initiative peut-elle être pérennisée ou développée ? Quelles sont les prochaines étapes ? Comment les partenaires peuvent-ils contribuer à la continuité du projet ?')}
            </p>
          </article>

          {/* Metadata */}
          <div className="border-t border-border pt-12 mt-16">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('Catégorie')}</p>
                <p className="text-lg font-bold text-foreground">{article.category}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('Date')}</p>
                <p className="text-lg font-bold text-foreground">{article.date}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('Partenaires')}</p>
                <p className="text-lg font-bold text-foreground">{t('À préciser')}</p>
              </div>
            </div>
          </div>

          {/* Share & actions */}
          <div className="flex flex-wrap items-center gap-4 mt-12 pt-12 border-t border-border">
            <span className="text-sm font-bold text-muted-foreground">{t('Partager :')}</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-medium"
              style={{ background: '#1877F2', color: '#fff' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              {t('Facebook')}
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-sm font-medium"
              style={{ background: '#E6BF58', color: '#17372C' }}
            >
              <Icon i="link-2" size={16} />
              {copied ? t('Lien copié') : t('Copier le lien')}
            </button>
          </div>
        </div>
      </section>

      {/* ─── RELATED ARTICLES ─── */}
      <section className="bg-background py-20" style={{ background: '#F7F8F4' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground font-headings mb-12">{t('Autres initiatives documentées')}</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                category: t('Santé'),
                title: t('Titre de l\'initiative à documenter'),
                date: t('Date à confirmer'),
                imagePrompt: 'documentary photograph of a health outreach event in a Gabon village, people gathered, warm natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
              },
              {
                category: t('Sport'),
                title: t('Titre de l\'initiative à documenter'),
                date: t('Date à confirmer'),
                imagePrompt: 'documentary photograph of a community sports gathering in Gabon, youth playing outdoors, tropical backdrop, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
              },
              {
                category: t('Solidarité'),
                title: t('Titre de l\'initiative à documenter'),
                date: t('Date à confirmer'),
                imagePrompt: 'documentary photograph of community solidarity event in Gabon village, people exchanging support, warm natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
              },
            ].map((article, i) => (
              <Link key={i} to={`/actualites/${relatedArticles[i].slug}`} className="bg-background rounded-lg overflow-hidden border border-border">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    ar="16:9"
                    prompt={article.imagePrompt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>
                    {article.category}
                  </span>
                  <h3 className="font-bold text-foreground leading-tight font-headings" style={{ fontSize: 16, lineHeight: 1.3 }}>
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">{article.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-24" style={{ background: '#005C38' }}>
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <div className="mb-6">
            <span
              className="text-xs font-bold font-body uppercase"
              style={{
                letterSpacing: '0.14em',
                color: '#E6BF58',
                background: 'rgba(230,191,88,0.14)',
                border: '1px solid rgba(230,191,88,0.4)',
                borderRadius: 4,
                padding: '3px 10px',
                display: 'inline-block',
              }}
            >
              {t('Vous engager')}
            </span>
          </div>
          <h2 className="text-4xl font-bold text-primary-foreground font-headings mb-4" style={{ lineHeight: 1.15 }}>
            {t('Soutenir cette initiative')}
          </h2>
          <p className="text-lg text-primary-foreground font-body max-w-2xl mx-auto mb-8" style={{ lineHeight: 1.65, opacity: 0.85 }}>
            {t('Vous souhaitez contribuer à cette initiative ou en savoir plus sur les moyens de soutenir Terre d\'Avenir KOMO-KANGO ? Contactez-nous ou adhérez à l\'ONG.')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/ong#adhesion"
              className="font-bold text-base px-8 py-3 rounded-md font-body flex items-center gap-2 inline-flex"
              style={{ background: '#E6BF58', color: '#17372C' }}
            >
              <Icon i="user-plus" size={17} />
              {t('Adhérer')}
            </Link>
            <Link
              to="/contact"
              className="font-bold text-base px-8 py-3 rounded-md font-body flex items-center gap-2 inline-flex text-primary-foreground"
              style={{ border: '1.5px solid rgba(255,255,255,0.5)' }}
            >
              {t('Nous contacter')}
              <Icon i="arrow-right" size={17} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

