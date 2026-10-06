import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Vitest n'expose pas les globales : sans cela, le DOM d'un test fuit dans le suivant.
afterEach(() => cleanup())

// Les collections Payload importent next/cache (hooks de revalidation) : inutile hors de Next.js.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
