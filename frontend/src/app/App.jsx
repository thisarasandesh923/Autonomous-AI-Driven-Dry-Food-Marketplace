import { useEffect, useState } from 'react'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { DashboardPage } from '../pages/DashboardPage'
import { AuthProvider } from '../features/auth/AuthProvider'
import { dashboardPath, useAuth } from '../features/auth/AuthContext'
import { FormNotice } from '../components/ui/FormNotice'
import { Button } from '../components/ui/Button'
function Routes() {
  const auth = useAuth()
  const [path, setPath] = useState(
    window.location.pathname.replace(/\/+$/, '') || '/',
  )
  const [registered, setRegistered] = useState(false)
  function navigate(destination) {
    window.history.replaceState(null, '', destination)
    setPath(destination)
  }
  useEffect(() => {
    const update = () =>
      setPath(window.location.pathname.replace(/\/+$/, '') || '/')
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  const destination = auth.user ? dashboardPath(auth.user.role) : '/login'
  const protectedPath = !['/', '/login', '/register'].includes(path)
  useEffect(() => {
    if (auth.loading || auth.error) return
    if ((auth.user && path !== destination) || (!auth.user && protectedPath)) {
      window.history.replaceState(null, '', destination)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [auth.loading, auth.error, auth.user, path, destination, protectedPath])
  if (auth.loading) return <p role="status">Checking your session…</p>
  if (auth.error)
    return (
      <>
        <FormNotice>{auth.error}</FormNotice>
        <Button onClick={auth.retry}>Try again</Button>
        <Button onClick={auth.logout}>Back to login</Button>
      </>
    )
  if (auth.user) return <DashboardPage key={auth.user.id} />
  if (protectedPath) return <p role="status">Redirecting to login…</p>
  if (path === '/register')
    return (
      <RegisterPage
        onRegister={async ({ fullName, ...details }) => {
          await auth.register({ name: fullName, ...details })
          setRegistered(true)
          navigate('/login')
        }}
      />
    )
  return (
    <>
      {registered && <FormNotice>Account created. Please log in.</FormNotice>}
      <LoginPage
        registrationHref="/register"
        onLogin={async (credentials) => {
          const user = await auth.login(credentials)
          navigate(dashboardPath(user.role))
        }}
      />
    </>
  )
}
export function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
}
