import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RegisterForm } from './RegisterForm'

afterEach(() => vi.restoreAllMocks())

async function fillForm({
  fullName = 'Nimali Perera',
  email = 'buyer@example.com',
  password = 'a sample password',
} = {}) {
  const user = userEvent.setup()
  if (fullName) await user.type(screen.getByLabelText('Full name'), fullName)
  if (email) await user.type(screen.getByLabelText('Email address'), email)
  if (password) await user.type(screen.getByLabelText('Password'), password)
  return user
}

describe('RegisterForm', () => {
  it('validates all required fields accessibly and focuses full name first', async () => {
    const onRegister = vi.fn()
    render(<RegisterForm onRegister={onRegister} />)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByLabelText('Full name')).toHaveFocus()
    for (const [label, message] of [
      ['Full name', 'Enter your full name.'],
      ['Email address', 'Enter your email address.'],
      ['Password', 'Enter your password.'],
    ]) {
      expect(screen.getByLabelText(label)).toHaveAttribute(
        'aria-invalid',
        'true',
      )
      expect(screen.getByLabelText(label)).toHaveAccessibleDescription(message)
    }
    expect(onRegister).not.toHaveBeenCalled()
  })

  it('rejects a blank name and malformed email, clearing each error when edited', async () => {
    const onRegister = vi.fn()
    render(<RegisterForm onRegister={onRegister} />)
    const user = await fillForm({ fullName: '   ', email: 'bad-email' })
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByLabelText('Full name')).toHaveFocus()
    await user.type(screen.getByLabelText('Full name'), 'Nimali')
    expect(screen.queryByText('Enter your full name.')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByLabelText('Email address')).toHaveFocus()
    expect(screen.getByLabelText('Email address')).toHaveAccessibleDescription(
      'Enter a valid email address, such as you@example.com.',
    )
    expect(onRegister).not.toHaveBeenCalled()
  })

  it('focuses password when the other fields are valid', async () => {
    render(<RegisterForm />)
    const user = await fillForm({ password: '' })
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByLabelText('Password')).toHaveFocus()
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
  })

  it('toggles password visibility without submitting or changing its value', async () => {
    const onRegister = vi.fn()
    render(<RegisterForm onRegister={onRegister} />)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Password')).toHaveValue('a sample password')
    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    )
    expect(onRegister).not.toHaveBeenCalled()
  })

  it('reports unavailable registration without requests, persistence or success', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem')
    render(<RegisterForm />)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Account registration is not available yet. Your details have not been sent.',
    )
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(storageSpy).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled()
  })

  it('awaits the adapter, blocks duplicate submissions and preserves password whitespace', async () => {
    let complete
    const pending = new Promise((resolve) => {
      complete = resolve
    })
    const onRegister = vi.fn(() => pending)
    render(<RegisterForm onRegister={onRegister} />)
    const user = await fillForm({
      fullName: '  කමල්  ',
      email: '  buyer@example.com  ',
      password: '  secret  ',
    })
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    const button = screen.getByRole('button', { name: 'Creating account…' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    for (const label of ['Full name', 'Email address', 'Password']) {
      expect(screen.getByLabelText(label)).toBeDisabled()
    }
    expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled()
    fireEvent.submit(screen.getByRole('form', { name: 'Create an account' }))
    expect(onRegister).toHaveBeenCalledTimes(1)
    expect(onRegister).toHaveBeenCalledWith({
      fullName: 'කමල්',
      email: 'buyer@example.com',
      password: '  secret  ',
      role: 'buyer',
    })
    await act(async () => {
      complete()
      await pending
    })
    expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('handles adapter failures without leaking server details and allows retry', async () => {
    const onRegister = vi
      .fn()
      .mockRejectedValue(new Error('private server detail'))
    render(<RegisterForm onRegister={onRegister} />)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'We could not create your account. Please try again.',
    )
    expect(screen.queryByText('private server detail')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(onRegister).toHaveBeenCalledTimes(2)
  })
})
