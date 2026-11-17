/* eslint-disable no-restricted-imports -- The public entry re-exports this feature's own modules. */
export { registerUser, useRegisterMutation } from '@/features/auth/api/register'
export {
  mapRegistrationError,
  RegistrationError,
} from '@/features/auth/api/registration-error'
export type { RegistrationFailure } from '@/features/auth/api/registration-error'
export {
  registrationSchema,
  registrationFieldMessages,
} from '@/features/auth/schemas/registration'
export type {
  RegistrationInput,
  RegistrationResponse,
  RegistrationField,
  RegistrationFieldErrors,
} from '@/features/auth/schemas/registration'
export { default as RegisterPage } from '@/features/auth/pages/register-page'
