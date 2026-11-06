import { useAuthForm } from './useAuthForm'
import { validateRegistration } from './validation'

/**
 * @param {((details: {fullName: string, email: string, password: string, role: string}) => Promise<void>)} [onRegister]
 * The application adapter maps fullName to the API's name field.
 */
export function useRegisterForm(onRegister) {
  return useAuthForm({
    initialValues: { fullName: '', email: '', password: '', role: 'buyer' },
    validate: validateRegistration,
    onSubmit: onRegister
      ? ({ fullName, email, password, role }) =>
          onRegister({
            fullName: fullName.trim(),
            email: email.trim(),
            password,
            role,
          })
      : undefined,
    unavailableMessage:
      'Account registration is not available yet. Your details have not been sent.',
    failureMessage: 'We could not create your account. Please try again.',
  })
}
