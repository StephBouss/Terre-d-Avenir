import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import HomeScreen from '@screens/AccueilDesktop';
import ActualitesScreen from '@screens/ActualitesDesktop';
import ArticleScreen from '@screens/ArticleDesktop';
import ContactScreen from '@screens/ContactDesktop';
import OngDetailScreen from '@screens/OngDetailAdhesionDesktop';
import MediathequeScreen from '@screens/MediathequeDesktop';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const titles = {
      '/': 'Accueil — Terre d’Avenir KOMO-KANGO',
      '/actualites': 'Actualités — Terre d’Avenir KOMO-KANGO',
      '/actualites/article': 'Article — Terre d’Avenir KOMO-KANGO',
      '/contact': 'Contact — Terre d’Avenir KOMO-KANGO',
      '/ong': 'L’ONG & Adhésion — Terre d’Avenir KOMO-KANGO',
      '/mediatheque': 'Médiathèque — Terre d’Avenir KOMO-KANGO',
    };
    document.title = titles[pathname] || titles['/'];

    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/actualites" element={<ActualitesScreen />} />
        <Route path="/actualites/:slug" element={<ArticleScreen />} />
        <Route path="/contact" element={<ContactScreen />} />
        <Route path="/ong" element={<OngDetailScreen />} />
        <Route path="/mediatheque" element={<MediathequeScreen />} />
        <Route path="*" element={<HomeScreen />} />
      </Routes>
    </>
  );
}
