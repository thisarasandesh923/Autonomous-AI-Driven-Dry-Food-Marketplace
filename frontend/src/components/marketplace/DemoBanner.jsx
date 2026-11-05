import { Link } from '../Link'
export function DemoBanner() {
  return (
    <aside className="demo-banner" aria-label="Demonstration data notice">
      <div className="market-container">
        <strong>DEMO DATA</strong>
        <span>
          Frontend preview only. Products, sellers, orders, prices and forecasts
          are illustrative. Nothing is purchased or saved.
        </span>
        <Link href="/demo/seller/dashboard">Preview seller dashboard →</Link>
      </div>
    </aside>
  )
}
