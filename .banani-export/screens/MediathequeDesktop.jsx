import SiteHeader from '@components/SiteHeader';
import SiteFooter from '@components/SiteFooter';
import Icon from '@global/Icon';
import Image from '@global/Image';

export const displayName = 'Médiathèque — Terre d\'Avenir KOMO-KANGO';
export const screenSize = 'desktop';

const categories = [
  { label: t('Tout'), active: true },
  { label: t('Jeunesse'), active: false },
  { label: t('Santé'), active: false },
  { label: t('Sport'), active: false },
  { label: t('Solidarité'), active: false },
  { label: t('Vidéos'), active: false },
];

const mediaItems = [
  // LARGE featured
  {
    type: 'photo',
    size: 'large',
    category: t('Jeunesse'),
    caption: t('Activité jeunesse — Komo-Kango'),
    prompt: 'documentary photograph of young people in outdoor community activity in Gabon, natural forest setting, warm light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
  {
    type: 'video',
    size: 'medium',
    category: t('Sport'),
    caption: t('Tournoi de football communautaire'),
    prompt: 'documentary photograph of a community sports gathering in Gabon, youth playing outdoors, tropical backdrop, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
  {
    type: 'photo',
    size: 'medium',
    category: t('Solidarité'),
    caption: t('Rencontre de solidarité — Village'),
    prompt: 'documentary photograph of community solidarity event in Gabon village, people exchanging support, warm natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
  // Row 2
  {
    type: 'photo',
    size: 'small',
    category: t('Santé'),
    caption: t('Sensibilisation santé communautaire'),
    prompt: 'documentary photograph of a health outreach event in a Gabon village, people gathered, warm natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
  {
    type: 'photo',
    size: 'small',
    category: t('Jeunesse'),
    caption: t('Atelier éducatif en plein air'),
    prompt: 'documentary photograph of young Gabonese student reading book outdoors under tree, natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
  {
    type: 'video',
    size: 'small',
    category: t('Solidarité'),
    caption: t('Moment de partage communautaire'),
    prompt: 'documentary photograph of Gabonese community gathering outdoors, people smiling, warm afternoon light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
  {
    type: 'photo',
    size: 'small',
    category: t('Sport'),
    caption: t('Sortie sportive — jeunes du Komo-Kango'),
    prompt: 'documentary photograph of youth playing football in Gabon outdoor field, joyful, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
  // Row 3
  {
    type: 'photo',
    size: 'medium',
    category: t('Santé'),
    caption: t('Journée de prévention santé'),
    prompt: 'documentary photograph of Gabonese community health event outdoors, people gathered in circle, warm light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
  {
    type: 'photo',
    size: 'small',
    category: t('Jeunesse'),
    caption: t('Formation jeunesse — Komo-Kango'),
    prompt: 'documentary photograph of teacher and children in outdoor class in Gabon village, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
  {
    type: 'video',
    size: 'small',
    category: t('Sport'),
    caption: t('Initiation sportive — enfants du village'),
    prompt: 'documentary photograph of children playing outdoor sport in Gabon tropical setting, smiling, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
  {
    type: 'photo',
    size: 'small',
    category: t('Solidarité'),
    caption: t('Action solidaire — Komo-Kango'),
    prompt: 'documentary photograph of solidarity event in Gabon village, people exchanging, warm natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
  {
    type: 'photo',
    size: 'small',
    category: t('Jeunesse'),
    caption: t('Groupe de jeunes — activité collective'),
    prompt: 'documentary photograph of group of teenagers in outdoor learning activity in Gabon, smiling, natural background, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  },
];

// Heights per size
const sizeH = { large: 480, medium: 320, small: 240 };

function MediaCard({ item }) {
  return (
    <div className="relative overflow-hidden rounded-lg group" style={{ height: sizeH[item.size] }}>
      <Image
        ar={item.size === 'large' ? '4:3' : item.size === 'medium' ? '4:3' : '1:1'}
        prompt={item.prompt}
        className="w-full h-full object-cover"
      />

      {/* Dark overlay on hover simulation — always slightly visible for UX */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 40%, rgba(0,30,20,0.80) 100%)',
        }}
      />

      {/* Video play button */}
      {item.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            }}
          >
            <Icon i="play" size={22} style={{ color: '#005C38', marginLeft: 3 }} />
          </div>
        </div>
      )}

      {/* Bottom caption */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-4">
        <div className="flex items-end justify-between gap-2">
          <div>
            <span
              className="text-xs font-bold font-body uppercase block mb-1"
              style={{
                letterSpacing: '0.12em',
                color: '#E6BF58',
              }}
            >
              {item.category}
            </span>
            <p className="text-sm font-medium text-primary-foreground font-body leading-tight" style={{ lineHeight: 1.3 }}>
              {item.caption}
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: 'rgba(230,191,88,0.2)', border: '1px solid rgba(230,191,88,0.4)' }}>
            <Icon i={item.type === 'video' ? 'video' : 'image'} size={14} style={{ color: '#E6BF58' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MediathequeScreen() {
  return (
    <div className="bg-background font-body w-full">
      <SiteHeader activePage="mediatheque" />

      {/* ─── HERO BANNER ─── */}
      <section className="relative py-24 overflow-hidden" style={{ background: '#003E2A', minHeight: 400 }}>
        {/* BG photo */}
        <div className="absolute inset-0 z-0">
          <Image
            ar="21:9"
            prompt="wide documentary photograph of a Gabonese community gathering outdoors, tropical forest of Komo-Kango in background, golden afternoon light, warm greens and earth tones, no text no watermarks, palette: deep forest green, warm gold light, earthy tones"
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
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          <div>
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
              {t('Médiathèque')}
            </span>
            <h1 className="text-5xl font-bold text-primary-foreground font-headings mb-4" style={{ lineHeight: 1.1 }}>
              {t('Photos & vidéos des actions menées')}
            </h1>
            <p className="text-lg text-primary-foreground mb-0" style={{ opacity: 0.88, maxWidth: 560 }}>
              {t('Retrouvez ici les moments forts des activités, sorties et actions de Terre d\'Avenir KOMO-KANGO sur le terrain au Gabon.')}
            </p>
          </div>
          {/* Stats */}
          <div className="flex-shrink-0 flex gap-10 pl-16" style={{ borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
            {[
              { val: '—', lbl: t('Photos') },
              { val: '—', lbl: t('Vidéos') },
              { val: '4', lbl: t('Catégories') },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="font-headings font-bold" style={{ fontSize: 36, color: '#E6BF58', lineHeight: 1 }}>{s.val}</span>
                <span className="text-xs font-body text-primary-foreground" style={{ opacity: 0.65 }}>{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FILTERS ─── */}
      <section className="bg-background border-b border-border py-0">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center gap-2 py-5">
            <Icon i="filter" size={16} className="text-muted-foreground mr-2" />
            {categories.map((cat, i) => (
              <a
                key={i}
                className="px-5 py-2 rounded-md text-sm font-bold font-body"
                style={
                  cat.active
                    ? { background: '#005C38', color: '#fff' }
                    : { background: '#F7F8F4', color: '#666', border: '1px solid #e8e8e8' }
                }
              >
                {cat.label}
              </a>
            ))}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-body">{t('Affichage :')}</span>
              <a className="p-2 rounded-md" style={{ background: '#F7F8F4', border: '1px solid #e8e8e8' }}>
                <Icon i="grid-3x3" size={16} style={{ color: '#005C38' }} />
              </a>
              <a className="p-2 rounded-md" style={{ background: '#F7F8F4', border: '1px solid #e8e8e8' }}>
                <Icon i="rows-3" size={16} style={{ color: '#aaa' }} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MASONRY / GRID GALLERY ─── */}
      <section className="bg-background py-16">
        <div className="max-w-[1280px] mx-auto px-6">

          {/* ROW 1 — featured large + 2 medium */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <MediaCard item={mediaItems[0]} />
            </div>
            <div className="flex flex-col gap-4">
              <MediaCard item={mediaItems[1]} />
              <MediaCard item={mediaItems[2]} />
            </div>
          </div>

          {/* ROW 2 — 4 small */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {mediaItems.slice(3, 7).map((item, i) => (
              <MediaCard key={i} item={item} />
            ))}
          </div>

          {/* ROW 3 — medium + 4 small */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <MediaCard item={mediaItems[7]} />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {mediaItems.slice(8, 12).map((item, i) => (
                <MediaCard key={i} item={item} />
              ))}
            </div>
          </div>

          {/* Load more */}
          <div className="flex justify-center mt-12">
            <a
              className="font-bold text-base px-10 py-3 rounded-md font-body flex items-center gap-2"
              style={{ border: '1.5px solid #005C38', color: '#005C38' }}
            >
              <Icon i="plus" size={17} />
              {t('Voir plus de médias')}
            </a>
          </div>
        </div>
      </section>

      {/* ─── CONTRIBUTE CTA ─── */}
      <section className="py-20" style={{ background: '#003E2A' }}>
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between gap-12">
          <div className="flex flex-col gap-3">
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
                alignSelf: 'flex-start',
              }}
            >
              {t('Contribuer')}
            </span>
            <h2 className="text-3xl font-bold text-primary-foreground font-headings" style={{ lineHeight: 1.2 }}>
              {t('Vous avez des photos ou vidéos à partager ?')}
            </h2>
            <p className="text-base text-primary-foreground font-body" style={{ opacity: 0.8, maxWidth: 560 }}>
              {t('Si vous avez participé à une action de l\'ONG et souhaitez partager vos médias pour enrichir cette médiathèque, contactez-nous directement.')}
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-4">
            <a
              className="font-bold text-base px-8 py-3 rounded-md font-body flex items-center gap-2"
              style={{ background: '#E6BF58', color: '#17372C' }}
            >
              <Icon i="upload" size={17} />
              {t('Proposer un média')}
            </a>
            <a
              className="font-bold text-base px-8 py-3 rounded-md font-body flex items-center gap-2 text-primary-foreground"
              style={{ border: '1.5px solid rgba(255,255,255,0.4)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              {t('Facebook')}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

