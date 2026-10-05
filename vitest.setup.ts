import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Les collections Payload importent next/cache (hooks de revalidation) : inutile hors de Next.js.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
