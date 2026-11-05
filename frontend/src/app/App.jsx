import { useEffect, useState } from 'react'
import { LoginPage } from '../pages/LoginPage'
import { lazy, Suspense } from 'react'
import { RegisterPage } from '../pages/RegisterPage'
import { DashboardPage } from '../pages/DashboardPage'
import { CataloguePage } from '../pages/buyer/CataloguePage'
import { ProductDetailsPage } from '../pages/buyer/ProductDetailsPage'
import { SellerDashboardPage } from '../pages/seller/SellerDashboardPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { AuthProvider } from '../features/auth/AuthProvider'
import { dashboardPath, useAuth } from '../features/auth/AuthContext'
import { FormNotice } from '../components/ui/FormNotice'
import { Button } from '../components/ui/Button'
import { useLocation, navigate } from './navigation'
import { demoEnabled } from '../config/dataMode'
const SellerPreviewPage = lazy(
  () => import('../pages/seller/SellerPreviewPage'),
)

function Routes() {
  const auth = useAuth()
  const location = useLocation()
  const path = location.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  const [registered, setRegistered] = useState(false)
  const publicProduct = path === '/products' || /^\/products\/[^/]+$/.test(path)
  const authPage = ['/', '/login', '/register'].includes(path)
  const protectedRole =
    path === '/seller/dashboard'
      ? 'seller'
      : path === '/buyer/dashboard'
        ? 'buyer'
        : null
  const destination = auth.user ? dashboardPath(auth.user.role) : '/login'
  const redirect =
    !auth.loading &&
    !auth.error &&
    ((authPage && auth.user) ||
      (protectedRole && (!auth.user || auth.user.role !== protectedRole)))
  useEffect(() => {
    if (redirect) navigate(destination, { replace: true })
  }, [redirect, destination])
  if (publicProduct)
    return path === '/products' ? (
      <CataloguePage />
    ) : (
      <ProductDetailsPage key={path} id={path.split('/')[2]} />
    )
  if (demoEnabled && path === '/demo/seller/dashboard')
    return (
      <Suspense fallback={<p role="status">Loading frontend demonstration…</p>}>
        <SellerPreviewPage />
      </Suspense>
    )
  if (auth.loading) return <p role="status">Checking your session…</p>
  if (auth.error)
    return (
      <>
        <FormNotice>{auth.error}</FormNotice>
        <Button onClick={auth.retry}>Try again</Button>
        <Button onClick={auth.logout}>Back to login</Button>
      </>
    )
  if (redirect) return <p role="status">Redirecting…</p>
  if (protectedRole === 'seller') return <SellerDashboardPage />
  if (protectedRole === 'buyer') return <DashboardPage />
  if (path === '/register')
    return (
      <RegisterPage
        onRegister={async ({ fullName, ...details }) => {
          await auth.register({ name: fullName, ...details })
          setRegistered(true)
          navigate('/login', { replace: true })
        }}
      />
    )
  if (path !== '/' && path !== '/login') return <NotFoundPage />
  return (
    <>
      {registered && <FormNotice>Account created. Please log in.</FormNotice>}
      <LoginPage
        registrationHref="/register"
        onLogin={async (credentials) => {
          const user = await auth.login(credentials)
          navigate(dashboardPath(user.role), { replace: true })
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
