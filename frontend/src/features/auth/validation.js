/**
 * @param {{email: string, password: string}} credentials
 * @returns {{email?: string, password?: string}}
 */
export function validateLogin({ email, password }) {
  const errors = {}

  if (!email.trim()) {
    errors.email = 'Enter your email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Enter a valid email address, such as you@example.com.'
  }

  // Login must accept existing passwords without imposing registration rules.
  // Passwords are deliberately never trimmed or stored outside component state.
  if (!password) errors.password = 'Enter your password.'

  return errors
}
