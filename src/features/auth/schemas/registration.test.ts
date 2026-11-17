import { expect, it } from 'vitest'
import { registrationSchema, type RegistrationInput } from './registration'

const valid: RegistrationInput = {
  email: 'ana@example.com',
  displayName: 'Ana',
  password: '  password  ',
}

it('trims email and name with backend whitespace rules and preserves the password', () => {
  expect(
    registrationSchema.parse({
      ...valid,
      email: '\u0085 Ana@Example.com \u0085',
      displayName: '\u0085 Ana \u0085',
    }),
  ).toEqual({ ...valid, email: 'Ana@Example.com' })
})

it.each([
  { email: 'a@.' },
  { email: `${'a'.repeat(251)}@a.` },
  { displayName: 'A' },
  { displayName: 'A'.repeat(100) },
  { password: ' '.repeat(12) },
  { password: 'p'.repeat(128) },
])('accepts the contract boundary %j', (input) => {
  expect(registrationSchema.safeParse({ ...valid, ...input }).success).toBe(
    true,
  )
})

it.each([
  { email: '' },
  { email: 'ana@example' },
  { email: '@example.com' },
  { email: 'ana@@example.com' },
  { email: 'ana @example.com' },
  { email: 'ana\u0085@example.com' },
  { email: `${'a'.repeat(252)}@a.` },
  { displayName: ' ' },
  { displayName: 'A'.repeat(101) },
  { displayName: 'A\u0000B' },
  { displayName: 'A\u009fB' },
  { password: 'p'.repeat(11) },
  { password: 'p'.repeat(129) },
])('rejects the contract violation %j', (input) => {
  expect(registrationSchema.safeParse({ ...valid, ...input }).success).toBe(
    false,
  )
})

it('collects all invalid fields', () => {
  const result = registrationSchema.safeParse({
    email: '',
    displayName: '',
    password: '',
  })
  expect(result.success).toBe(false)
  if (!result.success) {
    expect(new Set(result.error.issues.map((issue) => issue.path[0]))).toEqual(
      new Set(['email', 'displayName', 'password']),
    )
  }
})
