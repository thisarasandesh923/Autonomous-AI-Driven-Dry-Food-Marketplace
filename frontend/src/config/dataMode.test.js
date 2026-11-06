import { afterEach, expect, it, vi } from 'vitest'
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

it('defaults to the real API in production', async () => {
  vi.resetModules()
  vi.stubEnv('VITE_DATA_MODE', undefined)
  vi.stubEnv('DEV', false)
  vi.stubEnv('MODE', 'production')
  expect((await import('./dataMode')).demoEnabled).toBe(false)
})
it('allows an explicit demo preview and explicit API integration', async () => {
  vi.resetModules()
  vi.stubEnv('VITE_DATA_MODE', 'demo')
  expect((await import('./dataMode')).demoEnabled).toBe(true)
  vi.resetModules()
  vi.stubEnv('VITE_DATA_MODE', 'api')
  expect((await import('./dataMode')).demoEnabled).toBe(false)
})
it('API mode uses the existing transport and does not silently fall back to mock products', async () => {
  vi.resetModules()
  vi.stubEnv('VITE_DATA_MODE', 'api')
  const fetch = vi.fn().mockRejectedValue(new TypeError('Offline'))
  vi.stubGlobal('fetch', fetch)
  const { catalogueApi } = await import('../features/catalogue/api')
  await expect(catalogueApi.list('q=cinnamon')).rejects.toMatchObject({
    status: 0,
  })
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/products?q=cinnamon'),
    expect.objectContaining({ method: 'GET' }),
  )
})
