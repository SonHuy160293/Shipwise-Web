import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RegisterForm } from './register-form'

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <RegisterForm />
    </QueryClientProvider>,
  )
}

function mockFetchResponse(
  body: unknown,
  status: number,
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

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email'), '  ana@example.com  ')
  await user.type(screen.getByLabelText('Display name'), 'Ana')
  await user.type(screen.getByLabelText('Password'), 'correct horse battery')
}

describe('RegisterForm', () => {
  it('renders labeled fields, helper text, and password visibility toggle', async () => {
    const user = userEvent.setup()
    renderForm()

    expect(
      screen.getByRole('heading', { name: 'Create an account' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Display name')).toBeInTheDocument()
    expect(screen.getByText('1–100 characters')).toBeInTheDocument()
    expect(screen.getByText('12–128 characters')).toBeInTheDocument()

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await user.click(toggle)
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(
      screen.getByRole('button', { name: 'Hide password' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows client validation errors and focuses the first invalid field', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(
      await screen.findByText(
        'Enter a valid email address of 3–254 characters.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter a display name of 1–100 characters without control characters.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Use 12–128 characters.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('disables submit, sets inputs readOnly, and prevents duplicate submission while in flight', async () => {
    const user = userEvent.setup()
    let resolveRequest!: (value: Response) => void
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveRequest = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderForm()
    await fillValidForm(user)

    const submit = screen.getByRole('button', { name: 'Create account' })
    await user.click(submit)

    expect(
      screen.getByRole('button', { name: 'Creating account…' }),
    ).toBeDisabled()
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly')
    expect(screen.getByLabelText('Display name')).toHaveAttribute('readonly')
    expect(screen.getByLabelText('Password')).toHaveAttribute('readonly')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Creating account…' }))
    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveRequest(
      new Response(
        JSON.stringify({
          success: true,
          data: { userId: '019cfc22-7a83-7000-8000-000000000001' },
          error: null,
        }),
        { status: 201, headers: { 'content-type': 'application/json' } },
      ),
    )

    expect(
      await screen.findByRole('heading', { name: 'Account created' }),
    ).toBeInTheDocument()
  })

  it('maps 400 server field errors without showing raw server text', async () => {
    const user = userEvent.setup()
    mockFetchResponse(
      {
        success: false,
        data: null,
        error: {
          code: 'Validation.Failure',
          message: 'raw server validation text',
          errors: { displayName: ['raw server field error'] },
        },
      },
      400,
    )

    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(
      await screen.findByText(
        'Enter a display name of 1–100 characters without control characters.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText(/raw server/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Display name')).toHaveFocus()
  })

  it('shows email taken error on 409, focuses email, and preserves other fields', async () => {
    const user = userEvent.setup()
    mockFetchResponse(
      {
        success: false,
        data: null,
        error: { code: 'Registration.EmailTaken', message: 'duplicate' },
      },
      409,
    )

    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(
      await screen.findByText('An account with this email already exists.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    expect(screen.getByLabelText('Display name')).toHaveValue('Ana')
    expect(screen.getByLabelText('Password')).toHaveValue(
      'correct horse battery',
    )
  })

  it('shows rate limit alert with Retry-After seconds on 429', async () => {
    const user = userEvent.setup()
    mockFetchResponse(
      {
        success: false,
        data: null,
        error: { code: 'Request.TooManyRequests', message: 'slow down' },
      },
      429,
      { 'Retry-After': '45' },
    )

    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many registration attempts. Please wait 45 seconds and try again.',
    )
    expect(screen.getByLabelText('Display name')).toHaveValue('Ana')
  })

  it('shows unavailable alert on 404 Request.NotFound', async () => {
    const user = userEvent.setup()
    mockFetchResponse(
      {
        success: false,
        data: null,
        error: { code: 'Request.NotFound', message: 'disabled' },
      },
      404,
    )

    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Registration is currently unavailable. Contact your administrator if you need an account.',
    )
  })

  it('shows retryable failure alert on 500 and re-enables submit', async () => {
    const user = userEvent.setup()
    mockFetchResponse({ message: 'internal error' }, 500)

    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to create your account right now. Please try again.',
    )
    expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled()
    expect(screen.getByLabelText('Email')).toHaveValue('ana@example.com')
  })

  it('shows confirmation naming the trimmed email on 201 and moves focus to heading', async () => {
    const user = userEvent.setup()
    mockFetchResponse(
      {
        success: true,
        data: { userId: '019cfc22-7a83-7000-8000-000000000001' },
        error: null,
      },
      201,
    )

    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    const heading = await screen.findByRole('heading', {
      name: 'Account created',
    })
    await waitFor(() => {
      expect(heading).toHaveFocus()
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'Your account for ana@example.com is ready. You have not been signed in.',
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
