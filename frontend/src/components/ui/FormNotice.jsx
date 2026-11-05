export function FormNotice({ children }) {
  return (
    <p
      className={
        children
          ? 'rounded-control bg-notice-surface px-4 py-3 text-small text-text-primary wrap-anywhere'
          : 'sr-only'
      }
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {children}
    </p>
  )
}
