import { useState } from 'react'
import { LoginForm } from '../features/auth/LoginForm'
import { AuthLayout } from '../layouts/AuthLayout'

export function LoginPage({ onLogin, registrationHref }) {
  const [registrationNotice, setRegistrationNotice] = useState(false)
  const registrationActionClassName =
    'rounded-none border-0 bg-transparent p-0 font-semibold text-primary underline underline-offset-3 hover:text-primary-hover'

  return (
    <AuthLayout titleId="login-title" skipLinkLabel="Skip to login">
      <p className="text-caption font-semibold leading-control text-primary uppercase">
        Your pantry account
      </p>
      <h1
        id="login-title"
        className="mt-(--auth-heading-gap) font-display text-title font-normal leading-heading"
      >
        Welcome back
      </h1>
      <p className="mt-(--auth-description-gap) text-lead leading-control text-text-secondary">
        Log in to shop and track your orders.
      </p>
      <div className="mt-(--auth-fields-gap)">
        <LoginForm onLogin={onLogin} />
      </div>
      <div className="mt-8 flex flex-wrap items-baseline gap-2 text-body leading-control text-text-secondary">
        <span>New to Ceylon Pantry?</span>
        {registrationHref ? (
          <a className={registrationActionClassName} href={registrationHref}>
            Create an account
          </a>
        ) : (
          <button
            className={registrationActionClassName}
            type="button"
            onClick={() => setRegistrationNotice(true)}
          >
            Create an account
          </button>
        )}
      </div>
      <p
        className="mt-3 text-small text-text-secondary"
        role="status"
        aria-live="polite"
      >
        {registrationNotice ? 'Account registration is not available yet.' : ''}
      </p>
    </AuthLayout>
  )
}
