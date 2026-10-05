import { Link } from 'react-router-dom';
import Image from '@global/Image';
import Icon from '@global/Icon';
import { t } from '../lib/i18n';

export const displayName = 'Hero Slider';
export const shortDescription = 'Slideshow héro — formes blob permanentes, photos intérieures animées';

// Slide 1 photos (communauté)
const S1 = [
  'close portrait of smiling Gabonese woman outdoors, warm golden light, green forest background, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  'Gabonese children laughing together outdoors, village setting, natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  'community members working together in lush green Gabon forest, hands joining, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
];
// Slide 2 photos (jeunesse)
const S2 = [
  'young Gabonese student reading book outdoors under tree, natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  'group of teenagers outdoor learning activity in Gabon, smiling, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  'teacher and children in outdoor class Gabon village, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
];
// Slide 3 photos (solidarité)
const S3 = [
  'Gabonese community health event outdoors, people gathered, warm light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  'youth playing football Gabon outdoor field, joyful, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  'solidarity gathering Gabon village, people exchanging, warm natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
];

// The 3 sets of photos — index 0=large top, 1=bottom-left, 2=bottom-right
// Each blob gets [slideA_photo, slideB_photo, slideC_photo]
const blobPhotos = [
  [S1[0], S2[0], S3[0]], // blob 1 (large top)
  [S1[1], S2[1], S3[1]], // blob 2 (bottom-left)
  [S1[2], S2[2], S3[2]], // blob 3 (bottom-right)
];

const blobClasses = ['hero-photo-1', 'hero-photo-2', 'hero-photo-3'];
const blobArs = ['4:5', '1:1', '1:1'];

export default function HeroSlider() {
  return (
    <section className="hero-slider">

      {/* ── Background slides ── */}
      <div className="hero-slide">
        <Image ar="21:9" prompt="wide documentary photograph of a Gabonese community gathering outdoors, tropical forest of Komo-Kango in background, golden afternoon light, warm greens and earth tones, no text no watermarks, palette: deep forest green, warm gold light, earthy tones" alt="" loading="eager" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="hero-slide">
        <Image ar="21:9" prompt="wide documentary photograph of young people in Gabon engaged in outdoor education near a village, green tropical trees in background, natural light, candid and hopeful, no text no watermarks, palette: deep forest green, warm gold light, earthy tones" alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="hero-slide">
        <Image ar="21:9" prompt="wide documentary photograph of Gabon village life at the edge of a forest, children and adults in community space, soft diffused daylight, green canopy above, no text no watermarks, palette: deep forest green, warm gold light, earthy tones" alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Overlay */}
      <div className="hero-overlay" />

      {/* Progress bar */}
      <div className="hero-progress" />

      {/* Vertical dots */}
      <div className="hero-nav">
        <div className="hero-nav-dot active" />
        <div className="hero-nav-dot" />
        <div className="hero-nav-dot" />
      </div>

      {/* ── Main content ── */}
      <div className="hero-content max-w-[1280px] mx-auto px-6 w-full">
        <div className="flex items-center justify-between w-full gap-12">

          {/* LEFT — text */}
          <div style={{ maxWidth: 620, flex: '1 1 auto' }}>

            <div className="hero-line-1 mb-6">
              <span className="text-xs font-bold font-body uppercase" style={{ letterSpacing: '0.14em', color: '#E6BF58', background: 'rgba(230,191,88,0.14)', border: '1px solid rgba(230,191,88,0.4)', borderRadius: 4, padding: '4px 12px', display: 'inline-block' }}>
                {t('Komo-Kango, Gabon')}
              </span>
            </div>

            <h1 className="hero-line-2 font-headings font-bold text-primary-foreground mb-5" style={{ fontSize: 52, lineHeight: 1.1 }}>
              {t('Du Komo-Kango au monde,')}<br />
              <span style={{ color: '#E6BF58' }}>{t('faisons grandir')}</span>{t(' la solidarité.')}
            </h1>

            <p className="hero-line-3 font-body text-lg text-primary-foreground mb-8" style={{ opacity: 0.82, lineHeight: 1.65, maxWidth: 500, textAlign: 'justify' }}>
              {t('Ancrée au Komo-Kango, au Gabon, Terre d\'Avenir rassemble les énergies autour de la solidarité et du développement local. Découvrez notre démarche, les initiatives documentées et les possibilités de participation.')}
            </p>

            <div className="hero-line-4 flex gap-4 flex-wrap">
              <Link to="/ong#adhesion" className="font-bold text-base px-7 py-3 rounded-md font-body flex items-center gap-2" style={{ background: '#E6BF58', color: '#17372C' }}>
                <Icon i="user-plus" size={17} />
                {t('Adhérer')}
              </Link>
              <Link to="/#actions" className="font-bold text-base px-7 py-3 rounded-md font-body flex items-center gap-2 text-primary-foreground" style={{ border: '1.5px solid rgba(255,255,255,0.5)' }}>
                {t('Découvrir nos actions')}
                <Icon i="arrow-right" size={17} />
              </Link>
            </div>

            <div className="hero-line-4 flex gap-8 mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              {[
                { val: '4', lbl: t('Axes d\'action') },
                { val: '—', lbl: t('Membres actifs') },
                { val: '—', lbl: t('Projets documentés') },
              ].map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-headings font-bold" style={{ fontSize: 28, color: '#E6BF58', lineHeight: 1 }}>{s.val}</span>
                  <span className="text-xs font-body text-primary-foreground mt-1" style={{ opacity: 0.6 }}>{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — collage avec formes permanentes, photos animées */}
          <div className="hero-collage flex-shrink-0">

            {/* Déco dots */}
            <div className="hero-dot-decor" style={{ width: 10, height: 10, top: -10, right: 60 }} />
            <div className="hero-dot-decor" style={{ width: 14, height: 14, bottom: 60, left: -14, opacity: 0.4 }} />
            <div className="hero-dot-decor" style={{ width: 8, height: 8, top: 160, right: -12 }} />

            {/* Chaque blob est permanent — les photos à l'intérieur s'animent */}
            {blobPhotos.map((photos, blobIdx) => (
              <div key={blobIdx} className={`hero-photo ${blobClasses[blobIdx]}`}>
                {photos.map((prompt, photoIdx) => (
                  <div key={photoIdx} className="photo-inner">
                    <Image ar={blobArs[blobIdx]} prompt={prompt} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ))}

          </div>

        </div>
      </div>
    </section>
  );
}

