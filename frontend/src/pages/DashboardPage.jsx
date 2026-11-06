import { useEffect, useState } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { AuthLayout } from '../layouts/AuthLayout'
import { Button } from '../components/ui/Button'
import { FormNotice } from '../components/ui/FormNotice'
import { Link } from '../components/Link'
export function DashboardPage() {
  const { user, get, logout } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    get(`/${user.role}/dashboard`, { signal: controller.signal })
      .then((result) => {
        setData(result)
        setError('')
      })
      .catch((failure) => {
        if (failure.name !== 'AbortError') setError(failure.message)
      })
    return () => controller.abort()
  }, [get, user.role, attempt])
  return (
    <AuthLayout titleId="dashboard-title" accountLabel={`${user.role} account`}>
      <h1
        id="dashboard-title"
        className="font-display text-title leading-heading capitalize"
      >
        {user.role} dashboard
      </h1>
      <div className="mt-8 flex flex-col gap-6">
        <p>{user.name}</p>
        <p>{user.email}</p>
        {data && <p role="status">{data.message}</p>}
        {!data && !error && <p role="status">Loading dashboard…</p>}
        <FormNotice>{error}</FormNotice>
        {error && (
          <Button onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </Button>
        )}
        <Link className="font-semibold text-primary underline" href="/products">
          Browse the pantry →
        </Link>
        <Button onClick={logout}>Log out</Button>
      </div>
    </AuthLayout>
  )
}
