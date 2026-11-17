import { it, expect, vi, afterEach } from 'vitest'
import { http } from './http-client'
import { ApiError, errorMessage } from '@/lib/errors/api-error'
import { ApiResponseError } from './api-response-error'
afterEach(() => vi.unstubAllGlobals())
it('handles JSON and forwards cancellation', async () => {
  const signal = new AbortController().signal
  const fetchMock = vi.fn().mockResolvedValue(
    new Response('{"ok":true}', {
      headers: { 'content-type': 'application/json' },
    }),
  )
  vi.stubGlobal('fetch', fetchMock)
  expect(await http.get('/example', { signal })).toEqual({ ok: true })
  expect(fetchMock.mock.calls[0]?.[1].signal).toBe(signal)
})
it('handles empty responses', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
  )
  expect(await http.delete('/example')).toBeUndefined()
})
it('normalizes HTTP errors without leaking response bodies', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response('secret', { status: 403 })),
  )
  await expect(http.get('/example')).rejects.toMatchObject({ status: 403 })
  expect(errorMessage(new ApiError(403))).toContain('do not have access')
  expect(errorMessage(new Error('secret'))).not.toContain('secret')
})
it('rejects malformed JSON', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response('{', { headers: { 'content-type': 'application/json' } }),
      ),
  )
  await expect(http.get('/example')).rejects.toThrow('Invalid JSON')
})
it('preserves abort errors', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')),
  )
  await expect(http.get('/example')).rejects.toMatchObject({
    name: 'AbortError',
  })
})

it('exposes validated error metadata while keeping existing ApiError behavior', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: {
            code: 'Validation.Failure',
            message: 'private server detail',
            errors: { email: ['private field detail'] },
          },
        }),
        {
          status: 400,
          headers: { 'content-type': 'application/problem+json' },
        },
      ),
    ),
  )
  const error = await http.post('/example').catch((error: unknown) => error)
  expect(error).toBeInstanceOf(ApiError)
  expect(error).toBeInstanceOf(ApiResponseError)
  expect(error).toMatchObject({
    status: 400,
    code: 'Validation.Failure',
    errors: { email: ['private field detail'] },
  })
  expect(String(error)).not.toContain('private')
  expect(errorMessage(error)).not.toContain('private')
})

it.each([
  ['60', 60],
  ['0', 0],
  [null, undefined],
  ['-1', undefined],
  ['1.5', undefined],
  ['Infinity', undefined],
  ['9007199254740992', undefined],
  ['Wed, 18 Nov 2026 00:00:00 GMT', undefined],
])('reads Retry-After delta-seconds safely: %s', async (header, expected) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(null, {
        status: 429,
        headers: header === null ? {} : { 'Retry-After': header },
      }),
    ),
  )
  await expect(http.post('/example')).rejects.toMatchObject({
    retryAfterSeconds: expected,
  })
})

it.each([
  ['{', 'application/json'],
  ['<html>private detail</html>', 'text/html'],
  [
    JSON.stringify({
      success: false,
      error: { code: 123, errors: { email: 'private' } },
    }),
    'application/json',
  ],
  [
    JSON.stringify({ success: true, error: { code: 'Validation.Failure' } }),
    'application/json',
  ],
])(
  'falls back safely for an untrusted error body: %s',
  async (body, contentType) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(body, {
          status: 400,
          headers: { 'content-type': contentType },
        }),
      ),
    )
    await expect(http.post('/example')).rejects.toMatchObject({
      status: 400,
      code: undefined,
      errors: undefined,
    })
  },
)

it('preserves cancellation while reading an error body', async () => {
  const response = new Response('{}', {
    status: 400,
    headers: { 'content-type': 'application/json' },
  })
  const abort = new DOMException('Aborted', 'AbortError')
  vi.spyOn(response, 'json').mockRejectedValue(abort)
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
  await expect(http.post('/example')).rejects.toBe(abort)
})
