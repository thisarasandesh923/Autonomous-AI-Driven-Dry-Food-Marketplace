import { useAuthForm } from './useAuthForm'
import { validateRegistration } from './validation'

/**
 * @param {((details: {fullName: string, email: string, password: string}) => Promise<void>)} [onRegister]
 * An approved API adapter must own account creation and any next-step navigation.
 * This callback is a UI integration boundary, not an assumed backend schema.
 */
export function useRegisterForm(onRegister) {
  return useAuthForm({
    initialValues: { fullName: '', email: '', password: '' },
    validate: validateRegistration,
    onSubmit: onRegister
      ? ({ fullName, email, password }) =>
          onRegister({
            fullName: fullName.trim(),
            email: email.trim(),
            password,
          })
      : undefined,
    unavailableMessage:
      'Account registration is not available yet. Your details have not been sent.',
    failureMessage: 'We could not create your account. Please try again.',
  })
}
