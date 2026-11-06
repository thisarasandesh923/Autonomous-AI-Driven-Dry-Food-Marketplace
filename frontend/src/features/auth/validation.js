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
export function validateRegistration({
  fullName,
  email,
  password,
  role = 'buyer',
}) {
  const errors = {}
  if (!fullName.trim()) errors.fullName = 'Enter your full name.'
  if (fullName.trim().length > 100)
    errors.fullName = 'Use at most 100 characters.'
  Object.assign(errors, validateLogin({ email, password }))
  if (password && (password.length < 8 || password.length > 128))
    errors.password = 'Use between 8 and 128 characters.'
  if (!['buyer', 'seller'].includes(role))
    errors.role = 'Choose buyer or seller.'
  return errors
}
