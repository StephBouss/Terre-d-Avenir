import type { Page } from '@/payload-types'

export type Section = NonNullable<Page['sections']>[number]

export function getSection(page: Pick<Page, 'sections'> | null | undefined, key: string): Section | undefined {
  return page?.sections?.find((section) => section.key === key)
}
