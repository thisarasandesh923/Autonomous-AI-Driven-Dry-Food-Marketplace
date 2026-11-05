import { useState } from 'react'
export function ProductInformation({ product }) {
  const [tab, setTab] = useState('Product facts')
  const tabs = ['Product facts', 'Shipping & returns', 'Seller']
  return (
    <section className="product-information" aria-label="Product information">
      <div
        className="product-tabs"
        role="tablist"
        aria-label="Product information sections"
      >
        {tabs.map((name, index) => (
          <button
            key={name}
            id={`product-tab-${index}`}
            role="tab"
            aria-selected={tab === name}
            aria-controls="product-tab-panel"
            onClick={() => setTab(name)}
            onKeyDown={(event) => {
              if (
                !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)
              )
                return
              event.preventDefault()
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? 2
                    : (index + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3
              setTab(tabs[next])
              document.getElementById(`product-tab-${next}`)?.focus()
            }}
            tabIndex={tab === name ? 0 : -1}
          >
            {name}
          </button>
        ))}
      </div>
      <div
        id="product-tab-panel"
        role="tabpanel"
        aria-labelledby={`product-tab-${tabs.indexOf(tab)}`}
        tabIndex={0}
      >
        {tab === 'Product facts' ? (
          <>
            <span className="market-badge">Seller-provided information</span>
            <dl className="product-facts">
              {Object.entries({
                Ingredients: product.ingredients || 'Not provided',
                Origin: product.origin || 'Not provided',
                ...product.facts,
              }).map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
            <small>
              Read the delivered label before use. Contact the seller if
              ingredient or allergen information is unclear.
            </small>
          </>
        ) : tab === 'Shipping & returns' ? (
          <>
            <h3>Shipping</h3>
            <p>
              {product.shipping ||
                'Shipping information has not been provided.'}
            </p>
            <h3>Returns</h3>
            <p>
              {product.returns || 'A returns policy has not been provided.'}
            </p>
          </>
        ) : (
          <>
            <h3>{product.seller.name}</h3>
            <p>{product.seller.location}</p>
            <p>
              {product.seller.description ||
                'No seller description has been provided.'}
            </p>
          </>
        )}
      </div>
    </section>
  )
}
