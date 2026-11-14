import { it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormExample from './form-example'
it('validates and submits locally', async () => {
  const user = userEvent.setup()
  render(<FormExample />)
  await user.click(screen.getByRole('button', { name: 'Validate example' }))
  expect(
    await screen.findByText('Enter at least 2 characters.'),
  ).toBeInTheDocument()
  await user.type(
    screen.getByRole('textbox', { name: 'Display name' }),
    'Developer',
  )
  await user.click(screen.getByRole('button', { name: 'Validate example' }))
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Nothing was saved',
  )
})
