import { navigate } from '../app/navigation'

export function Link({ href, state, children, onClick, ...props }) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey ||
          props.target
        )
          return
        event.preventDefault()
        navigate(href, { state: typeof state === 'function' ? state() : state })
      }}
    >
      {children}
    </a>
  )
}
