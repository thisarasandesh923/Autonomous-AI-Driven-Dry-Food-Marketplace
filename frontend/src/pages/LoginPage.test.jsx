import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LoginPage } from './LoginPage'

describe('registration handoff', () => {
  it('explains unavailable registration rather than sending the buyer to a missing page', async () => {
    render(<LoginPage />)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Create an account' }))
    expect(
      screen.getByText('Account registration is not available yet.'),
    ).toBeVisible()
  })

  it('renders a real link when an approved registration destination is supplied', () => {
    render(<LoginPage registrationHref="/register" />)
    expect(
      screen.getByRole('link', { name: 'Create an account' }),
    ).toHaveAttribute('href', '/register')
  })
})
