const baseUrl = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '')
export class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}
async function request(method, path, { body, token, signal } = {}) {
  let response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(
      0,
      'Unable to reach DryLeaf. Check your connection and try again.',
    )
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const fields = {}
    if (Array.isArray(data?.detail))
      for (const item of data.detail) {
        const field = item.loc?.at(-1)
        fields[field === 'name' ? 'fullName' : field] = item.msg
      }
    throw new ApiError(
      response.status,
      typeof data?.detail === 'string'
        ? data.detail
        : response.status === 422
          ? 'Please check the highlighted fields.'
          : response.status === 403
            ? 'Access denied.'
            : 'The request could not be completed. Please try again.',
      fields,
    )
  }
  return data
}
export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
}
