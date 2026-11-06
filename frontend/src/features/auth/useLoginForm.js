import { useAuthForm } from './useAuthForm'
import { validateLogin } from './validation'

/**
 * @param {((credentials: {email: string, password: string}) => Promise<void>)} [onLogin]
 * The application adapter owns session establishment and post-login navigation.
 * Credentials are passed only to this explicitly provided handler.
 */
export function useLoginForm(onLogin) {
  return useAuthForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    onSubmit: onLogin
      ? ({ email, password }) => onLogin({ email: email.trim(), password })
      : undefined,
    unavailableMessage:
      'Sign-in is not available yet. Your details have not been sent.',
    failureMessage: 'We could not sign you in. Please try again.',
  })
}
