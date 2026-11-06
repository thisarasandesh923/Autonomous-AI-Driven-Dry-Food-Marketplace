// Production defaults to the real API. Vite development defaults to local demos.
// Tests explicitly select their mode; authentication never uses mock credentials.
export const dataMode =
  import.meta.env.VITE_DATA_MODE ||
  (import.meta.env.DEV && import.meta.env.MODE !== 'test' ? 'demo' : 'api')
export const demoEnabled = dataMode === 'demo'
