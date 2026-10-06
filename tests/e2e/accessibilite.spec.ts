import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ALL_PATHS } from './helpers'

test.use({ reducedMotion: 'reduce' })

for (const path of ALL_PATHS('fr')) {
  test(`axe ${path}`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(blocking.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
  })
}
