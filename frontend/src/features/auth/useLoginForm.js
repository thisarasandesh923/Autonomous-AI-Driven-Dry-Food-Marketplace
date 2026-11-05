import { useId, useRef, useState } from 'react'
import { validateLogin } from './validation'

/**
 * @param {((credentials: {email: string, password: string}) => Promise<void>)} [onLogin]
 * The future API adapter owns session establishment and post-login navigation.
 * Credentials are passed only to this explicitly provided handler.
 */
export function useLoginForm(onLogin) {
  const id = useId()
  const [values, setValues] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const submitting = useRef(false)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  function updateField(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
    setNotice('')
  }

  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return

    const nextErrors = validateLogin(values)
    setErrors(nextErrors)
    setNotice('')

    if (nextErrors.email || nextErrors.password) {
      if (nextErrors.email) emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }

    if (!onLogin) {
      setNotice(
        'Sign-in is not available yet. Your details have not been sent.',
      )
      return
    }

    submitting.current = true
    setIsSubmitting(true)
    try {
      await onLogin({ email: values.email.trim(), password: values.password })
    } catch {
      setNotice('We could not sign you in. Please try again.')
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return {
    id,
    values,
    errors,
    notice,
    isSubmitting,
    showPassword,
    emailRef,
    passwordRef,
    updateField,
    submit,
    togglePassword: () => setShowPassword((visible) => !visible),
  }
}
