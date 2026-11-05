export function FormField({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-(--field-label-gap)">
      <label className="text-label font-semibold leading-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-small leading-body text-error">
          {error}
        </p>
      )}
    </div>
  )
}
