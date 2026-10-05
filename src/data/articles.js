const title = "Titre de l'initiative à documenter";
const date = 'Date à confirmer';

const prompts = {
  jeunesse:
    'documentary photograph of young people in outdoor community activity in Gabon, natural forest setting, warm light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  sante:
    'documentary photograph of a health outreach event in a Gabon village, people gathered, warm natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  sport:
    'documentary photograph of a community sports gathering in Gabon, youth playing outdoors, tropical backdrop, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
  solidarite:
    'documentary photograph of community solidarity event in Gabon village, people exchanging support, warm natural light, no text no watermarks, palette: deep forest green, warm gold light, earthy tones',
};

const articleGroups = [
  ['jeunesse', 'Jeunesse'],
  ['sante', 'Santé'],
  ['sport', 'Sport'],
  ['solidarite', 'Solidarité'],
];

export const articles = Array.from({ length: 12 }, (_, index) => {
  const [categoryId, category] = articleGroups[index % articleGroups.length];
  const occurrence = Math.floor(index / articleGroups.length) + 1;

  return {
    id: `${categoryId}-${occurrence}`,
    slug: `initiative-${categoryId}-${occurrence}`,
    categoryId,
    category,
    title,
    date,
    imagePrompt: prompts[categoryId],
  };
});

export function getArticleBySlug(slug) {
  return articles.find((article) => article.slug === slug);
}
