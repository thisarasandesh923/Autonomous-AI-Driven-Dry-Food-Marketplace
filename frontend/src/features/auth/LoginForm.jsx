import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { useLoginForm } from './useLoginForm'

export function LoginForm({ onLogin }) {
  const {
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
    togglePassword,
  } = useLoginForm(onLogin)
  const emailId = `${id}-email`
  const passwordId = `${id}-password`

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={submit}
      noValidate
      aria-label="Log in"
    >
      <div className="flex flex-col gap-(--form-field-gap)">
        <FormField id={emailId} label="Email address" error={errors.email}>
          <Input
            ref={emailRef}
            id={emailId}
            name="email"
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            placeholder="you@example.com"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
          />
        </FormField>
        <FormField id={passwordId} label="Password" error={errors.password}>
          <Input
            ref={passwordRef}
            id={passwordId}
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            value={values.password}
            onChange={(event) => updateField('password', event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? `${passwordId}-error` : undefined
            }
            trailingAction={
              <button
                className="min-h-11 min-w-15 rounded-control border-0 bg-transparent p-2 text-caption font-semibold text-primary enabled:hover:bg-background"
                type="button"
                onClick={togglePassword}
                disabled={isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-controls={passwordId}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            }
          />
        </FormField>
      </div>
      <Button type="submit" isLoading={isSubmitting} loadingLabel="Signing in…">
        Log in
      </Button>
      <p
        className={
          notice
            ? 'rounded-control bg-notice-surface px-4 py-3 text-small text-text-primary wrap-anywhere'
            : 'sr-only'
        }
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice}
      </p>
    </form>
  )
}
