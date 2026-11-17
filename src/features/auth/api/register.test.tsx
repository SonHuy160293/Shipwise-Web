import type { ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import type { paths } from '@/lib/api/generated/schema'
import { registerUser, useRegisterMutation } from './register'
import { mapRegistrationError, RegistrationError } from './registration-error'
import {
  registrationFieldMessages,
  type RegistrationInput,
} from '../schemas/registration'

const input: RegistrationInput = {
  email: ' Ana@Example.com ',
  displayName: ' Ana ',
  password: '  password  ',
}
const created = {
  success: true,
  data: { userId: '019cfc22-7a83-7000-8000-000000000001' },
  error: null,
} satisfies paths['/api/v1/auth/register']['post']['responses'][201]['content']['application/json']

afterEach(() => vi.unstubAllGlobals())

function mockResponse(
  body: unknown,
  status = 201,
  headers: Record<string, string> = {},
) {
  const fetchMock = vi.fn().mockImplementation(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json', ...headers },
      }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function failure(code: string, errors?: Record<string, string[]>) {
  return {
    success: false,
    data: null,
    error: { code, message: 'private server detail', errors },
  }
}

it('posts only the contract fields through /api once, with cancellation', async () => {
  const fetchMock = mockResponse(created)
  const signal = new AbortController().signal
  expect(await registerUser(input, { signal })).toEqual(created.data)
  const [url, init] = fetchMock.mock.calls[0]!
  expect(url).toBe('/api/v1/auth/register')
  expect(init.method).toBe('POST')
  expect(init.signal).toBe(signal)
  expect(init.headers.get('Content-Type')).toBe('application/json')
  expect(init.headers.has('Authorization')).toBe(false)
  expect(JSON.parse(init.body)).toEqual({
    email: 'Ana@Example.com',
    displayName: 'Ana',
    password: input.password,
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it('exposes the successful mutation and releases its sensitive variables on reset', async () => {
  mockResponse(created)
  const client = new QueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const { result, unmount } = renderHook(() => useRegisterMutation(), {
    wrapper,
  })
  await act(async () => {
    await result.current.mutateAsync(input)
  })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toEqual(created.data)
  act(() => result.current.reset())
  await waitFor(() => expect(result.current.variables).toBeUndefined())
  await waitFor(() =>
    expect(client.getMutationCache().getAll()).toHaveLength(0),
  )
  unmount()
  client.clear()
})

it('maps every known 400 field to frontend copy and ignores unknown fields', async () => {
  mockResponse(
    failure('Validation.Failure', {
      email: ['private email'],
      displayName: ['private name'],
      password: ['private password'],
      unexpected: ['private'],
    }),
    400,
  )
  await expect(registerUser(input)).rejects.toMatchObject({
    details: { kind: 'validation', fieldErrors: registrationFieldMessages },
  })
  try {
    await registerUser(input)
  } catch (error) {
    expect(error).toBeInstanceOf(RegistrationError)
    expect(JSON.stringify(mapRegistrationError(error))).not.toContain('private')
  }
})

it('rejects local validation failures without sending a request', async () => {
  const fetchMock = mockResponse(created)
  await expect(
    registerUser({ email: '', displayName: '', password: '' }),
  ).rejects.toMatchObject({
    details: { kind: 'validation', fieldErrors: registrationFieldMessages },
  })
  expect(fetchMock).not.toHaveBeenCalled()
})

it.each([
  [
    409,
    'Registration.EmailTaken',
    'email-taken',
    'An account with this email already exists.',
  ],
  [
    404,
    'Request.NotFound',
    'unavailable',
    'Registration is currently unavailable. Contact your administrator if you need an account.',
  ],
  [
    429,
    'Request.TooManyRequests',
    'rate-limited',
    'Too many registration attempts. Please wait a moment and try again.',
  ],
  [
    400,
    'Unrecognized.Code',
    'failure',
    'Unable to create your account right now. Please try again.',
  ],
  [
    409,
    'Request.NotFound',
    'failure',
    'Unable to create your account right now. Please try again.',
  ],
  [
    413,
    'Payload.TooLarge',
    'failure',
    'Unable to create your account right now. Please try again.',
  ],
  [
    500,
    'Server.Failure',
    'failure',
    'Unable to create your account right now. Please try again.',
  ],
])(
  'maps HTTP %s %s to safe typed results',
  async (status, code, kind, message) => {
    mockResponse(failure(code), status)
    await expect(registerUser(input)).rejects.toMatchObject({
      message,
      details: { kind, message },
    })
  },
)

it('maps Retry-After to seconds and safe form copy', async () => {
  mockResponse(failure('Request.TooManyRequests'), 429, { 'Retry-After': '42' })
  await expect(registerUser(input)).rejects.toMatchObject({
    details: {
      kind: 'rate-limited',
      retryAfterSeconds: 42,
      message:
        'Too many registration attempts. Please wait 42 seconds and try again.',
    },
  })
})

it.each([
  undefined,
  {},
  { success: false, data: created.data },
  { success: true, data: { userId: 'private invalid id' } },
])('rejects a missing or malformed success envelope', async (body) => {
  mockResponse(body)
  await expect(registerUser(input)).rejects.toMatchObject({
    details: { kind: 'failure' },
  })
})

it('maps network failures without showing exception text', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new TypeError('private network detail')),
  )
  await expect(registerUser(input)).rejects.toMatchObject({
    message: 'Unable to create your account right now. Please try again.',
    details: { kind: 'failure' },
  })
})

it('preserves abort identity', async () => {
  const error = new DOMException('Aborted', 'AbortError')
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))
  await expect(registerUser(input)).rejects.toBe(error)
})

it('does not retry writes even when the provider enables mutation retries', async () => {
  const fetchMock = mockResponse(failure('Server.Failure'), 500)
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: 2, retryDelay: 0 } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const { result, unmount } = renderHook(() => useRegisterMutation(), {
    wrapper,
  })
  await act(async () => {
    await expect(result.current.mutateAsync(input)).rejects.toMatchObject({
      details: { kind: 'failure' },
    })
  })
  await waitFor(() => expect(result.current.isError).toBe(true))
  expect(fetchMock).toHaveBeenCalledTimes(1)
  unmount()
  client.clear()
})
