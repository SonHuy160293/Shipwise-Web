import { test, expect } from '@playwright/test'
test('routes, sidebar and account menu', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  await expect(page).toHaveURL(/organizations$/)
  for (const [path, title] of [
    ['organizations', 'Organizations'],
    ['projects', 'Projects'],
    ['sprint-planning', 'Sprint Planning'],
    ['settings', 'Settings'],
    ['profile', 'My Profile'],
  ]) {
    await page.goto('/' + path)
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible()
  }
  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(
    page.getByRole('button', { name: 'Expand sidebar' }),
  ).toHaveAttribute('aria-expanded', 'false')
  await page.getByRole('button', { name: 'Expand sidebar' }).click()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Projects', exact: true })
    .click()
  await expect(page).toHaveURL(/projects$/)
  await page.getByRole('button', { name: 'Open user menu' }).click()
  await expect(
    page.getByRole('menuitem', { name: 'Logout (not connected)' }),
  ).toBeDisabled()
  await page.keyboard.press('Escape')
  await page.goto('/missing')
  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible()
  expect(errors).toEqual([])
})
for (const width of [375, 768, 1440])
  test('responsive ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/organizations')
    await expect(
      page.getByRole('heading', { name: 'Organizations', exact: true }),
    ).toBeVisible()
    if (width < 768) {
      await page.getByRole('button', { name: 'Open navigation' }).click()
      await page
        .getByRole('dialog')
        .getByRole('link', { name: 'Projects', exact: true })
        .click()
      await expect(page).toHaveURL(/projects$/)
      await expect(page.getByRole('dialog')).not.toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Open navigation' }),
      ).toBeFocused()
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: 'test-results/shell-' + width + '.png',
      fullPage: true,
    })
  })
test('development form validates', async ({ page }) => {
  await page.goto('/dev/form-example')
  await page.getByRole('button', { name: 'Validate example' }).click()
  await expect(page.getByText('Enter at least 2 characters.')).toBeVisible()
  await page.getByRole('textbox', { name: 'Display name' }).fill('Developer')
  await page.getByRole('button', { name: 'Validate example' }).click()
  await expect(page.getByRole('status')).toContainText('Nothing was saved')
})
