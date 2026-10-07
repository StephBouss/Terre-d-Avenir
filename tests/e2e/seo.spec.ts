import { expect, test } from '@playwright/test'

test('sitemap.xml : 52 URL, hreflang, URLs absolues', async ({ request }) => {
  const res = await request.get('/sitemap.xml')
  expect(res.ok()).toBe(true)
  const xml = await res.text()
  // Les contenus créés par d’autres specs en parallèle (slugs « e2e- ») ne comptent pas.
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((loc) => !/\/e2e-/.test(loc))
  expect(locs).toHaveLength(52)
  for (const loc of locs) expect(loc).toMatch(/^https?:\/\//)
  const origin = new URL(locs[0]).origin
  expect(locs).toContain(`${origin}/fr`)
  expect(locs).toContain(`${origin}/en/contact`)
  expect(xml).toContain('hreflang="en"')
  expect(xml).toContain('hreflang="x-default"')
  expect(xml).not.toMatch(/\/(es|pt|ar|zh-Hans)(\/|<)/)
})

test('robots.txt : admin et API exclus, sitemap référencé', async ({ request }) => {
  const res = await request.get('/robots.txt')
  expect(res.ok()).toBe(true)
  const txt = await res.text()
  expect(txt).toMatch(/Disallow: \/admin/)
  expect(txt).toMatch(/Disallow: \/api/)
  expect(txt).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/)
})
