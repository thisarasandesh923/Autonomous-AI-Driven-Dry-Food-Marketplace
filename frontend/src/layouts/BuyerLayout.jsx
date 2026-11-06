import { Link } from '../components/Link'
import { Icon } from '../components/marketplace/Icon'
import { UnavailableButton } from '../components/marketplace/States'
import { useAuth } from '../features/auth/AuthContext'
import { demoEnabled } from '../config/dataMode'
import { DemoBanner } from '../components/marketplace/DemoBanner'

export function MarketplaceHeader({ seller = false }) {
  const auth = useAuth()
  return (
    <header className="market-header">
      <div className="market-container market-header-inner">
        <Link href="/products" className="market-brand">
          <Icon name="leaf" size={28} />
          Ceylon Pantry
        </Link>
        {!seller && (
          <nav aria-label="Buyer navigation">
            <Link href="/products">Explore</Link>
            <Link href="/products" aria-current="page">
              Shop pantry
            </Link>
            <UnavailableButton>Our makers</UnavailableButton>
          </nav>
        )}
        <div className="market-header-actions">
          <span className="market-destination">
            <Icon name="pin" /> United Kingdom
          </span>
          <Link href="/products" aria-label="Search products">
            <Icon name="search" />
          </Link>
          <Link
            href={auth.user ? `/${auth.user.role}/dashboard` : '/login'}
            aria-label="Your account"
          >
            <Icon name="user" />
          </Link>
          <UnavailableButton
            className="market-icon"
            label="Shopping bag — not available in this phase"
          >
            <Icon name="bag" />
          </UnavailableButton>
          {auth.user && (
            <button className="market-text" onClick={auth.logout}>
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
export function BuyerLayout({ children }) {
  return (
    <div className="marketplace">
      <a className="market-skip" href="#market-main">
        Skip to content
      </a>
      <div className="market-topbar">
        <div className="market-container">
          <span>A little island. A generous pantry.</span>
          <span>USD · United Kingdom destination</span>
        </div>
      </div>
      <MarketplaceHeader />
      {demoEnabled && <DemoBanner />}
      <main id="market-main" className="market-container market-main">
        {children}
      </main>
      <footer className="market-footer">
        <div className="market-container">
          <Link className="market-brand" href="/products">
            Ceylon Pantry
          </Link>
          <span>
            Help & shipping · Our makers · Privacy & terms{' '}
            <small>Coming in a future phase</small>
          </span>
          <span>United Kingdom · USD</span>
        </div>
      </footer>
    </div>
  )
}
