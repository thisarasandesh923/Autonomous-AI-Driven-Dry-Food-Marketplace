import { useCallback, useEffect } from 'react'
import { BuyerLayout } from '../../layouts/BuyerLayout'
import { useLocation, navigate } from '../../app/navigation'
import { catalogueApi } from '../../features/catalogue/api'
import { useResource } from '../../api/useResource'
import { ProductCard } from '../../features/catalogue/components/ProductCard'
import { CatalogueFilters } from '../../features/catalogue/components/CatalogueFilters'
import { Notice, RequestState } from '../../components/marketplace/States'

export function CataloguePage() {
  const location = useLocation()
  const query = location.split('?')[1]?.split('#')[0] || ''
  const params = new URLSearchParams(query)
  const requestQuery = query ? `${query}&destination=GB` : 'destination=GB'
  const fetcher = useCallback(
    (signal) => catalogueApi.list(requestQuery, signal),
    [requestQuery],
  )
  const resource = useResource(requestQuery, fetcher)
  useEffect(() => {
    if (!resource.data) return
    const frame = requestAnimationFrame(() =>
      window.scrollTo(0, window.history.state?.scroll || 0),
    )
    return () => cancelAnimationFrame(frame)
  }, [resource.data])
  function update(key, values) {
    const next = new URLSearchParams(query)
    next.delete(key)
    values.forEach((value) => next.append(key, value))
    if (key !== 'page') next.delete('page')
    navigate(`/products?${next}`, { state: { scroll: window.scrollY } })
  }
  return (
    <BuyerLayout>
      <title>Shop pantry · Ceylon Pantry</title>
      <p className="market-breadcrumb">Home / Shop pantry</p>
      <div className="catalogue-heading">
        <div>
          <h1>The island pantry.</h1>
          <p>
            Good ingredients, honest origins. Find something worth bringing
            home.
          </p>
        </div>
        <span className="market-badge">United Kingdom</span>
      </div>
      <form
        className="catalogue-search"
        key={query}
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          update(
            'q',
            [new FormData(e.currentTarget).get('q').trim()].filter(Boolean),
          )
        }}
      >
        <label className="sr-only" htmlFor="catalogue-search">
          Search foods, ingredients or sellers
        </label>
        <span aria-hidden="true">⌕</span>
        <input
          id="catalogue-search"
          name="q"
          defaultValue={params.get('q') || ''}
          placeholder="Search foods, ingredients or sellers"
        />
        <button className="market-primary">Search</button>
      </form>
      <Notice>
        Approved, active products eligible for United Kingdom. All prices in
        USD. Shipping is calculated per seller.
      </Notice>
      {resource.error && (
        <button
          className="market-outline"
          onClick={() => navigate('/products')}
        >
          Reset filters
        </button>
      )}
      <RequestState {...resource} loading={resource.loading && !resource.data}>
        <div className="catalogue-body">
          {resource.data && (
            <>
              <CatalogueFilters
                facets={resource.data.facets}
                params={params}
                update={update}
                reset={() =>
                  navigate('/products', { state: { scroll: window.scrollY } })
                }
              />
              <section aria-label="Product results">
                <div className="catalogue-toolbar" aria-busy={resource.loading}>
                  <p aria-live="polite">
                    {resource.data.total} products ·{' '}
                    {params.getAll('category').join(', ') || 'All foods'}
                  </p>
                  <label>
                    Sort:{' '}
                    <select
                      value={params.get('sort') || 'featured'}
                      onChange={(e) => update('sort', [e.target.value])}
                    >
                      <option value="featured">Featured</option>
                      <option value="price_asc">Price: low to high</option>
                      <option value="price_desc">Price: high to low</option>
                      <option value="name">Name</option>
                    </select>
                  </label>
                </div>
                <div className="filter-chips">
                  <span className="market-badge">United Kingdom</span>
                  {params.get('in_stock') !== 'false' && (
                    <button
                      className="market-badge"
                      onClick={() => update('in_stock', ['false'])}
                    >
                      In stock ×
                    </button>
                  )}
                  {[
                    'q',
                    'category',
                    'seller',
                    'min_price',
                    'max_price',
                  ].flatMap((key) =>
                    params.getAll(key).map((value) => (
                      <button
                        className="market-badge"
                        key={`${key}:${value}`}
                        onClick={() =>
                          update(
                            key,
                            params.getAll(key).filter((v) => v !== value),
                          )
                        }
                      >
                        {key === 'seller'
                          ? resource.data.facets.sellers.find(
                              (s) => String(s.id) === value,
                            )?.name || value
                          : value}{' '}
                        ×
                      </button>
                    )),
                  )}
                  <small>Destination eligibility applied</small>
                </div>
                {!resource.data.items.length ? (
                  <Notice>
                    No foods match your selection. Try another search or reset
                    the filters.
                  </Notice>
                ) : (
                  <div className="product-grid">
                    {resource.data.items.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
                <div className="catalogue-pagination">
                  {resource.data.page > 1 && (
                    <button
                      className="market-outline"
                      onClick={() =>
                        update('page', [String(resource.data.page - 1)])
                      }
                    >
                      Previous
                    </button>
                  )}
                  <span>
                    {resource.data.total
                      ? `Page ${resource.data.page} of ${resource.data.pages}`
                      : 'No results'}
                  </span>
                  {resource.data.page < resource.data.pages && (
                    <button
                      className="market-outline"
                      onClick={() =>
                        update('page', [String(resource.data.page + 1)])
                      }
                    >
                      Next
                    </button>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </RequestState>
    </BuyerLayout>
  )
}
