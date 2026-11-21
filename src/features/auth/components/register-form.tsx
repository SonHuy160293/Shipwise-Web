import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useRegisterMutation } from '../api/register'
import { RegistrationError } from '../api/registration-error'
import {
  registrationSchema,
  type RegistrationField,
  type RegistrationFieldErrors,
  type RegistrationInput,
} from '../schemas/registration'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const FIELD_ORDER: readonly RegistrationField[] = [
  'email',
  'displayName',
  'password',
]

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const confirmationHeadingRef = useRef<HTMLHeadingElement>(null)
  const mutation = useRegisterMutation()

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      displayName: '',
      password: '',
    },
  })

  useEffect(() => {
    if (registeredEmail !== null) {
      confirmationHeadingRef.current?.focus()
    }
  }, [registeredEmail])

  const isSubmitting = mutation.isPending

  async function onSubmit(values: RegistrationInput) {
    if (mutation.isPending) return
    setFormError(null)

    try {
      await mutation.mutateAsync(values)
      form.reset({ email: '', displayName: '', password: '' })
      setShowPassword(false)
      setRegisteredEmail(values.email)
    } catch (error) {
      if (!(error instanceof RegistrationError)) {
        setFormError(
          'Unable to create your account right now. Please try again.',
        )
        return
      }

      const { details } = error
      if (details.kind === 'validation' || details.kind === 'email-taken') {
        const fieldErrors: RegistrationFieldErrors = details.fieldErrors
        for (const field of FIELD_ORDER) {
          const message = fieldErrors[field]
          if (message) {
            form.setError(field, { type: 'server', message })
          }
        }
        const firstInvalid = FIELD_ORDER.find(
          (field) => fieldErrors[field] !== undefined,
        )
        if (firstInvalid) {
          form.setFocus(firstInvalid)
        }
        return
      }

      setFormError(details.message)
    }
  }

  if (registeredEmail !== null) {
    return (
      <section
        aria-labelledby="registration-success-heading"
        className="mx-auto w-full max-w-md rounded-lg border bg-card p-6 md:p-8"
      >
        <h1
          id="registration-success-heading"
          ref={confirmationHeadingRef}
          tabIndex={-1}
          className="text-3xl font-semibold tracking-tight outline-none"
        >
          Account created
        </h1>
        <p
          role="status"
          className="mt-3 text-sm leading-6 text-muted-foreground"
        >
          Your account for{' '}
          <span className="font-medium text-foreground">{registeredEmail}</span>{' '}
          is ready. You have not been signed in.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="registration-heading"
      className="mx-auto w-full max-w-md rounded-lg border bg-card p-6 md:p-8"
    >
      <header className="mb-6">
        <h1
          id="registration-heading"
          className="text-3xl font-semibold tracking-tight"
        >
          Create an account
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter your details to create a Shipwise account.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    readOnly={isSubmitting}
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="name"
                    readOnly={isSubmitting}
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormDescription>1–100 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      readOnly={isSubmitting}
                      className="h-11 pr-12"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute top-0 right-0 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    )}
                  </Button>
                </div>
                <FormDescription>12–128 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {formError !== null && (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-background px-3.5 py-2.5 text-sm text-destructive"
            >
              {formError}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
          <span role="status" className="sr-only">
            {isSubmitting ? 'Creating account…' : ''}
          </span>
        </form>
      </Form>
    </section>
  )
}
