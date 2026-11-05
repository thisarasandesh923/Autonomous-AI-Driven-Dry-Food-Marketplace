export function Input({ trailingAction, className = '', ...props }) {
  return (
    <div className="relative">
      <input
        {...props}
        className={`block h-(--control-height) w-full rounded-control border border-border bg-surface px-4 py-0 text-body text-text-primary shadow-none placeholder:text-text-secondary placeholder:opacity-100 focus-visible:border-primary disabled:bg-disabled-surface aria-invalid:border-error ${trailingAction ? 'pr-18' : ''} ${className}`}
      />
      {trailingAction && (
        <span className="absolute inset-y-1 right-1 flex items-center">
          {trailingAction}
        </span>
      )}
    </div>
  )
}
