/* eslint-disable no-restricted-imports -- Same-feature imports; external consumers use the auth public entry. */
import { ApiResponseError } from '@/lib/api/api-response-error'
import {
  registrationFieldMessages,
  type RegistrationFieldErrors,
} from '@/features/auth/schemas/registration'

export type RegistrationFailure =
  | {
      kind: 'validation'
      message: string
      fieldErrors: RegistrationFieldErrors
    }
  | { kind: 'email-taken'; message: string; fieldErrors: { email: string } }
  | {
      kind: 'rate-limited'
      message: string
      retryAfterSeconds: number | undefined
    }
  | { kind: 'unavailable'; message: string }
  | { kind: 'failure'; message: string }

export class RegistrationError extends Error {
  readonly details: RegistrationFailure

  constructor(details: RegistrationFailure) {
    super(details.message)
    this.name = 'RegistrationError'
    this.details = details
  }
}

export function mapRegistrationError(error: unknown): RegistrationFailure {
  if (error instanceof RegistrationError) return error.details
  if (error instanceof ApiResponseError) {
    if (error.status === 400 && error.code === 'Validation.Failure') {
      const fieldErrors: RegistrationFieldErrors = {}
      for (const field of ['email', 'displayName', 'password'] as const) {
        if (error.errors?.[field]?.length) {
          fieldErrors[field] = registrationFieldMessages[field]
        }
      }
      return {
        kind: 'validation',
        message: 'Check your details and try again.',
        fieldErrors,
      }
    }
    if (error.status === 409 && error.code === 'Registration.EmailTaken') {
      const message = 'An account with this email already exists.'
      return { kind: 'email-taken', message, fieldErrors: { email: message } }
    }
    if (error.status === 429 && error.code === 'Request.TooManyRequests') {
      const seconds = error.retryAfterSeconds
      return {
        kind: 'rate-limited',
        message: `Too many registration attempts. Please wait ${seconds === undefined ? 'a moment' : `${seconds} seconds`} and try again.`,
        retryAfterSeconds: seconds,
      }
    }
    if (error.status === 404 && error.code === 'Request.NotFound') {
      return {
        kind: 'unavailable',
        message:
          'Registration is currently unavailable. Contact your administrator if you need an account.',
      }
    }
  }
  return {
    kind: 'failure',
    message: 'Unable to create your account right now. Please try again.',
  }
}
