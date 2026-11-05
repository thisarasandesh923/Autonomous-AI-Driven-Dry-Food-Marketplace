import { RegisterForm } from '../features/auth/RegisterForm'
import { AuthLayout } from '../layouts/AuthLayout'

export function RegisterPage({ onRegister }) {
  return (
    <AuthLayout
      titleId="register-title"
      skipLinkLabel="Skip to registration"
      variant="register"
    >
      <title>Create an account · Ceylon Pantry</title>
      <p className="text-caption font-semibold leading-control text-primary uppercase">
        Your pantry account
      </p>
      <h1
        id="register-title"
        className="mt-(--auth-heading-gap) font-display text-title font-normal leading-heading"
      >
        Create an account
      </h1>
      <p className="mt-(--auth-description-gap) text-lead leading-control text-text-secondary">
        Keep your orders and delivery details in one place.
      </p>
      <div className="mt-(--register-fields-gap)">
        <RegisterForm onRegister={onRegister} />
      </div>
      <div className="mt-8 flex flex-wrap items-baseline gap-2 text-body leading-control text-text-secondary">
        <span>Already have an account?</span>
        <a
          className="rounded-none border-0 bg-transparent p-0 font-semibold text-primary underline underline-offset-3 hover:text-primary-hover"
          href="/login"
        >
          Log in
        </a>
      </div>
    </AuthLayout>
  )
}
