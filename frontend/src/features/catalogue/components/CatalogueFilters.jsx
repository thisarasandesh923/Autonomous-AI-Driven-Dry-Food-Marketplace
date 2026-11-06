import { money } from '../api'
export function CatalogueFilters({ facets, params, update, reset }) {
  function check(key, value, selected) {
    const values = params.getAll(key).filter((item) => item !== String(value))
    if (selected) values.push(String(value))
    update(key, values)
  }
  return (
    <aside className="catalogue-filters" aria-label="Product filters">
      <div className="filter-heading">
        <h2>Filters</h2>
        <button onClick={reset}>Reset all</button>
      </div>
      <fieldset>
        <legend>Category</legend>
        <label>
          <input
            type="checkbox"
            checked={!params.has('category')}
            onChange={() => update('category', [])}
          />
          All foods <span>{facets.eligible_count}</span>
        </label>
        {facets.categories.map((c) => (
          <label key={c.value}>
            <input
              type="checkbox"
              checked={params.getAll('category').includes(c.value)}
              onChange={(e) => check('category', c.value, e.target.checked)}
            />
            {c.value}
            <span>{c.count}</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Price / USD</legend>
        <div className="price-track" />
        <div className="price-inputs">
          <label>
            Minimum
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={(facets.min_price / 100).toFixed(2)}
              value={
                params.has('min_price')
                  ? Number(params.get('min_price')) / 100
                  : ''
              }
              onChange={(e) =>
                update(
                  'min_price',
                  e.target.value === ''
                    ? []
                    : [String(Math.round(Number(e.target.value) * 100))],
                )
              }
            />
          </label>
          <label>
            Maximum
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={(facets.max_price / 100).toFixed(2)}
              value={
                params.has('max_price')
                  ? Number(params.get('max_price')) / 100
                  : ''
              }
              onChange={(e) =>
                update(
                  'max_price',
                  e.target.value === ''
                    ? []
                    : [String(Math.round(Number(e.target.value) * 100))],
                )
              }
            />
          </label>
        </div>
        <small>
          {money(facets.min_price)} – {money(facets.max_price)}
        </small>
      </fieldset>
      <fieldset>
        <legend>Seller</legend>
        {facets.sellers.map((s) => (
          <label key={s.id}>
            <input
              type="checkbox"
              checked={params.getAll('seller').includes(String(s.id))}
              onChange={(e) => check('seller', s.id, e.target.checked)}
            />
            {s.name}
            <span>{s.count}</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Availability</legend>
        <label>
          <input
            type="checkbox"
            checked={params.get('in_stock') !== 'false'}
            onChange={(e) => update('in_stock', [String(e.target.checked)])}
          />
          In stock <span>{facets.in_stock_count}</span>
        </label>
        <label>
          <input type="checkbox" checked disabled />
          UK eligible <span>{facets.eligible_count}</span>
        </label>
        <small>Destination eligibility always applies.</small>
      </fieldset>
      <div className="companion">
        <h3>Not sure where to start?</h3>
        <p>
          Pantry comparisons using seller-provided details will be available in
          a future phase.
        </p>
        <button className="market-outline" disabled>
          Ask the pantry ✧
        </button>
      </div>
    </aside>
  )
}
