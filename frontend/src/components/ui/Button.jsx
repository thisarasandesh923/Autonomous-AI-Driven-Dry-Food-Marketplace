export function Button({
  children,
  className = '',
  disabled,
  isLoading = false,
  loadingLabel = 'Please wait…',
  type = 'button',
  ...props
}) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-(--button-height) items-center justify-center rounded-control border border-transparent bg-primary px-6 py-3 text-lead font-semibold leading-control text-on-primary transition-colors duration-(--motion-fast) enabled:hover:bg-primary-hover disabled:bg-disabled-surface disabled:text-text-secondary ${className}`}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? loadingLabel : children}
    </button>
  )
}
