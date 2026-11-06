import { useEffect, useState } from 'react'

// Shared cancellable resource lifecycle; feature services own endpoint contracts.

export function useResource(key, fetcher) {
  const [result, setResult] = useState({ key: null, data: null, error: null })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, data, error: null })
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ key, data: null, error })
      })
    return () => controller.abort()
  }, [key, fetcher, attempt])
  return {
    data: result.data,
    error: result.key === key ? result.error : null,
    loading: result.key !== key,
    retry: () => setAttempt((value) => value + 1),
  }
}
