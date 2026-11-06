import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { FormNotice } from '../../components/ui/FormNotice'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { useRegisterForm } from './useRegisterForm'

export function RegisterForm({ onRegister }) {
  const {
    id,
    values,
    errors,
    notice,
    isSubmitting,
    formRef,
    updateField,
    submit,
  } = useRegisterForm(onRegister)
  const nameId = `${id}-full-name`
  const emailId = `${id}-email`
  const passwordId = `${id}-password`

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-6"
      onSubmit={submit}
      noValidate
      aria-label="Create an account"
    >
      <div className="flex flex-col gap-(--form-field-gap)">
        <FormField id={nameId} label="Full name" error={errors.fullName}>
          <Input
            id={nameId}
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Your full name"
            value={values.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? `${nameId}-error` : undefined}
          />
        </FormField>
        <FormField id={emailId} label="Email address" error={errors.email}>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
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
            autoComplete="new-password"
            required
            placeholder="Create a password"
            value={values.password}
            onChange={(event) => updateField('password', event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? `${passwordId}-error` : undefined
            }
          />
        </FormField>
        <FormField id={`${id}-role`} label="Account role" error={errors.role}>
          <select
            id={`${id}-role`}
            name="role"
            value={values.role}
            onChange={(event) => updateField('role', event.target.value)}
            disabled={isSubmitting}
            required
            aria-invalid={Boolean(errors.role)}
            aria-describedby={errors.role ? `${id}-role-error` : undefined}
            className="h-(--control-height) w-full rounded-control border border-border bg-surface px-4 text-body text-text-primary"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </FormField>
      </div>
      <Button
        type="submit"
        isLoading={isSubmitting}
        loadingLabel="Creating account…"
      >
        Create account
      </Button>
      <FormNotice>{notice}</FormNotice>
    </form>
  )
}
