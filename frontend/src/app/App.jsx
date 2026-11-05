import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'

// Native links load each route through Vite's existing SPA fallback. Keep this
// small route selection dependency-free until broader marketplace routing exists.
export function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/register') {
    return <RegisterPage />
  }
  return <LoginPage registrationHref="/register" />
}
