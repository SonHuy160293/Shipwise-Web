import { z } from 'zod'
const baseUrl = z
  .string()
  .refine(
    (value) =>
      (value.startsWith('/') && !value.startsWith('//')) ||
      /^https?:\/\//.test(value),
    'Use a relative path or HTTP(S) URL',
  )
export const env = z
  .object({ apiBaseUrl: baseUrl })
  .parse({ apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api' })
