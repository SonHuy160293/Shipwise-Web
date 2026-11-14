import { env } from '@/config/env'
import { ApiError } from '@/lib/errors/api-error'
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
  if (!response.ok) throw new ApiError(response.status)
  if (response.status === 204 || response.status === 205) return undefined
  const text = await response.text()
  if (!text.trim()) return undefined
  if (
    !/application\/(?:[\w.-]+\+)?json/i.test(
      response.headers.get('content-type') ?? '',
    )
  )
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
