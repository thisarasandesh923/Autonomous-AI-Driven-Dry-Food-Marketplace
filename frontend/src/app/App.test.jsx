import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

const account = (role) => ({
  id: 1,
  name: 'Kamal Perera',
  email: 'kamal@example.com',
  role,
})
let calls
let failDashboard
beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState(null, '', '/login')
  calls = []
  failDashboard = null
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options) => {
      const path = new URL(url).pathname
      calls.push({ path, ...options })
      const details = options.body ? JSON.parse(options.body) : {}
      const role = options.headers.Authorization?.includes('seller')
        ? 'seller'
        : 'buyer'
      let status = 200
      let data
      if (path === '/auth/register') data = { user: account(details.role) }
      else if (path === '/auth/login')
        data = {
          access_token: details.email.startsWith('seller')
            ? 'seller-token'
            : 'buyer-token',
          token_type: 'bearer',
          user: account(
            details.email.startsWith('seller') ? 'seller' : 'buyer',
          ),
        }
      else if (path === '/auth/me') data = account(role)
      else if (failDashboard) {
        status = failDashboard
        data = { detail: status === 403 ? 'Access denied.' : 'Invalid token' }
      } else
        data = { message: `Welcome to ${role} dashboard`, user: account(role) }
      return { ok: status < 400, status, json: async () => data }
    }),
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('application authentication integration (mock HTTP)', () => {
  for (const role of ['buyer', 'seller']) {
    it(`logs in and restores the ${role} session, guards roles, then logs out`, async () => {
      const view = render(<App />)
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: `${role}@example.com` },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'TestPassword123!' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
      await screen.findByText(`Welcome to ${role} dashboard`)
      expect(window.location.pathname).toBe(`/${role}/dashboard`)
      expect(
        calls.find((call) => call.path === `/${role}/dashboard`).headers
          .Authorization,
      ).toBe(`Bearer ${role}-token`)
      view.unmount()
      window.history.replaceState(
        null,
        '',
        `/${role === 'buyer' ? 'seller' : 'buyer'}/dashboard`,
      )
      render(<App />)
      await screen.findByText(`Welcome to ${role} dashboard`)
      await waitFor(() =>
        expect(window.location.pathname).toBe(`/${role}/dashboard`),
      )
      expect(
        calls.some(
          (call) =>
            call.path === '/auth/me' &&
            call.headers.Authorization === `Bearer ${role}-token`,
        ),
      ).toBe(true)
      fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
      await screen.findByRole('heading', { name: 'Welcome back' })
      expect(sessionStorage.getItem('dryleaf.access_token')).toBeNull()
    })
    it(`registers a ${role} and redirects to login`, async () => {
      window.history.replaceState(null, '', '/register')
      render(<App />)
      for (const [label, value] of [
        ['Full name', 'Kamal Perera'],
        ['Email address', 'kamal@example.com'],
        ['Password', 'TestPassword123!'],
        ['Account role', role],
      ]) {
        fireEvent.change(screen.getByLabelText(label), { target: { value } })
      }
      fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
      await screen.findByRole('heading', { name: 'Welcome back' })
      expect(JSON.parse(calls[0].body)).toEqual({
        name: 'Kamal Perera',
        email: 'kamal@example.com',
        password: 'TestPassword123!',
        role,
      })
      expect(window.location.pathname).toBe('/login')
    })
  }
  it('redirects unauthenticated dashboard visits', async () => {
    window.history.replaceState(null, '', '/seller/dashboard')
    render(<App />)
    await screen.findByRole('heading', { name: 'Welcome back' })
    expect(window.location.pathname).toBe('/login')
  })
  for (const status of [401, 403])
    it(`handles dashboard ${status} correctly`, async () => {
      sessionStorage.setItem('dryleaf.access_token', 'buyer-token')
      failDashboard = status
      render(<App />)
      if (status === 401) {
        await screen.findByRole('heading', { name: 'Welcome back' })
        expect(sessionStorage.getItem('dryleaf.access_token')).toBeNull()
      } else {
        await screen.findByText('Access denied.')
        expect(sessionStorage.getItem('dryleaf.access_token')).toBe(
          'buyer-token',
        )
      }
    })
})
