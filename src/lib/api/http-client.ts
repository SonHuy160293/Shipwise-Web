import { z } from 'zod'
import { env } from '@/config/env'
import { ApiError } from '@/lib/errors/api-error'
import { ApiResponseError } from '@/lib/api/api-response-error'

const failureSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    errors: z.record(z.string(), z.array(z.string())).nullish(),
  }),
})

function isJson(response: Response) {
  return /^application\/(?:[\w.-]+\+)?json(?:\s*;|$)/i.test(
    response.headers.get('content-type') ?? '',
  )
}

async function responseError(response: Response) {
  let body: unknown
  if (isJson(response)) {
    try {
      body = await response.json()
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error
    }
  }
  const parsed = failureSchema.safeParse(body)
  const retryAfter = response.headers.get('retry-after')
  const seconds =
    retryAfter !== null && /^\d+$/.test(retryAfter)
      ? Number(retryAfter)
      : undefined

  return new ApiResponseError(response.status, {
    code: parsed.success ? parsed.data.error.code : undefined,
    errors: parsed.success
      ? (parsed.data.error.errors ?? undefined)
      : undefined,
    retryAfterSeconds: Number.isSafeInteger(seconds) ? seconds : undefined,
  })
}
type Options = Omit<RequestInit, 'method' | 'body'> & { body?: unknown }
export async function request<T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  options: Options = {},
): Promise<T | undefined> {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://'))
    throw new Error('API paths must be relative to the configured base URL.')
  const { body, ...init } = options
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  const response = await fetch(env.apiBaseUrl.replace(/\/$/, '') + path, {
    ...init,
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  if (!response.ok) throw await responseError(response)
  if (response.status === 204 || response.status === 205) return undefined
  const text = await response.text()
  if (!text.trim()) return undefined
  if (!isJson(response))
    throw new ApiError(response.status, 'Unexpected response format.')
  try {
    return JSON.parse(text) as T
  } catch {
    throw new ApiError(response.status, 'Invalid JSON response.')
  }
}
export const http = {
  get: <T = unknown>(path: string, options?: Options) =>
    request<T>('GET', path, options),
  post: <T = unknown>(path: string, options?: Options) =>
    request<T>('POST', path, options),
  put: <T = unknown>(path: string, options?: Options) =>
    request<T>('PUT', path, options),
  patch: <T = unknown>(path: string, options?: Options) =>
    request<T>('PATCH', path, options),
  delete: <T = unknown>(path: string, options?: Options) =>
    request<T>('DELETE', path, options),
}
