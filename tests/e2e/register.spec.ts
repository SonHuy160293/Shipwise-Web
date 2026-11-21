import { expect, test } from '@playwright/test'

const registerEndpoint = '**/api/v1/auth/register'

test('registration page renders outside AppLayout and validates client input', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto('/register')

  await expect(
    page.getByRole('heading', { name: 'Create an account', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Open user menu' }),
  ).toHaveCount(0)

  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(
    page.getByText('Enter a valid email address of 3–254 characters.'),
  ).toBeVisible()
  await expect(
    page.getByText(
      'Enter a display name of 1–100 characters without control characters.',
    ),
  ).toBeVisible()
  await expect(page.getByText('Use 12–128 characters.')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeFocused()
  expect(errors).toEqual([])
})

test('taken email shows error on email field and focuses it', async ({
  page,
}) => {
  await page.route(registerEndpoint, async (route) => {
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        data: null,
        error: {
          code: 'Registration.EmailTaken',
          message: 'Email already registered.',
        },
      }),
    })
  })

  await page.goto('/register')
  await page.getByLabel('Email').fill('ana@example.com')
  await page.getByLabel('Display name').fill('Ana')
  await page
    .getByLabel('Password', { exact: true })
    .fill('correct horse battery')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(
    page.getByText('An account with this email already exists.'),
  ).toBeVisible()
  await expect(page.getByLabel('Email')).toBeFocused()
  await expect(page.getByLabel('Display name')).toHaveValue('Ana')
})

test('keyboard-only registration succeeds and focuses confirmation heading', async ({
  page,
}) => {
  await page.route(registerEndpoint, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { userId: '019cfc22-7a83-7000-8000-000000000001' },
        error: null,
      }),
    })
  })

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/register')
  await expect(page.getByLabel('Email')).toBeVisible()

  // Tab through: Skip link -> Shipwise wordmark -> Email -> Display name -> Password -> Show toggle -> Submit
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Shipwise home' })).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Email')).toBeFocused()
  await page.keyboard.type('ana@example.com')

  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Display name')).toBeFocused()
  await page.keyboard.type('Ana')

  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Password', { exact: true })).toBeFocused()
  await page.keyboard.type('correct horse battery')

  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('button', { name: 'Show password' }),
  ).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'text',
  )

  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('button', { name: 'Create account' }),
  ).toBeFocused()
  await page.keyboard.press('Enter')

  const heading = page.getByRole('heading', { name: 'Account created' })
  await expect(heading).toBeVisible()
  await expect(heading).toBeFocused()
  await expect(page.getByRole('status')).toContainText(
    'Your account for ana@example.com is ready. You have not been signed in.',
  )
  await page.screenshot({
    path: 'test-results/register-success-1440.png',
    fullPage: true,
  })
})

for (const width of [375, 768, 1440]) {
  test(`registration layout has no overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/register')

    await expect(
      page.getByRole('heading', { name: 'Create an account', exact: true }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)

    await page.screenshot({
      path: `test-results/register-${width}.png`,
      fullPage: true,
    })
  })
}
