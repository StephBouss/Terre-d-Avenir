import { useMemo, useState } from 'react';

const IMAGES = {
  forest:
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1800&q=85',
  portrait:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
  youth:
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1600&q=85',
  education:
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1600&q=85',
  sport:
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1600&q=85',
  health:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85',
  community:
    'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1800&q=85',
  solidarity:
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1600&q=85',
};

function resolveImage(prompt = '') {
  const value = prompt.toLowerCase();

  if (value.includes('portrait') || value.includes('woman')) return IMAGES.portrait;
  if (value.includes('football') || value.includes('sport')) return IMAGES.sport;
  if (value.includes('health')) return IMAGES.health;
  if (value.includes('student') || value.includes('teacher') || value.includes('education')) {
    return IMAGES.education;
  }
  if (value.includes('children') || value.includes('teenager') || value.includes('young')) {
    return IMAGES.youth;
  }
  if (value.includes('solidarity') || value.includes('hands')) return IMAGES.solidarity;
  if (value.includes('forest') || value.includes('landscape') || value.includes('map')) {
    return IMAGES.forest;
  }
  return IMAGES.community;
}

function resolveAlt(prompt = '') {
  const value = prompt.toLowerCase();
  if (value.includes('portrait')) return 'Portrait de la présidente de Terre d’Avenir';
  if (value.includes('football') || value.includes('sport')) return 'Activité sportive communautaire';
  if (value.includes('health')) return 'Action de sensibilisation à la santé';
  if (value.includes('forest') || value.includes('landscape')) return 'Paysage forestier du Komo-Kango';
  if (value.includes('young') || value.includes('children') || value.includes('student')) {
    return 'Jeunes participant à une activité communautaire';
  }
  return 'Communauté de Terre d’Avenir KOMO-KANGO';
}

export default function Image({ ar, prompt = '', alt, className = '', style, ...props }) {
  const [failed, setFailed] = useState(false);
  const src = useMemo(() => resolveImage(prompt), [prompt]);
  const aspectRatio = ar?.replace(':', ' / ');
  const accessibleAlt = alt === undefined ? resolveAlt(prompt) : alt;

  if (failed) {
    return (
      <div
        role={accessibleAlt ? 'img' : undefined}
        aria-label={accessibleAlt || undefined}
        aria-hidden={accessibleAlt ? undefined : 'true'}
        className={`image-fallback ${className}`}
        style={{ aspectRatio, ...style }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={accessibleAlt}
      className={className}
      style={{ aspectRatio, ...style }}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
