import { useState } from 'react'
import { Input } from './Input'

export function PasswordInput({ id, disabled, ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      {...props}
      id={id}
      type={visible ? 'text' : 'password'}
      disabled={disabled}
      trailingAction={
        <button
          className="min-h-11 min-w-15 rounded-control border-0 bg-transparent p-2 text-caption font-semibold text-primary enabled:hover:bg-background"
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-controls={id}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      }
    />
  )
}
