import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppLayout } from '@/app/layouts/app-layout'
describe('application shell', () => {
  it('collapses and expands without losing accessible navigation', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(
      screen.getByRole('button', { name: 'Expand sidebar' }),
    ).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.getByRole('link', { name: 'Organizations' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    expect(
      screen.getByRole('button', { name: 'Collapse sidebar' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })
})
