import { afterEach, expect, it, vi } from 'vitest'
import { api } from './client'
afterEach(() => vi.unstubAllGlobals())
for (const [status, detail, fields] of [
  [401, 'Invalid email or password', {}],
  [409, 'Email already registered', {}],
  [
    422,
    [{ loc: ['body', 'name'], msg: 'Name is required' }],
    { fullName: 'Name is required' },
  ],
])
  it(`parses API error ${status}`, async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status,
        json: async () => ({ detail }),
      })),
    )
    await expect(api.post('/auth/register', {})).rejects.toMatchObject({
      status,
      fields,
    })
  })
it('reports network failures', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
  )
  await expect(api.get('/auth/me')).rejects.toMatchObject({
    status: 0,
    message: expect.stringContaining('Unable to reach DryLeaf'),
  })
})
