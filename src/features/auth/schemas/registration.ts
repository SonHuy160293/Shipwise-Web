import { z } from 'zod'
import type { paths } from '@/lib/api/generated/schema'

type RegisterOperation = paths['/api/v1/auth/register']['post']
export type RegistrationInput = NonNullable<
  RegisterOperation['requestBody']
>['content']['application/json']
export type RegistrationResponse =
  RegisterOperation['responses'][201]['content']['application/json']['data']
export type RegistrationField = keyof RegistrationInput
export type RegistrationFieldErrors = Partial<Record<RegistrationField, string>>

export const registrationFieldMessages = {
  email: 'Enter a valid email address of 3–254 characters.',
  displayName:
    'Enter a display name of 1–100 characters without control characters.',
  password: 'Use 12–128 characters.',
} satisfies Record<RegistrationField, string>

// .NET Trim/IsWhiteSpace use Unicode White_Space, unlike JavaScript trim/\s.
const trimmedText = z
  .string()
  .transform((value) =>
    value.replace(/^\p{White_Space}+|\p{White_Space}+$/gu, ''),
  )

export const registrationSchema = z.object({
  email: trimmedText.pipe(
    z
      .string()
      .min(3, registrationFieldMessages.email)
      .max(254, registrationFieldMessages.email)
      .regex(
        /^[^@\p{White_Space}]+@[^@\p{White_Space}]*\.[^@\p{White_Space}]*$/u,
        registrationFieldMessages.email,
      ),
  ),
  displayName: trimmedText.pipe(
    z
      .string()
      .min(1, registrationFieldMessages.displayName)
      .max(100, registrationFieldMessages.displayName)
      .refine(
        (value) => !/\p{Cc}/u.test(value),
        registrationFieldMessages.displayName,
      ),
  ),
  password: z
    .string()
    .min(12, registrationFieldMessages.password)
    .max(128, registrationFieldMessages.password),
}) satisfies z.ZodType<RegistrationInput>

export const registrationResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ userId: z.uuid() }),
  error: z.null().optional(),
}) satisfies z.ZodType<
  RegisterOperation['responses'][201]['content']['application/json']
>
