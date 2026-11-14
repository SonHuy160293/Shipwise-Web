import { it, expect, vi, afterEach } from 'vitest'
import { http } from './http-client'
import { ApiError, errorMessage } from '@/lib/errors/api-error'
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
