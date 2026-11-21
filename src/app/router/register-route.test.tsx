import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { expect, it } from 'vitest'
import { router } from './router'

it('loads /register in the public shell outside the workspace', async () => {
  const client = new QueryClient()
  const memoryRouter = createMemoryRouter(router.routes, {
    initialEntries: ['/register'],
  })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={memoryRouter} />
    </QueryClientProvider>,
  )
  expect(
    await screen.findByRole('heading', { name: 'Create an account' }),
  ).toBeVisible()
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1')
  expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
    'href',
    '#main-content',
  )
  expect(screen.getByRole('link', { name: 'Shipwise home' })).toBeVisible()
  expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Open user menu' }),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Create account' })).toBeVisible()
  memoryRouter.dispose()
})
