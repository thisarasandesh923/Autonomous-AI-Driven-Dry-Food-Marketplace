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

/**
 * @param {{fullName: string, email: string, password: string}} details
 * @returns {{fullName?: string, email?: string, password?: string}}
 */
export function validateRegistration({ fullName, email, password }) {
  const errors = {}
  if (!fullName.trim()) errors.fullName = 'Enter your full name.'
  // The design establishes required credentials only. Apply the backend's
  // password policy here once its contract is agreed; do not invent one.
  return { ...errors, ...validateLogin({ email, password }) }
}
