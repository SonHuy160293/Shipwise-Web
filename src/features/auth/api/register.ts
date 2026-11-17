/* eslint-disable no-restricted-imports -- Same-feature imports; external consumers use the auth public entry. */
import { useMutation } from '@tanstack/react-query'
import { http } from '@/lib/api/http-client'
import type { paths } from '@/lib/api/generated/schema'
import {
  registrationSchema,
  registrationResponseSchema,
  registrationFieldMessages,
  type RegistrationFieldErrors,
  type RegistrationInput,
  type RegistrationResponse,
} from '@/features/auth/schemas/registration'
import {
  mapRegistrationError,
  RegistrationError,
} from '@/features/auth/api/registration-error'

const registrationPath = '/api/v1/auth/register' satisfies keyof paths

export async function registerUser(
  input: RegistrationInput,
  options: { signal?: AbortSignal } = {},
): Promise<RegistrationResponse> {
  const parsed = registrationSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: RegistrationFieldErrors = {}
    for (const field of ['email', 'displayName', 'password'] as const) {
      if (parsed.error.issues.some((issue) => issue.path[0] === field)) {
        fieldErrors[field] = registrationFieldMessages[field]
      }
    }
    throw new RegistrationError({
      kind: 'validation',
      message: 'Check your details and try again.',
      fieldErrors,
    })
  }
  try {
    // The shared client prefixes /api (or a deployment URL ending in /api).
    const body = await http.post(registrationPath.slice('/api'.length), {
      body: parsed.data,
      ...options,
    })
    const response = registrationResponseSchema.safeParse(body)
    if (!response.success)
      throw new RegistrationError(mapRegistrationError(undefined))
    return response.data.data
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error
    throw new RegistrationError(mapRegistrationError(error))
  }
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (input: RegistrationInput) => registerUser(input),
    retry: false,
    gcTime: 0,
  })
}
