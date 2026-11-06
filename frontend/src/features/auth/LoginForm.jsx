import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { FormNotice } from '../../components/ui/FormNotice'
import { useLoginForm } from './useLoginForm'

export function LoginForm({ onLogin }) {
  const {
    id,
    values,
    errors,
    notice,
    isSubmitting,
    formRef,
    updateField,
    submit,
  } = useLoginForm(onLogin)
  const emailId = `${id}-email`
  const passwordId = `${id}-password`

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-6"
      onSubmit={submit}
      noValidate
      aria-label="Log in"
    >
      <div className="flex flex-col gap-(--form-field-gap)">
        <FormField id={emailId} label="Email address" error={errors.email}>
          <Input
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
          <PasswordInput
            id={passwordId}
            name="password"
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
          />
        </FormField>
      </div>
      <Button type="submit" isLoading={isSubmitting} loadingLabel="Signing in…">
        Log in
      </Button>
      <FormNotice>{notice}</FormNotice>
    </form>
  )
}
