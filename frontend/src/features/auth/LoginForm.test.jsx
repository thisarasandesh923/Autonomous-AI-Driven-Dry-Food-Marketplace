import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

async function fillForm(email = 'buyer@example.com', password = 'my password') {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email address'), email)
  await user.type(screen.getByLabelText('Password'), password)
  return user
}

describe('LoginForm', () => {
  it('reports required fields, connects their descriptions and focuses the first error', async () => {
    render(<LoginForm />)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Log in' }))

    expect(screen.getByLabelText('Email address')).toHaveFocus()
    expect(screen.getByLabelText('Email address')).toHaveAccessibleDescription(
      'Enter your email address.',
    )
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'Enter your password.',
    )
    expect(screen.getByLabelText('Email address')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('rejects an invalid email without invoking authentication', async () => {
    const onLogin = vi.fn()
    render(<LoginForm onLogin={onLogin} />)
    const user = await fillForm('invalid-email')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(
      screen.getByText('Enter a valid email address, such as you@example.com.'),
    ).toBeVisible()
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('focuses password when only the password is missing', async () => {
    render(<LoginForm />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email address'), 'buyer@example.com')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(screen.getByLabelText('Password')).toHaveFocus()
  })

  it('toggles password visibility without submitting or losing its value', async () => {
    const onLogin = vi.fn()
    render(<LoginForm onLogin={onLogin} />)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Password')).toHaveValue('my password')
    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    )
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('honestly reports the unavailable integration without making a request or storing credentials', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem')
    render(<LoginForm />)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Sign-in is not available yet. Your details have not been sent.',
    )
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(storageSpy).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled()
    fetchSpy.mockRestore()
    storageSpy.mockRestore()
  })

  it('shows pending state, prevents repeat submission and preserves password whitespace', async () => {
    let complete
    const pending = new Promise((resolve) => {
      complete = resolve
    })
    const onLogin = vi.fn(() => pending)
    render(<LoginForm onLogin={onLogin} />)
    const user = await fillForm('buyer@example.com', '  secret  ')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    const button = screen.getByRole('button', { name: 'Signing in…' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByLabelText('Email address')).toBeDisabled()
    await user.click(button)
    expect(onLogin).toHaveBeenCalledTimes(1)
    expect(onLogin).toHaveBeenCalledWith({
      email: 'buyer@example.com',
      password: '  secret  ',
    })

    await act(async () => {
      complete()
      await pending
    })
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled()
  })

  it('handles a rejected authentication handler without exposing internal error details', async () => {
    const onLogin = vi
      .fn()
      .mockRejectedValue(new Error('private backend details'))
    render(<LoginForm onLogin={onLogin} />)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'We could not sign you in. Please try again.',
      ),
    )
    expect(
      screen.queryByText('private backend details'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled()
  })
})
