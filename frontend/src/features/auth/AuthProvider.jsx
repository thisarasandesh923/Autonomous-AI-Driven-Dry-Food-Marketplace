import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'
import { AuthContext } from './AuthContext'
const storageKey = 'dryleaf.access_token'
function readToken() {
  try {
    return sessionStorage.getItem(storageKey)
  } catch {
    return null
  }
}
function saveToken(token) {
  try {
    if (token) sessionStorage.setItem(storageKey, token)
    else sessionStorage.removeItem(storageKey)
  } catch {
    /* Continue with in-memory authentication. */
  }
}
function validUser(user) {
  if (!user || !['buyer', 'seller'].includes(user.role))
    throw new Error('Unsupported account role')
  return user
}
export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState('')
  const activeToken = useRef(token)
  const logout = useCallback(() => {
    activeToken.current = null
    saveToken(null)
    setToken(null)
    setUser(null)
    setError('')
    setLoading(false)
  }, [])
  const restore = useCallback(
    async (sessionToken, signal) => {
      if (signal?.aborted) return
      try {
        const current = validUser(
          await api.get('/auth/me', { token: sessionToken, signal }),
        )
        if (activeToken.current === sessionToken) {
          setUser(current)
          setError('')
        }
      } catch (failure) {
        if (
          failure.name === 'AbortError' ||
          activeToken.current !== sessionToken
        )
          return
        if (failure.status === 401) logout()
        else setError(failure.message)
      } finally {
        if (!signal?.aborted && activeToken.current === sessionToken)
          setLoading(false)
      }
    },
    [logout],
  )
  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    Promise.resolve().then(() => restore(token, controller.signal))
    return () => controller.abort()
  }, [token, restore])
  async function login(credentials) {
    const result = await api.post('/auth/login', credentials)
    const current = validUser(result.user)
    if (!result.access_token || result.token_type !== 'bearer')
      throw new Error('Invalid login response')
    activeToken.current = result.access_token
    saveToken(result.access_token)
    setUser(current)
    setError('')
    setToken(result.access_token)
    return current
  }
  const get = useCallback(
    async (path, options) => {
      const sessionToken = activeToken.current
      try {
        return await api.get(path, { ...options, token: sessionToken })
      } catch (failure) {
        if (failure.status === 401 && activeToken.current === sessionToken)
          logout()
        throw failure
      }
    },
    [logout],
  )
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        login,
        logout,
        get,
        retry: () => {
          setLoading(true)
          restore(token)
        },
        register: (details) => api.post('/auth/register', details),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
