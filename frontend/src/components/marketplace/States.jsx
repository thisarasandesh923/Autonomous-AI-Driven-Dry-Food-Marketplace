export function Notice({ children, error = false }) {
  return (
    <div
      className={`market-notice ${error ? 'market-error' : ''}`}
      role={error ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}
export function UnavailableButton({ children, className = '', label }) {
  return (
    <button
      type="button"
      disabled
      className={className}
      title={label || 'Available in a future phase'}
      aria-label={label}
    >
      {children}
    </button>
  )
}
export function RequestState({ loading, error, retry, children }) {
  if (loading) return <Notice>Loading pantry data…</Notice>
  if (error)
    return (
      <Notice error>
        {error.message}{' '}
        <button className="market-outline" onClick={retry}>
          Try again
        </button>
      </Notice>
    )
  return children
}
