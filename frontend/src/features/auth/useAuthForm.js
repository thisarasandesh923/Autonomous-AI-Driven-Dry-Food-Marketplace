import { useId, useRef, useState } from 'react'
import { ApiError } from '../../api/client'

// Shared form mechanics; each feature supplies validation and its API handoff.
export function useAuthForm({
  initialValues,
  validate,
  onSubmit,
  unavailableMessage,
  failureMessage,
}) {
  const id = useId()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)
  const formRef = useRef(null)

  function updateField(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
    setNotice('')
  }

  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setNotice('')
    const firstInvalidField = Object.keys(nextErrors).find(
      (field) => nextErrors[field],
    )
    if (firstInvalidField) {
      formRef.current?.elements.namedItem(firstInvalidField)?.focus()
      return
    }
    if (!onSubmit) {
      setNotice(unavailableMessage)
      return
    }
    submitting.current = true
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields)
        setNotice(error.message)
      } else setNotice(failureMessage)
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
    formRef,
    updateField,
    submit,
  }
}
