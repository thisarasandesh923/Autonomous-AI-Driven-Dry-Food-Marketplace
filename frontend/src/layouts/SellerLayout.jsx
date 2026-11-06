import { MarketplaceHeader } from './BuyerLayout'
import { Icon } from '../components/marketplace/Icon'
import { UnavailableButton } from '../components/marketplace/States'
import { useLocation } from '../app/navigation'
import { DemoBanner } from '../components/marketplace/DemoBanner'
export function SellerLayout({ profile, user, children, isDemo }) {
  const active = useLocation().split('#')[1] || 'overview'
  return (
    <div className="marketplace seller-workspace">
      <a className="market-skip" href="#seller-main">
        Skip to dashboard
      </a>
      <MarketplaceHeader seller />
      {isDemo && <DemoBanner />}
      <div className="market-container seller-shell">
        <aside className="seller-sidebar">
          <p className="market-eyebrow">
            <Icon name="shop" />
            Seller dashboard
          </p>
          <h2>{profile?.name || user.name}</h2>
          <p>
            {profile?.location || 'Business profile not available'} ·{' '}
            {profile
              ? profile.approved
                ? 'Approved seller'
                : 'Pending approval'
              : 'Profile pending'}
          </p>
          <p>{user.email}</p>
          <small>
            {isDemo
              ? 'Illustrative demonstration data'
              : 'Your own seller account'}
          </small>
          <nav aria-label="Seller dashboard sections">
            <a
              className={active === 'overview' ? 'active' : ''}
              aria-current={active === 'overview' ? 'location' : undefined}
              href="#overview"
            >
              <span aria-hidden="true">◉</span> <span>Overview</span>
            </a>
            <a
              className={active === 'orders' ? 'active' : ''}
              aria-current={active === 'orders' ? 'location' : undefined}
              href="#orders"
            >
              <span aria-hidden="true">◇</span> <span>Orders</span>
            </a>
            <a
              className={active === 'inventory' ? 'active' : ''}
              aria-current={active === 'inventory' ? 'location' : undefined}
              href="#inventory"
            >
              <span aria-hidden="true">▢</span> <span>Products</span>
            </a>
            <a
              className={active === 'forecasting' ? 'active' : ''}
              aria-current={active === 'forecasting' ? 'location' : undefined}
              href="#forecasting"
            >
              <span aria-hidden="true">✧</span> <span>Forecasting</span>
            </a>
            <UnavailableButton>Settings · coming later</UnavailableButton>
          </nav>
          <div className="market-notice">
            <strong>Read-only workspace</strong>
            <p>
              Overview of your products and available business data. Editing and
              order processing are not available in this phase.
            </p>
          </div>
          <div className="seller-support market-notice">
            <strong>Support</strong>
            <p>
              For questions about your listing or stock, contact your
              marketplace administrator.
            </p>
          </div>
        </aside>
        <main id="seller-main">{children}</main>
      </div>
    </div>
  )
}
